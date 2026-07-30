import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUserRole } from "@/lib/auth";
import {
  getNaverOAuthConfig,
  isNaverOAuthTokenExpired,
  naverOAuthConfigurationMessage,
} from "@/lib/naver-oauth";
import { createClient } from "@/lib/supabase/server";

const allowedNotices = {
  connected: "네이버 계정 연결이 완료되었습니다.",
  "connection-failed": "네이버 계정 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  "not-configured": naverOAuthConfigurationMessage,
} as const;

export default async function NaverSettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const current = await getCurrentUserRole();
  if (!current) redirect("/login");
  if (current.role !== "admin") redirect("/dashboard?notice=admin-only");

  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const configReady = Boolean(getNaverOAuthConfig());
  const publishingEnabled = process.env.NAVER_PUBLISHING_ENABLED === "true";
  const { data: connection } = supabase && configReady ? await supabase
    .from("naver_oauth_connections")
    .select("owner_user_id, token_expires_at, connected_at, updated_at, disconnected_at")
    .eq("owner_user_id", current.user.id)
    .maybeSingle() : { data: null };

  const expired = isNaverOAuthTokenExpired(connection?.token_expires_at ?? null);
  const status = !configReady ? "not-configured" : !connection ? "disconnected" : connection.disconnected_at || expired ? "reconnect" : "connected";
  const statusMessage = status === "not-configured" ? naverOAuthConfigurationMessage : status === "disconnected" ? "네이버 계정이 아직 연결되지 않았습니다." : status === "reconnect" ? "네이버 계정 재연결이 필요합니다." : "네이버 계정 연결이 완료되었습니다.";
  const notice = params.notice && params.notice in allowedNotices ? allowedNotices[params.notice as keyof typeof allowedNotices] : null;

  return <AppShell email={current.user.email ?? "관리자"} title="네이버 카페 연동" description="관리자 전용 연결 상태를 확인합니다.">
    <div className="max-w-2xl space-y-6">
      {notice && <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
      <section className="rounded-xl border border-stone-200 bg-white p-7"><p className="text-lg font-bold">{statusMessage}</p><p className="mt-2 text-sm text-stone-600">연결 상태만 표시하며, 토큰·암호문·시크릿·정확한 만료 시각은 화면에 표시하지 않습니다.</p>{configReady && <a href="/api/naver/connect" className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white">네이버 연결</a>}</section>
      {!publishingEnabled && <p className="rounded-lg bg-stone-100 p-4 text-sm text-stone-700">보안을 위해 실제 네이버 카페 발행은 현재 비활성 상태입니다.</p>}
      <section className="rounded-xl border border-stone-200 bg-white p-6"><h2 className="font-bold">승인 완료 콘텐츠</h2><p className="mt-2 text-sm text-stone-600">승인 완료(approved) 콘텐츠만 향후 발행 대상이 될 수 있습니다. 이 화면에서는 실제 발행이나 네이버 카페 API 호출을 수행하지 않습니다.</p></section>
    </div>
  </AppShell>;
}
