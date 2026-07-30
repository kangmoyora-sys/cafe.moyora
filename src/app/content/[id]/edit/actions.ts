"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isContentDraftId, type DraftStatus } from "@/lib/content-drafts";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type EditDraftFormState = { error?: string };

const lengths = ["short", "medium", "long"] as const;
const tones = ["friendly_informative", "practical_guide"] as const;
const statuses = ["draft", "review", "approved"] as const;

function readRequiredText(formData: FormData, field: string, label: string, maximum: number) {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) return { error: `${label}을(를) 입력해 주세요.` };
  if (value.length > maximum) return { error: `${label}은(는) ${maximum}자 이내로 입력해 주세요.` };
  return { value };
}

export async function updateDraft(id: string, _previousState: EditDraftFormState, formData: FormData): Promise<EditDraftFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isContentDraftId(id)) return { error: "초안을 찾을 수 없거나 접근 권한이 없습니다." };

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
  const status = String(formData.get("status") ?? "") as DraftStatus;
  if (!lengths.includes(length as (typeof lengths)[number])) return { error: "글 길이를 선택해 주세요." };
  if (!tones.includes(tone as (typeof tones)[number])) return { error: "말투를 선택해 주세요." };
  if (!statuses.includes(status)) return { error: "유효한 상태를 선택해 주세요." };

  const supabase = await createClient();
  if (!supabase) return { error: "저장 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";
  if (!isAdmin && status === "approved") return { error: "승인 완료 상태는 관리자만 설정할 수 있습니다." };
  if (!isAdmin && !["draft", "review"].includes(status)) return { error: "editor는 초안 또는 검토 요청 상태만 설정할 수 있습니다." };

  const { data, error } = await supabase
    .from("content_drafts")
    .update({ title: title.value, keyword: keyword.value, purpose: purpose.value, length, tone, body: body.value, status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "초안을 수정하지 못했습니다. 접근 권한과 입력 내용을 확인해 주세요." };

  revalidatePath("/dashboard");
  revalidatePath("/content");
  revalidatePath(`/content/${id}`);
  revalidatePath("/admin");
  redirect(`/content/${id}?updated=1`);
}
