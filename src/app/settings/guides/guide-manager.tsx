"use client";

import { useActionState } from "react";
import type { ContentGuide } from "@/lib/content-guides";
import { createContentGuide, updateContentGuide, type GuideFormState } from "./actions";

const initialState: GuideFormState = {};

function GuideFields({ guide }: { guide?: ContentGuide }) {
  return <>
    {guide && <input type="hidden" name="id" value={guide.id} />}
    <label className="block text-sm font-semibold">가이드 이름<input name="title" required maxLength={100} defaultValue={guide?.title} placeholder="예: 신뢰도 높은 정보형" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
    <label className="mt-4 block text-sm font-semibold">작성 가이드<textarea name="instructions" required maxLength={5000} defaultValue={guide?.instructions} rows={8} placeholder="독자, 문체, 반드시 포함할 구성, 금지 표현, 사실 확인 기준을 작성하세요." className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
    {guide && <label className="mt-4 flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="is_active" defaultChecked={guide.is_active} /> 이 가이드를 선택 가능 상태로 유지</label>}
  </>;
}

function CreateGuideForm() {
  const [state, action] = useActionState(createContentGuide, initialState);
  return <form action={action} className="rounded-xl border border-stone-200 bg-white p-6"><h2 className="font-bold">새 작성 가이드</h2><p className="mt-1 text-sm text-stone-500">AI가 따라야 할 품질 기준을 구체적으로 작성하세요.</p><div className="mt-5"><GuideFields /></div>{state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="mt-4 text-sm text-emerald-800">{state.success}</p>}<button className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">가이드 저장</button></form>;
}

function EditGuideForm({ guide }: { guide: ContentGuide }) {
  const [state, action] = useActionState(updateContentGuide, initialState);
  return <details className="rounded-lg border border-stone-200 p-4"><summary className="cursor-pointer font-semibold">{guide.title} {!guide.is_active && <span className="ml-2 text-xs font-normal text-stone-500">비활성</span>}</summary><form action={action} className="mt-4"><GuideFields guide={guide} />{state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="mt-4 text-sm text-emerald-800">{state.success}</p>}<button className="mt-5 rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">수정 저장</button></form></details>;
}

export function GuideManager({ guides }: { guides: ContentGuide[] }) {
  return <div className="grid max-w-4xl gap-6"><CreateGuideForm /><section className="rounded-xl border border-stone-200 bg-white p-6"><h2 className="font-bold">저장된 작성 가이드</h2>{guides.length === 0 ? <p className="mt-2 text-sm text-stone-500">아직 저장된 가이드가 없습니다.</p> : <div className="mt-4 space-y-3">{guides.map((guide) => <EditGuideForm key={guide.id} guide={guide} />)}</div>}</section></div>;
}
