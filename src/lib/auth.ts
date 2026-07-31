import "server-only";

import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type CurrentUserRole = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  role: "admin" | "editor" | null;
};

export async function getCurrentUserRole(): Promise<CurrentUserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role === "admin" || profile?.role === "editor" ? profile.role : null;
  return { user, role };
}

export async function getCurrentAdmin() {
  const current = await getCurrentUserRole();
  return current?.role === "admin" ? current : null;
}
