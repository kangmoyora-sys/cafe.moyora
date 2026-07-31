"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { ContentGuide } from "@/lib/content-guides";
import { generateAIDraft, recommendNaverNews, saveDraft, searchGooglePlaces, searchNaverNews, type DraftFormState, type GooglePlace, type NaverNewsItem, type NaverNewsRecommendation } from "./actions";

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
  const [isSearchingNews, startSearchingNews] = useTransition();
  const [newsError, setNewsError] = useState("");
  const [newsItems, setNewsItems] = useState<NaverNewsItem[]>([]);
  const [selectedNewsUrls, setSelectedNewsUrls] = useState<string[]>([]);
  const [isRecommendingNews, startRecommendingNews] = useTransition();
  const [newsRecommendations, setNewsRecommendations] = useState<NaverNewsRecommendation[]>([]);
  const [newsRecommendationError, setNewsRecommendationError] = useState("");
  const [isSearchingPlaces, startSearchingPlaces] = useTransition();
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeError, setPlaceError] = useState("");
  const [placeResults, setPlaceResults] = useState<GooglePlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [researchSource, setResearchSource] = useState<"auto" | "blog" | "news">("auto");
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [purpose, setPurpose] = useState("");
  const [readerProfile, setReaderProfile] = useState("");
  const [contentAngle, setContentAngle] = useState("");
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
    formData.set("readerProfile", readerProfile);
    formData.set("contentAngle", contentAngle);
    formData.set("length", length);
    formData.set("tone", tone);
    formData.set("writingGuideId", writingGuideId);
    formData.set("writingGuideNotes", writingGuideNotes);
    formData.set("newsReferences", JSON.stringify(newsItems.filter((item) => selectedNewsUrls.includes(item.sourceUrl))));
    formData.set("googlePlaceId", selectedPlaceId);

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

  function handleNewsSearch() {
    setNewsError("");
    startSearchingNews(async () => {
      const result = await searchNaverNews(keyword, researchSource);
      if (result.error) {
        setNewsError(result.error);
        return;
      }
      setNewsItems(result.items);
      setSelectedNewsUrls([]);
      setNewsRecommendations([]);
      setNewsRecommendationError("");
    });
  }

  function handleNewsRecommendation() {
    setNewsRecommendationError("");
    const formData = new FormData();
    formData.set("keyword", keyword);
    formData.set("purpose", purpose);
    formData.set("readerProfile", readerProfile);
    formData.set("contentAngle", contentAngle);
    formData.set("writingGuideId", writingGuideId);
    formData.set("writingGuideNotes", writingGuideNotes);
    formData.set("newsReferences", JSON.stringify(newsItems));

    startRecommendingNews(async () => {
      const result = await recommendNaverNews(formData);
      if (result.error) {
        setNewsRecommendations([]);
        setNewsRecommendationError(result.error);
        return;
      }
      setNewsRecommendations(result.recommendations);
    });
  }

  function toggleNewsSelection(sourceUrl: string) {
    setSelectedNewsUrls((current) => current.includes(sourceUrl) ? current.filter((url) => url !== sourceUrl) : [...current, sourceUrl]);
  }

  function handlePlaceSearch() {
    setPlaceError("");
    startSearchingPlaces(async () => {
      const result = await searchGooglePlaces(placeQuery);
      if (result.error) {
        setPlaceResults([]);
        setSelectedPlaceId("");
        setPlaceError(result.error);
        return;
      }
      setPlaceResults(result.places);
      setSelectedPlaceId("");
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
      <section className="rounded-lg border border-sky-100 bg-sky-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold">자동 리서치</h2><p className="mt-1 text-xs text-stone-600">맛집·여행 같은 가이드형 키워드는 블로그 후기를, 최신 이슈는 뉴스를 우선 검색합니다.</p></div>
          <button type="button" onClick={handleNewsSearch} disabled={isSearchingNews} className="rounded-lg border border-sky-700 px-4 py-2 text-sm font-bold text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60">{isSearchingNews ? "검색 중…" : "참고자료 검색"}</button>
        </div>
        <fieldset className="mt-3 flex flex-wrap gap-3 text-sm"><legend className="sr-only">참고자료 종류</legend><label><input type="radio" name="researchSource" value="auto" checked={researchSource === "auto"} onChange={() => setResearchSource("auto")} /> 자동 선택</label><label><input type="radio" name="researchSource" value="blog" checked={researchSource === "blog"} onChange={() => setResearchSource("blog")} /> 블로그 후기</label><label><input type="radio" name="researchSource" value="news" checked={researchSource === "news"} onChange={() => setResearchSource("news")} /> 최신 뉴스</label></fieldset>
        {newsError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{newsError}</p>}
        {newsItems.length >= 2 && <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-violet-950">작성 목적과 가이드를 기준으로 AI가 가장 쓸모 있는 참고자료 2개를 추천합니다.</p><button type="button" onClick={handleNewsRecommendation} disabled={isRecommendingNews} className="rounded-lg border border-violet-700 px-3 py-2 text-sm font-bold text-violet-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60">{isRecommendingNews ? "AI 추천 중…" : "AI 추천 받기"}</button></div>{newsRecommendationError && <p role="alert" className="mt-3 text-sm text-red-700">{newsRecommendationError}</p>}{newsRecommendations.length > 0 && <ul className="mt-3 space-y-2 text-sm text-violet-950">{newsRecommendations.map((recommendation, index) => { const item = newsItems.find((newsItem) => newsItem.sourceUrl === recommendation.sourceUrl); return item ? <li key={recommendation.sourceUrl} className="rounded bg-white p-3"><strong>{index + 1}. {item.title}</strong><p className="mt-1 text-violet-800">추천 이유: {recommendation.reason}</p></li> : null; })}</ul>}</div>}
        {newsItems.length > 0 && <div className="mt-4 space-y-3">{newsItems.map((item) => <label key={item.sourceUrl} className="block cursor-pointer rounded-lg border border-sky-100 bg-white p-3"><div className="flex gap-3"><input type="checkbox" checked={selectedNewsUrls.includes(item.sourceUrl)} onChange={() => toggleNewsSelection(item.sourceUrl)} className="mt-1" /><span><span className="mr-2 rounded bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">{item.sourceType === "blog" ? "블로그 후기" : "최신 뉴스"}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="font-semibold text-sky-800 hover:underline">{item.title}</a><span className="ml-2 text-xs text-stone-500">{item.publishedAt}</span><p className="mt-1 text-sm text-stone-600">{item.description}</p></span></div></label>)}</div>}
      </section>
      <section className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 text-sm font-semibold">
            실제 장소 확인 <span className="font-normal text-stone-500">(선택)</span>
            <input value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} maxLength={150} placeholder="예: 깜란 엠어이 베트남" className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5" />
          </label>
          <button type="button" onClick={handlePlaceSearch} disabled={isSearchingPlaces} className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">{isSearchingPlaces ? "장소 검색 중…" : "실제 장소 검색"}</button>
        </div>
        <p className="mt-2 text-xs text-stone-600">장소를 하나 선택하면 AI는 검색으로 확인된 장소명·주소·지도 링크만 사용할 수 있습니다. 선택하지 않으면 지도 링크를 만들지 않습니다.</p>
        {placeError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{placeError}</p>}
        {placeResults.length > 0 && <div className="mt-3 space-y-2">{placeResults.map((place) => <label key={place.id} className="flex cursor-pointer gap-3 rounded-lg border border-amber-100 bg-white p-3"><input type="radio" name="selectedGooglePlace" checked={selectedPlaceId === place.id} onChange={() => setSelectedPlaceId(place.id)} className="mt-1" /><span><strong>{place.name}</strong><p className="mt-1 text-sm text-stone-600">{place.formattedAddress}</p><a href={place.mapsUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-1 inline-block text-sm font-semibold text-amber-800 hover:underline">지도에서 확인</a></span></label>)}</div>}
      </section>
      <label className="block text-sm font-semibold">
        작성 목적
        <textarea name="purpose" required maxLength={1000} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="이 글로 전달하고 싶은 내용을 입력하세요." rows={4} className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">대상 독자 <span className="font-normal text-stone-500">(선택)</span><input value={readerProfile} onChange={(event) => setReaderProfile(event.target.value)} maxLength={500} placeholder="예: 처음 나트랑에 가는 아이 동반 가족" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
        <label className="block text-sm font-semibold">기획 조건 <span className="font-normal text-stone-500">(선택)</span><input value={contentAngle} onChange={(event) => setContentAngle(event.target.value)} maxLength={1000} placeholder="예: 1인 2만원대, 시내 중심, 이동 동선 고려" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5" /></label>
      </div>
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
