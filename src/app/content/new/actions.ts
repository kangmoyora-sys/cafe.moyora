"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type DraftFormState = { error?: string };

const lengths = ["short", "medium", "long"] as const;
const tones = ["friendly_informative", "practical_guide"] as const;

function readRequiredText(formData: FormData, field: string, label: string, maximum: number) {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) return { error: `${label}을(를) 입력해 주세요.` };
  if (value.length > maximum) return { error: `${label}은(는) ${maximum}자 이내로 입력해 주세요.` };
  return { value };
}

export async function saveDraft(_previousState: DraftFormState, formData: FormData): Promise<DraftFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = readRequiredText(formData, "title", "제목", 200);
  const keyword = readRequiredText(formData, "keyword", "키워드", 100);
  const purpose = readRequiredText(formData, "purpose", "작성 목적", 1000);
  const body = readRequiredText(formData, "body", "본문", 10000);

  if ("error" in title) return title;
  if ("error" in keyword) return keyword;
  if ("error" in purpose) return purpose;
  if ("error" in body) return body;

  const length = String(formData.get("length") ?? "");
  const tone = String(formData.get("tone") ?? "");
  if (!lengths.includes(length as (typeof lengths)[number])) return { error: "글 길이를 선택해 주세요." };
  if (!tones.includes(tone as (typeof tones)[number])) return { error: "말투를 선택해 주세요." };

  const supabase = await createClient();
  if (!supabase) return { error: "저장 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요." };

  const { error } = await supabase.from("content_drafts").insert({
    title: title.value,
    keyword: keyword.value,
    purpose: purpose.value,
    length,
    tone,
    body: body.value,
    status: "draft",
  });

  if (error) return { error: "초안을 저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요." };

  revalidatePath("/dashboard");
  revalidatePath("/content");
  revalidatePath("/admin");
  redirect("/content?created=1");
}
