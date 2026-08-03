"use client";

import { useState } from "react";
import type { ContentImage } from "@/lib/content-images";

type Destination = "cafe" | "blog";

const destinationLabels: Record<Destination, string> = {
  cafe: "네이버 카페",
  blog: "네이버 블로그",
};

function createPublishingPackage({ destination, title, body, keyword, images }: { destination: Destination; title: string; body: string; keyword: string; images: ContentImage[] }) {
  const imageGuide = images.length === 0
    ? "선택한 이미지가 없습니다. 필요한 이미지는 게시 화면에서 직접 추가해 주세요."
    : images.map((image, index) => `${index + 1}. ${image.alt}\n   ${image.url}`).join("\n");

  return `[${destinationLabels[destination]} 발행 준비]\n\n제목\n${title}\n\n키워드\n${keyword}\n\n본문\n${body}\n\n이미지 첨부 안내\n${imageGuide}`;
}

export function PublishingKit({ title, body, keyword, images }: { title: string; body: string; keyword: string; images: ContentImage[] }) {
  const [destination, setDestination] = useState<Destination>("cafe");
  const [message, setMessage] = useState("");

  async function copyPackage() {
    const content = createPublishingPackage({ destination, title, body, keyword, images });
    try {
      await navigator.clipboard.writeText(content);
      setMessage(`${destinationLabels[destination]}용 발행 패키지를 복사했습니다.`);
    } catch {
      setMessage("복사하지 못했습니다. 브라우저 권한을 확인한 뒤 다시 시도해 주세요.");
    }
  }

  return <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-emerald-950">발행 준비</h3>
        <p className="mt-1 text-sm leading-6 text-emerald-900">승인된 글입니다. 목적지를 선택해 제목·본문·이미지 안내를 복사한 뒤 해당 서비스의 글쓰기 화면에 붙여넣으세요.</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">외부 자동 게시 없음</span>
    </div>
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-emerald-950">게시할 곳</legend>
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        {(Object.keys(destinationLabels) as Destination[]).map((value) => <label key={value} className={`cursor-pointer rounded-lg border px-4 py-2 ${destination === value ? "border-emerald-700 bg-white font-semibold text-emerald-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><input type="radio" name="destination" value={value} checked={destination === value} onChange={() => { setDestination(value); setMessage(""); }} className="mr-2" />{destinationLabels[value]}</label>)}
      </div>
    </fieldset>
    <div className="mt-5 rounded-lg bg-white p-4 text-sm text-stone-700"><p className="font-semibold text-stone-900">이미지 {images.length}개</p><p className="mt-1 leading-6">이미지 파일은 자동으로 전송되지 않습니다. 게시 화면에서 직접 첨부해 주세요.</p></div>
    <button type="button" onClick={copyPackage} className="mt-5 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">{destinationLabels[destination]}용 발행 패키지 복사</button>
    {message && <p role="status" className="mt-3 text-sm font-medium text-emerald-900">{message}</p>}
  </section>;
}
