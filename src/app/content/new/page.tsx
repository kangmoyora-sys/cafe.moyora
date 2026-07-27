import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/supabase/server";
import { DraftForm } from "./draft-form";

export default async function NewContentPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  return <AppShell email={user.email ?? "로그인 사용자"} title="새 콘텐츠 작성" description="초안 생성을 위한 기본 정보를 입력하세요.">
    <DraftForm />
  </AppShell>;
}
