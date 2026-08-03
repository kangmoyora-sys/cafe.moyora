import "server-only";

export const aiProviders = ["openai", "gemini"] as const;
export type AIProvider = (typeof aiProviders)[number];

export function isAIProvider(value: string): value is AIProvider {
  return aiProviders.includes(value as AIProvider);
}

export function isAIProviderConfigured(provider: AIProvider) {
  if (provider === "openai") {
    return process.env.AI_GENERATION_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
  }

  return process.env.AI_GENERATION_ENABLED === "true" && Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL);
}

export async function generateStructuredText(provider: AIProvider, systemInstruction: string, userPrompt: string) {
  if (!isAIProviderConfigured(provider)) {
    throw new Error(provider === "gemini" ? "Gemini 생성 기능은 아직 설정되지 않았습니다." : "OpenAI 생성 기능은 아직 설정되지 않았습니다.");
  }

  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "content_draft",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: { title: { type: "string" }, body: { type: "string" } },
              required: ["title", "body"],
            },
          },
        },
        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: userPrompt }],
      }),
    });
    if (!response.ok) throw new Error("OpenAI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenAI 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return content;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL!)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!response.ok) throw new Error("Gemini 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> };
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => typeof part.text === "string" ? part.text : "").join("");
  if (!content) throw new Error("Gemini 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return content;
}
