"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { defaultWritingGuideTitle } from "@/lib/default-writing-guide";
import { createClient } from "@/lib/supabase/server";

export type GuideFormState = { error?: string; success?: string };

function readText(formData: FormData, field: string, label: string, maximum: number) {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) return { error: `${label}을(를) 입력해 주세요.` };
  if (value.length > maximum) return { error: `${label}은(는) ${maximum}자 이내로 입력해 주세요.` };
  return { value };
}

async function getAdminClient() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "작성 가이드 관리 권한이 없습니다." } as const;
  const supabase = await createClient();
  if (!supabase) return { error: "저장 설정을 확인할 수 없습니다." } as const;
  return { admin, supabase } as const;
}

export async function createContentGuide(_previous: GuideFormState, formData: FormData): Promise<GuideFormState> {
  const context = await getAdminClient();
  if ("error" in context) return context;
  const title = readText(formData, "title", "가이드 이름", 100);
  const instructions = readText(formData, "instructions", "작성 가이드", 5000);
  if ("error" in title) return title;
  if ("error" in instructions) return instructions;

  const { error } = await context.supabase.from("content_guides").insert({
    title: title.value,
    instructions: instructions.value,
    created_by: context.admin.user.id,
  });
  if (error) return { error: "작성 가이드를 저장하지 못했습니다." };

  revalidatePath("/settings/guides");
  revalidatePath("/content/new");
  return { success: "작성 가이드를 저장했습니다." };
}

export async function updateContentGuide(_previous: GuideFormState, formData: FormData): Promise<GuideFormState> {
  const context = await getAdminClient();
  if ("error" in context) return context;
  const id = String(formData.get("id") ?? "");
  const title = readText(formData, "title", "가이드 이름", 100);
  const instructions = readText(formData, "instructions", "작성 가이드", 5000);
  if (!id) return { error: "수정할 가이드를 찾을 수 없습니다." };
  if ("error" in title) return title;
  if ("error" in instructions) return instructions;

  const { error } = await context.supabase
    .from("content_guides")
    .update({ title: title.value, instructions: instructions.value, is_active: formData.get("is_active") === "on" })
    .eq("id", id);
  if (error) return { error: "작성 가이드를 수정하지 못했습니다." };

  revalidatePath("/settings/guides");
  revalidatePath("/content/new");
  return { success: "작성 가이드를 수정했습니다." };
}

export async function updateDefaultContentGuide(_previous: GuideFormState, formData: FormData): Promise<GuideFormState> {
  const context = await getAdminClient();
  if ("error" in context) return context;
  const instructions = readText(formData, "instructions", "기본 작성 방식", 5000);
  if ("error" in instructions) return instructions;

  const { data: existing } = await context.supabase.from("content_guides").select("id").eq("title", defaultWritingGuideTitle).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const result = existing
    ? await context.supabase.from("content_guides").update({ instructions: instructions.value, is_active: true }).eq("id", existing.id)
    : await context.supabase.from("content_guides").insert({ title: defaultWritingGuideTitle, instructions: instructions.value, is_active: true, created_by: context.admin.user.id });
  if (result.error) return { error: "기본 작성 방식을 저장하지 못했습니다." };
  revalidatePath("/settings/guides");
  revalidatePath("/content/new");
  return { success: "기본 작성 방식을 저장했습니다. 새 AI 초안부터 적용됩니다." };
}
