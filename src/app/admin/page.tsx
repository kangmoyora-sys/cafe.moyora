import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function AdminPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const supabase = await createClient();
  const { data: profile } = supabase ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard?notice=admin-only");
  return <AppShell email={user.email ?? "관리자"} title="관리자" description="사용자와 게시 이력을 관리합니다.">
    <div className="grid gap-5 md:grid-cols-2"><section className="rounded-xl border border-dashed border-stone-300 bg-white p-7"><h2 className="font-bold">사용자</h2><p className="mt-2 text-sm text-stone-500">표시할 사용자가 아직 없습니다.</p></section><section className="rounded-xl border border-dashed border-stone-300 bg-white p-7"><h2 className="font-bold">게시 이력</h2><p className="mt-2 text-sm text-stone-500">아직 게시 이력이 없습니다.</p></section></div>
  </AppShell>;
}
