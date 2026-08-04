"use client";

import { useState } from "react";
import type { ContentImage } from "@/lib/content-images";

type Destination = "cafe" | "blog";

const destinationLabels: Record<Destination, string> = {
  cafe: "네이버 카페",
  blog: "네이버 블로그",
};

type PublishingSection = {
  paragraph: string;
  images: ContentImage[];
};

function makePublishingSections(body: string, images: ContentImage[]) {
  const paragraphs = body.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const sections: PublishingSection[] = (paragraphs.length > 0 ? paragraphs : [body.trim()]).map((paragraph) => ({ paragraph, images: [] }));

  images.forEach((image, imageIndex) => {
    const automaticIndex = Math.floor(((imageIndex + 1) * sections.length) / (images.length + 1));
    const sectionIndex = Math.min(sections.length - 1, Math.max(0, Number.isInteger(image.placement) ? image.placement as number : automaticIndex));
    sections[sectionIndex].images.push(image);
  });

  return sections;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function createPublishingPackage({ title, body, images }: { title: string; body: string; images: ContentImage[] }) {
  const sections = makePublishingSections(body, images);
  let imageNumber = 0;

  return `${title}\n\n${sections.map((section) => {
    const paragraph = section.paragraph;
    const inlineImages = section.images.map((image) => {
      imageNumber += 1;
      return `🖼️ 이미지 ${imageNumber}: ${image.alt}\n${image.url}`;
    }).join("\n\n");
    return inlineImages ? `${paragraph}\n\n${inlineImages}` : paragraph;
  }).join("\n\n")}`;
}

function createPublishingHtml({ title, body, images }: { title: string; body: string; images: ContentImage[] }) {
  const sections = makePublishingSections(body, images);
  let imageNumber = 0;

  const content = sections.map((section) => {
    const paragraph = `<p>${escapeHtml(section.paragraph).replace(/\n/g, "<br>")}</p>`;
    const inlineImages = section.images.map((image) => {
      imageNumber += 1;
      return `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}"><figcaption>이미지 ${imageNumber}: ${escapeHtml(image.alt)}</figcaption></figure>`;
    }).join("");
    return `${paragraph}${inlineImages}`;
  }).join("");

  return `<h1>${escapeHtml(title)}</h1>${content}`;
}

export function PublishingKit({ title, body, images }: { title: string; body: string; images: ContentImage[] }) {
  const [destination, setDestination] = useState<Destination>("cafe");
  const [message, setMessage] = useState("");
  const sections = makePublishingSections(body, images);

  async function copyPackage() {
    const content = createPublishingPackage({ title, body, images });
    const html = createPublishingHtml({ title, body, images });
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({
          "text/plain": new Blob([content], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })]);
      } else {
        await navigator.clipboard.writeText(content);
      }
      setMessage(`${destinationLabels[destination]}에 붙여넣을 제목·본문·이미지 순서의 초안을 복사했습니다.`);
    } catch {
      setMessage("복사하지 못했습니다. 브라우저 권한을 확인한 뒤 다시 시도해 주세요.");
    }
  }

  return <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-emerald-950">발행 준비</h3>
        <p className="mt-1 text-sm leading-6 text-emerald-900">승인된 글입니다. 제목·본문·이미지 순서를 한 번에 복사해 해당 서비스의 글쓰기 화면에 붙여넣으세요.</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">외부 자동 게시 없음</span>
    </div>
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-emerald-950">게시할 곳</legend>
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        {(Object.keys(destinationLabels) as Destination[]).map((value) => <label key={value} className={`cursor-pointer rounded-lg border px-4 py-2 ${destination === value ? "border-emerald-700 bg-white font-semibold text-emerald-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><input type="radio" name="destination" value={value} checked={destination === value} onChange={() => { setDestination(value); setMessage(""); }} className="mr-2" />{destinationLabels[value]}</label>)}
      </div>
    </fieldset>
    <div className="mt-5 rounded-lg bg-white p-4 text-sm text-stone-700"><p className="font-semibold text-stone-900">본문 속 이미지 {images.length}개</p><p className="mt-1 leading-6">이미지는 본문 문단 사이에 배치됩니다. 서식 있는 붙여넣기를 지원하는 편집기에서는 이미지 미리보기도 함께 전달됩니다. 이미지 파일 업로드는 자동으로 실행되지 않으므로, 표시되지 않는 경우 각 이미지 URL을 열어 직접 첨부해 주세요.</p></div>
    <section className="mt-5 space-y-5 rounded-lg border border-emerald-100 bg-white p-5">
      <p className="text-sm font-semibold text-stone-900">붙여넣기 미리보기</p>
      <h4 className="text-xl font-bold text-stone-950">{title}</h4>
      {sections.map((section, sectionIndex) => <div key={`${section.paragraph}-${sectionIndex}`} className="space-y-4"><p className="whitespace-pre-wrap leading-7 text-stone-800">{section.paragraph}</p>{section.images.map((image, imageIndex) => {
        const number = sections.slice(0, sectionIndex).reduce((total, previous) => total + previous.images.length, 0) + imageIndex + 1;
        return <figure key={image.id} className="overflow-hidden rounded-lg border border-stone-200"><img src={image.url} alt={image.alt} className="max-h-96 w-full object-cover" /><figcaption className="p-3 text-xs text-stone-600">이미지 {number}: {image.alt}</figcaption></figure>;
      })}</div>)}
    </section>
    <button type="button" onClick={copyPackage} className="mt-5 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">{destinationLabels[destination]}용 통합 초안 복사</button>
    {message && <p role="status" className="mt-3 text-sm font-medium text-emerald-900">{message}</p>}
  </section>;
}
