"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { ContentGuide } from "@/lib/content-guides";
import { generateAIDraft, saveDraft, type DraftFormState } from "./actions";

const initialState: DraftFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "초안 저장 중…" : "초안 저장"}
    </button>
  );
}

export function DraftForm({ guides }: { guides: ContentGuide[] }) {
  const [state, formAction] = useActionState(saveDraft, initialState);
  const [isGenerating, startGenerating] = useTransition();
  const [generationMessage, setGenerationMessage] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [purpose, setPurpose] = useState("");
  const [length, setLength] = useState("short");
  const [tone, setTone] = useState("friendly_informative");
  const [writingGuideId, setWritingGuideId] = useState("");
  const [writingGuideNotes, setWritingGuideNotes] = useState("");
  const [body, setBody] = useState("");

  function handleAIGeneration() {
    if ((title.trim() || body.trim()) && !window.confirm("AI 생성 결과가 현재 제목과 본문을 덮어씁니다. 계속할까요?")) return;

    setGenerationError("");
    setGenerationMessage("");
    const formData = new FormData();
    formData.set("keyword", keyword);
    formData.set("purpose", purpose);
    formData.set("length", length);
    formData.set("tone", tone);
    formData.set("writingGuideId", writingGuideId);
    formData.set("writingGuideNotes", writingGuideNotes);

    startGenerating(async () => {
      const result = await generateAIDraft(formData);
      if (result.error) {
        setGenerationError(result.error);
        return;
      }

      setTitle(result.title ?? "");
      setBody(result.body ?? "");
      setGenerationMessage("AI 초안이 입력되었습니다. 사실관계와 최신 정보는 반드시 검토하세요.");
    });
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <label className="block text-sm font-semibold">
        제목
        <input name="title" required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 아이와 함께 떠나는 여름 여행" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <label className="block text-sm font-semibold">
        키워드
        <input name="keyword" required maxLength={100} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="예: 여름 가족여행" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <label className="block text-sm font-semibold">
        작성 목적
        <textarea name="purpose" required maxLength={1000} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="이 글로 전달하고 싶은 내용을 입력하세요." rows={4} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">글 길이</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label><input type="radio" name="length" value="short" checked={length === "short"} onChange={() => setLength("short")} /> 짧게</label>
          <label><input type="radio" name="length" value="medium" checked={length === "medium"} onChange={() => setLength("medium")} /> 보통</label>
          <label><input type="radio" name="length" value="long" checked={length === "long"} onChange={() => setLength("long")} /> 길게</label>
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold">말투</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label><input type="radio" name="tone" value="friendly_informative" checked={tone === "friendly_informative"} onChange={() => setTone("friendly_informative")} /> 친근한 정보형</label>
          <label><input type="radio" name="tone" value="practical_guide" checked={tone === "practical_guide"} onChange={() => setTone("practical_guide")} /> 실용적인 가이드형</label>
        </div>
      </fieldset>
      <section className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
        <label className="block text-sm font-semibold">
          작성 가이드
          <select name="writingGuideId" value={writingGuideId} onChange={(event) => setWritingGuideId(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5">
            <option value="">기본 작성 방식 사용</option>
            {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.title}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold">
          이번 글의 추가 지시 <span className="font-normal text-stone-500">(선택)</span>
          <textarea name="writingGuideNotes" maxLength={2000} value={writingGuideNotes} onChange={(event) => setWritingGuideNotes(event.target.value)} placeholder="예: 초보자도 바로 실행할 수 있도록 체크리스트를 포함해 주세요." rows={4} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5" />
        </label>
        <p className="mt-2 text-xs text-stone-600">선택한 가이드는 AI 초안 생성과 저장되는 초안에 함께 적용됩니다. 가이드는 관리자 화면에서 관리할 수 있습니다.</p>
      </section>
      <label className="block text-sm font-semibold">
        본문
        <textarea name="body" required maxLength={10000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="직접 작성한 초안 본문을 입력하세요." rows={10} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {generationError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{generationError}</p>}
      {generationMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{generationMessage}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={handleAIGeneration} disabled={isGenerating} className="rounded-lg border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60">{isGenerating ? "AI 초안 생성 중…" : "AI 초안 생성"}</button>
        <SubmitButton />
        <p className="text-xs text-stone-500">AI 생성 결과는 저장되지 않으며, 내용을 검토한 뒤 초안 저장을 눌러야 합니다.</p>
      </div>
    </form>
  );
}
