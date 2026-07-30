"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ContentDraft } from "@/lib/content-drafts";
import { updateDraft, type EditDraftFormState } from "./actions";

const initialState: EditDraftFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "저장 중…" : "수정 저장"}</button>;
}

export function DraftEditForm({ draft }: { draft: ContentDraft }) {
  const [state, formAction] = useActionState(updateDraft.bind(null, draft.id), initialState);
  const [values, setValues] = useState({ title: draft.title, keyword: draft.keyword, purpose: draft.purpose, length: draft.length, tone: draft.tone, body: draft.body, status: draft.status });

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <label className="block text-sm font-semibold">제목<input name="title" required maxLength={200} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      <label className="block text-sm font-semibold">키워드<input name="keyword" required maxLength={100} value={values.keyword} onChange={(event) => setValues({ ...values, keyword: event.target.value })} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      <label className="block text-sm font-semibold">작성 목적<textarea name="purpose" required maxLength={1000} rows={4} value={values.purpose} onChange={(event) => setValues({ ...values, purpose: event.target.value })} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      <fieldset><legend className="text-sm font-semibold">글 길이</legend><div className="mt-2 flex flex-wrap gap-4 text-sm"><label><input type="radio" name="length" value="short" checked={values.length === "short"} onChange={() => setValues({ ...values, length: "short" })} /> 짧게</label><label><input type="radio" name="length" value="medium" checked={values.length === "medium"} onChange={() => setValues({ ...values, length: "medium" })} /> 보통</label><label><input type="radio" name="length" value="long" checked={values.length === "long"} onChange={() => setValues({ ...values, length: "long" })} /> 길게</label></div></fieldset>
      <fieldset><legend className="text-sm font-semibold">말투</legend><div className="mt-2 flex flex-wrap gap-4 text-sm"><label><input type="radio" name="tone" value="friendly_informative" checked={values.tone === "friendly_informative"} onChange={() => setValues({ ...values, tone: "friendly_informative" })} /> 친근한 정보형</label><label><input type="radio" name="tone" value="practical_guide" checked={values.tone === "practical_guide"} onChange={() => setValues({ ...values, tone: "practical_guide" })} /> 실용적인 가이드형</label></div></fieldset>
      <label className="block text-sm font-semibold">상태<select name="status" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as "draft" })} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5"><option value="draft">초안</option></select></label>
      <label className="block text-sm font-semibold">본문<textarea name="body" required maxLength={10000} rows={10} value={values.body} onChange={(event) => setValues({ ...values, body: event.target.value })} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
