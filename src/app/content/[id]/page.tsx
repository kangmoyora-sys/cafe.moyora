import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { draftLengthLabels, draftStatusClasses, draftStatusLabels, draftToneLabels, formatDraftDate, getContentDraftById } from "@/lib/content-drafts";
import { getCurrentUser } from "@/lib/supabase/server";

function DraftAccessNotice({ email }: { email: string }) {
  return <AppShell email={email} title="초안 상세"><section className="max-w-2xl rounded-xl border border-stone-200 bg-white p-8 text-center"><p className="font-semibold">초안을 찾을 수 없거나 접근 권한이 없습니다.</p><Link href="/content" className="mt-5 inline-block text-sm font-semibold text-emerald-700">내 초안 목록으로 돌아가기 →</Link></section></AppShell>;
}

export default async function ContentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ updated?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ id }, { updated }] = await Promise.all([params, searchParams]);
  const draft = await getContentDraftById(id);
  const email = user.email ?? "로그인 사용자";
  if (!draft) return <DraftAccessNotice email={email} />;

  return <AppShell email={email} title="초안 상세" description="저장한 콘텐츠 초안을 확인합니다.">
    {updated === "1" && <p className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">초안을 수정했습니다.</p>}
    <div className="mb-6 flex flex-wrap justify-between gap-3"><Link href="/content" className="text-sm font-semibold text-emerald-700">← 내 초안 목록</Link><Link href={`/content/${draft.id}/edit`} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">수정하기</Link></div>
    <article className="max-w-3xl rounded-xl border border-stone-200 bg-white p-6">
      <div className="border-b border-stone-100 pb-6"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${draftStatusClasses[draft.status]}`}>{draftStatusLabels[draft.status]}</span><h2 className="mt-3 text-2xl font-bold">{draft.title}</h2></div>
      <dl className="grid gap-5 py-6 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold text-stone-500">키워드</dt><dd className="mt-1">{draft.keyword}</dd></div><div><dt className="text-xs font-semibold text-stone-500">작성 목적</dt><dd className="mt-1">{draft.purpose}</dd></div><div><dt className="text-xs font-semibold text-stone-500">분량</dt><dd className="mt-1">{draftLengthLabels[draft.length]}</dd></div><div><dt className="text-xs font-semibold text-stone-500">톤</dt><dd className="mt-1">{draftToneLabels[draft.tone]}</dd></div><div><dt className="text-xs font-semibold text-stone-500">글 생성 AI</dt><dd className="mt-1">{draft.ai_provider === "gemini" ? "Google Gemini" : "OpenAI"}</dd></div><div><dt className="text-xs font-semibold text-stone-500">작성 가이드</dt><dd className="mt-1">{draft.writing_guide_title ?? "기본 작성 방식"}</dd></div><div><dt className="text-xs font-semibold text-stone-500">상태</dt><dd className="mt-1">{draftStatusLabels[draft.status]}</dd></div><div><dt className="text-xs font-semibold text-stone-500">작성자</dt><dd className="mt-1">{draft.user_id === user.id ? "나" : `사용자 ${draft.user_id.slice(0, 8)}`}</dd></div><div><dt className="text-xs font-semibold text-stone-500">생성일</dt><dd className="mt-1">{formatDraftDate(draft.created_at)}</dd></div><div><dt className="text-xs font-semibold text-stone-500">수정일</dt><dd className="mt-1">{formatDraftDate(draft.updated_at)}</dd></div>
      </dl>
      {draft.writing_guide_instructions && <section className="border-t border-stone-100 pt-6"><h3 className="text-sm font-semibold text-stone-500">적용된 작성 기준</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{draft.writing_guide_instructions}</p></section>}
      {draft.images.length > 0 && <section className="mt-6 border-t border-stone-100 pt-6"><h3 className="text-sm font-semibold text-stone-500">선택한 이미지</h3><div className="mt-3 grid gap-4 sm:grid-cols-2">{draft.images.map((image) => <figure key={image.id} className="overflow-hidden rounded-lg border border-stone-200 bg-white"><img src={image.url} alt={image.alt} className="h-52 w-full object-cover" /><figcaption className="p-3 text-xs text-stone-600">{image.attribution && image.attributionUrl ? <a href={image.attributionUrl} target="_blank" rel="noreferrer" className="text-emerald-800 hover:underline">{image.attribution}</a> : image.kind === "generated" ? "AI 생성 이미지" : "업로드한 이미지"}</figcaption></figure>)}</div></section>}
      <section className="mt-6 border-t border-stone-100 pt-6"><h3 className="text-sm font-semibold text-stone-500">본문</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-stone-800">{draft.body}</p></section>
    </article>
  </AppShell>;
}
