import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getContentDraftById } from "@/lib/content-drafts";
import { getCurrentUser } from "@/lib/supabase/server";
import { DraftEditForm } from "./draft-edit-form";

function DraftAccessNotice({ email }: { email: string }) {
  return <AppShell email={email} title="초안 수정"><section className="max-w-2xl rounded-xl border border-stone-200 bg-white p-8 text-center"><p className="font-semibold">초안을 찾을 수 없거나 접근 권한이 없습니다.</p><Link href="/content" className="mt-5 inline-block text-sm font-semibold text-emerald-700">내 초안 목록으로 돌아가기 →</Link></section></AppShell>;
}

export default async function ContentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const draft = await getContentDraftById(id);
  const email = user.email ?? "로그인 사용자";

  if (!draft) return <DraftAccessNotice email={email} />;

  return (
    <AppShell email={email} title="초안 수정" description="초안 내용을 수정한 뒤 저장하세요.">
      <div className="mb-6"><Link href={`/content/${draft.id}`} className="text-sm font-semibold text-emerald-700">← 초안 상세로 돌아가기</Link></div>
      <DraftEditForm draft={draft} />
    </AppShell>
  );
}
