import type { ContentImage } from "./content-images";

export type ContentSection = {
  paragraph: string;
  images: ContentImage[];
};

/** Groups selected images with the paragraph after which they should appear. */
export function makeContentSections(body: string, images: ContentImage[]): ContentSection[] {
  const paragraphs = body.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const sections = (paragraphs.length > 0 ? paragraphs : [body.trim()])
    .filter(Boolean)
    .map((paragraph) => ({ paragraph, images: [] as ContentImage[] }));

  if (sections.length === 0) return sections;

  images.forEach((image, imageIndex) => {
    const automaticIndex = Math.floor(((imageIndex + 1) * sections.length) / (images.length + 1));
    const requestedIndex = Number.isInteger(image.placement) ? image.placement as number : automaticIndex;
    const sectionIndex = Math.min(sections.length - 1, Math.max(0, requestedIndex));
    sections[sectionIndex].images.push(image);
  });

  return sections;
}
