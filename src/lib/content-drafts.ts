import { createClient } from "@/lib/supabase/server";

export type ContentDraft = {
  id: string;
  user_id: string;
  title: string;
  keyword: string;
  purpose: string;
  length: "short" | "medium" | "long";
  tone: "friendly_informative" | "practical_guide";
  body: string;
  status: "draft";
  created_at: string;
  updated_at: string;
};

export async function getContentDrafts(limit?: number) {
  const supabase = await createClient();

  if (!supabase) return [] as ContentDraft[];

  let query = supabase
    .from("content_drafts")
    .select("id, user_id, title, keyword, purpose, length, tone, body, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return [] as ContentDraft[];

  return data as ContentDraft[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isContentDraftId(value: string) {
  return uuidPattern.test(value);
}

export async function getContentDraftById(id: string) {
  if (!isContentDraftId(id)) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("content_drafts")
    .select("id, user_id, title, keyword, purpose, length, tone, body, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ContentDraft;
}

export function formatDraftDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const draftLengthLabels = {
  short: "짧게",
  medium: "보통",
  long: "길게",
} as const;

export const draftToneLabels = {
  friendly_informative: "친근한 정보형",
  practical_guide: "실용적인 가이드형",
} as const;
