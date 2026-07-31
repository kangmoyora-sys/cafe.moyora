import { createClient } from "@/lib/supabase/server";

export type ContentGuide = {
  id: string;
  title: string;
  instructions: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const guideColumns = "id, title, instructions, is_active, created_by, created_at, updated_at";

export async function getContentGuides(includeInactive = false) {
  const supabase = await createClient();
  if (!supabase) return [] as ContentGuide[];

  let query = supabase.from("content_guides").select(guideColumns).order("updated_at", { ascending: false });
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) return [] as ContentGuide[];
  return data as ContentGuide[];
}

export async function getActiveContentGuide(id: string) {
  const supabase = await createClient();
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("content_guides")
    .select(guideColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as ContentGuide;
}
