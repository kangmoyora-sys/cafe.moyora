import "server-only";

const modelNamePattern = /^[A-Za-z0-9._:-]{1,100}$/;

export function getOpenAITextModels() {
  const configuredModels = (process.env.OPENAI_TEXT_MODELS ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter((model) => modelNamePattern.test(model));
  const fallbackModel = (process.env.OPENAI_MODEL ?? "").trim();
  const models = configuredModels.length > 0 ? configuredModels : modelNamePattern.test(fallbackModel) ? [fallbackModel] : [];
  return [...new Set(models)].slice(0, 8);
}

export function isOpenAITextModelConfigured(model: string) {
  return process.env.AI_GENERATION_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY) && getOpenAITextModels().includes(model);
}

export async function generateStructuredText(model: string, systemInstruction: string, userPrompt: string) {
  if (!isOpenAITextModelConfigured(model)) throw new Error("선택한 GPT 모델은 아직 설정되지 않았습니다.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "content_draft",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              body: { type: "string" },
              imageSearchQueries: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
              imagePlacementIndexes: { type: "array", items: { type: "integer", minimum: 0, maximum: 100 }, minItems: 1, maxItems: 3 },
              imageGenerationPrompt: { type: "string" },
            },
            required: ["title", "body", "imageSearchQueries", "imagePlacementIndexes", "imageGenerationPrompt"],
          },
        },
      },
      messages: [{ role: "system", content: systemInstruction }, { role: "user", content: userPrompt }],
    }),
  });
  if (!response.ok) throw new Error("GPT 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("GPT 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return content;
}
