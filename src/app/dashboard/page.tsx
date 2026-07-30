import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { formatDraftDate, getContentDrafts } from "@/lib/content-drafts";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const { notice } = await searchParams;
  const drafts = await getContentDrafts(5);
  return <AppShell email={user.email ?? "로그인 사용자"} title="콘텐츠 대시보드" description="네이버 카페 게시글 초안을 한곳에서 준비하세요.">
    {notice === "admin-only" && <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">관리자 전용 메뉴입니다.</p>}
    <div className="grid gap-5 md:grid-cols-2"><section className="rounded-xl border border-stone-200 bg-white p-6"><p className="text-sm text-stone-500">네이버 계정 연결</p><p className="mt-3 text-xl font-bold">미연결</p><p className="mt-2 text-sm text-stone-600">계정을 연결하면 카페 게시를 준비할 수 있습니다.</p><Link href="/settings/naver" className="mt-5 inline-block text-sm font-semibold text-emerald-700">연결 설정 보기 →</Link></section>
    <section className="rounded-xl bg-emerald-700 p-6 text-white"><p className="text-sm text-emerald-100">새 게시글 초안</p><h2 className="mt-3 text-xl font-bold">아이디어를 콘텐츠로 시작하세요</h2><Link href="/content/new" className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-emerald-800">새 콘텐츠 작성</Link></section></div>
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4"><h2 className="font-bold">최근 콘텐츠</h2><Link href="/content" className="text-sm font-semibold text-emerald-700">내 초안 목록 →</Link></div>
      {drafts.length === 0 ? <p className="mt-4 text-sm text-stone-500">아직 작성된 콘텐츠가 없습니다. 첫 초안을 만들어 보세요.</p> : <ul className="mt-4 divide-y divide-stone-100">{drafts.map((draft) => <li key={draft.id} className="flex items-center justify-between gap-4 py-3"><div><Link href={`/content/${draft.id}`} className="font-medium text-stone-900 hover:text-emerald-700 hover:underline">{draft.title}</Link><p className="mt-1 text-xs text-stone-500">{draft.keyword} · 초안</p></div><time className="shrink-0 text-xs text-stone-500">{formatDraftDate(draft.updated_at)}</time></li>)}</ul>}
    </section>
  </AppShell>;
}
