import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentAdmin } from "@/lib/auth";
import { getContentGuides } from "@/lib/content-guides";
import { GuideManager } from "./guide-manager";

export default async function ContentGuidesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/dashboard?notice=admin-only");
  const guides = await getContentGuides(true);
  return <AppShell email={admin.user.email ?? "관리자"} title="작성 가이드" description="AI 초안의 품질 기준을 만들고 관리합니다."><GuideManager guides={guides} /></AppShell>;
}
