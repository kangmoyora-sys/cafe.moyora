import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getOpenAITextModels } from "@/lib/ai-provider";
import { getContentGuides } from "@/lib/content-guides";
import { getCurrentUser } from "@/lib/supabase/server";
import { DraftForm } from "./draft-form";

export default async function NewContentPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const guides = await getContentGuides();
  const textModels = getOpenAITextModels();
  return <AppShell email={user.email ?? "로그인 사용자"} title="새 콘텐츠 작성" description="작성 가이드를 선택해 AI 초안의 품질 기준을 정하세요.">
    <DraftForm guides={guides} textModels={textModels} />
  </AppShell>;
}
