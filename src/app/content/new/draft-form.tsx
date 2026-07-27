"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveDraft, type DraftFormState } from "./actions";

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

export function DraftForm() {
  const [state, formAction] = useActionState(saveDraft, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <label className="block text-sm font-semibold">
        제목
        <input name="title" required maxLength={200} placeholder="예: 아이와 함께 떠나는 여름 여행" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <label className="block text-sm font-semibold">
        키워드
        <input name="keyword" required maxLength={100} placeholder="예: 여름 가족여행" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <label className="block text-sm font-semibold">
        작성 목적
        <textarea name="purpose" required maxLength={1000} placeholder="이 글로 전달하고 싶은 내용을 입력하세요." rows={4} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">글 길이</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label><input defaultChecked type="radio" name="length" value="short" /> 짧게</label>
          <label><input type="radio" name="length" value="medium" /> 보통</label>
          <label><input type="radio" name="length" value="long" /> 길게</label>
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold">말투</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label><input defaultChecked type="radio" name="tone" value="friendly_informative" /> 친근한 정보형</label>
          <label><input type="radio" name="tone" value="practical_guide" /> 실용적인 가이드형</label>
        </div>
      </fieldset>
      <label className="block text-sm font-semibold">
        본문
        <textarea name="body" required maxLength={10000} placeholder="직접 작성한 초안 본문을 입력하세요." rows={10} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="text-xs text-stone-500">AI 생성이나 네이버 발행 없이 작성한 초안만 저장합니다.</p>
      </div>
    </form>
  );
}
