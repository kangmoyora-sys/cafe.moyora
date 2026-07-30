import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function NaverSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = supabase ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (profile?.role !== "admin") redirect("/dashboard?notice=admin-only");

  const settings = [
    { label: "NAVER_CLIENT_ID", configured: Boolean(process.env.NAVER_CLIENT_ID) },
    { label: "NAVER_CLIENT_SECRET", configured: Boolean(process.env.NAVER_CLIENT_SECRET) },
    { label: "NAVER_CALLBACK_URL", configured: Boolean(process.env.NAVER_CALLBACK_URL) },
    { label: "NAVER_CAFE_CLUB_ID", configured: Boolean(process.env.NAVER_CAFE_CLUB_ID) },
    { label: "NAVER_CAFE_MENU_ID", configured: Boolean(process.env.NAVER_CAFE_MENU_ID) },
    { label: "NAVER_PUBLISHING_ENABLED", configured: Boolean(process.env.NAVER_PUBLISHING_ENABLED) },
  ];
  const publishingEnabled = process.env.NAVER_PUBLISHING_ENABLED === "true";
  const isReady = settings.slice(0, 5).every((setting) => setting.configured) && publishingEnabled;

  return (
    <AppShell email={user.email ?? "관리자"} title="네이버 카페 연동 준비" description="실제 값 없이 연동 준비 상태만 확인합니다.">
      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold">연동 준비 상태</h2>
          <p className={`mt-3 rounded-lg p-4 text-sm ${isReady ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
            {isReady ? "네이버 카페 연동 준비가 완료되었습니다. 실제 발행 기능은 별도 검증 후 활성화됩니다." : "네이버 카페 연동 설정이 아직 완료되지 않았습니다."}
          </p>
          {!publishingEnabled && <p className="mt-3 rounded-lg bg-stone-100 p-4 text-sm text-stone-700">보안을 위해 실제 네이버 카페 발행은 현재 비활성 상태입니다.</p>}
        </section>

        <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-6 py-4"><h2 className="font-bold">서버 설정 확인</h2><p className="mt-1 text-xs text-stone-500">보안을 위해 값은 표시하지 않고 설정 여부만 표시합니다.</p></div>
          <ul className="divide-y divide-stone-100">
            {settings.map((setting) => <li key={setting.label} className="flex items-center justify-between gap-4 px-6 py-4"><span className="font-mono text-sm text-stone-700">{setting.label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${setting.configured ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"}`}>{setting.configured ? "설정됨" : "미설정"}</span></li>)}
          </ul>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6"><h2 className="font-bold">승인 완료 콘텐츠</h2><p className="mt-2 text-sm text-stone-600">승인 완료 상태의 콘텐츠는 향후 네이버 카페 발행 대상 후보입니다. 이 화면에서는 실제 로그인, 토큰 저장, 게시글 전송을 수행하지 않습니다.</p></section>
      </div>
    </AppShell>
  );
}
