import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { draftStatusLabels, formatDraftDate, getContentDrafts } from "@/lib/content-drafts";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function AdminPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const supabase = await createClient();
  const { data: profile } = supabase ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard?notice=admin-only");
  const drafts = await getContentDrafts();
  return <AppShell email={user.email ?? "관리자"} title="관리자" description="사용자와 게시 이력을 관리합니다.">
    <div className="grid gap-5 md:grid-cols-2"><section className="rounded-xl border border-dashed border-stone-300 bg-white p-7"><h2 className="font-bold">사용자</h2><p className="mt-2 text-sm text-stone-500">표시할 사용자가 아직 없습니다.</p></section><section className="rounded-xl border border-dashed border-stone-300 bg-white p-7"><h2 className="font-bold">게시 이력</h2><p className="mt-2 text-sm text-stone-500">아직 게시 이력이 없습니다.</p></section></div>
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6"><h2 className="font-bold">전체 초안</h2>{drafts.length === 0 ? <p className="mt-2 text-sm text-stone-500">저장된 초안이 없습니다.</p> : <ul className="mt-4 divide-y divide-stone-100">{drafts.map((draft) => <li key={draft.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{draft.title}</p><p className="mt-1 text-xs text-stone-500">작성자 {draft.user_id.slice(0, 8)} · {draftStatusLabels[draft.status]}</p></div><time className="shrink-0 text-xs text-stone-500">{formatDraftDate(draft.updated_at)}</time></li>)}</ul>}</section>
  </AppShell>;
}
