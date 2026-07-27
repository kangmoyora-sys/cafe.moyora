import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { formatDraftDate, getContentDrafts } from "@/lib/content-drafts";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [drafts, { created }] = await Promise.all([getContentDrafts(), searchParams]);

  return (
    <AppShell email={user.email ?? "로그인 사용자"} title="내 초안 목록" description="저장한 콘텐츠 초안을 확인합니다.">
      {created === "1" && <p className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">초안을 저장했습니다.</p>}
      <div className="mb-6 flex justify-end">
        <Link href="/content/new" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">새 콘텐츠 작성</Link>
      </div>
      {drafts.length === 0 ? (
        <section className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <h2 className="font-bold">저장된 초안이 없습니다</h2>
          <p className="mt-2 text-sm text-stone-500">새 콘텐츠를 작성해 첫 초안을 저장해 보세요.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-50 text-stone-600"><tr><th className="px-5 py-3 font-semibold">제목</th><th className="px-5 py-3 font-semibold">작성자</th><th className="px-5 py-3 font-semibold">상태</th><th className="px-5 py-3 font-semibold">수정일</th></tr></thead>
              <tbody>
                {drafts.map((draft) => <tr key={draft.id} className="border-t border-stone-100"><td className="px-5 py-4 font-medium text-stone-900">{draft.title}</td><td className="px-5 py-4 text-stone-600">{draft.user_id === user.id ? "나" : `사용자 ${draft.user_id.slice(0, 8)}`}</td><td className="px-5 py-4"><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">초안</span></td><td className="px-5 py-4 text-stone-600">{formatDraftDate(draft.updated_at)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  );
}
