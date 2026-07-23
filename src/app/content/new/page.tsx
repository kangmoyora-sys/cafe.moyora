import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function NewContentPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  return <AppShell email={user.email ?? "로그인 사용자"} title="새 콘텐츠 작성" description="초안 생성을 위한 기본 정보를 입력하세요.">
    <form className="max-w-2xl space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <label className="block text-sm font-semibold">키워드<input placeholder="예: 여름 가족여행" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      <label className="block text-sm font-semibold">작성 목적<textarea placeholder="이 글로 전달하고 싶은 내용을 입력하세요." rows={4} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      <fieldset><legend className="text-sm font-semibold">글 길이</legend><div className="mt-2 flex gap-4 text-sm"><label><input defaultChecked type="radio" name="length" /> 짧게</label><label><input type="radio" name="length" /> 보통</label><label><input type="radio" name="length" /> 길게</label></div></fieldset>
      <fieldset><legend className="text-sm font-semibold">말투</legend><div className="mt-2 flex gap-4 text-sm"><label><input defaultChecked type="radio" name="tone" /> 친근한 정보형</label><label><input type="radio" name="tone" /> 실용적인 가이드형</label></div></fieldset>
      <button type="button" disabled className="rounded-lg bg-stone-300 px-5 py-3 text-sm font-bold text-stone-600">검색하고 초안 만들기 · 준비 중</button>
      <p className="text-xs text-stone-500">이 단계에서는 검색 및 AI 초안 생성 기능을 제공하지 않습니다.</p>
    </form>
  </AppShell>;
}
