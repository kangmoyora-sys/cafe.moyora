import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function NaverSettingsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  return <AppShell email={user.email ?? "로그인 사용자"} title="네이버 계정 연결" description="네이버 카페 연결 상태를 확인합니다.">
    <section className="max-w-2xl rounded-xl border border-stone-200 bg-white p-7"><p className="text-lg font-bold">현재 네이버 계정이 연결되지 않았습니다</p><p className="mt-2 text-sm text-stone-600">연결 후 모여라 네이버 카페의 게시글 발행을 준비할 수 있습니다.</p><button type="button" className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white">네이버 계정 연결 · 준비 중</button><p className="mt-3 text-xs text-stone-500">이번 단계에서는 실제 OAuth 연결을 수행하지 않습니다.</p></section>
  </AppShell>;
}
