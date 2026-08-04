export const contentImageKinds = ["local", "generated", "pexels"] as const;
export type ContentImageKind = (typeof contentImageKinds)[number];

export type ContentImage = {
  id: string;
  kind: ContentImageKind;
  url: string;
  alt: string;
  attribution?: string;
  attributionUrl?: string;
  /** Zero-based paragraph index after which this image is inserted. */
  placement?: number;
};

export function isContentImage(value: unknown): value is ContentImage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !contentImageKinds.includes(candidate.kind as ContentImageKind) || typeof candidate.url !== "string" || typeof candidate.alt !== "string") return false;
  if (candidate.id.length > 100 || candidate.alt.length > 300) return false;
  if (candidate.attribution !== undefined && (typeof candidate.attribution !== "string" || candidate.attribution.length > 300)) return false;
  if (candidate.attributionUrl !== undefined && (typeof candidate.attributionUrl !== "string" || candidate.attributionUrl.length > 1000)) return false;
  if (candidate.placement !== undefined && (typeof candidate.placement !== "number" || !Number.isInteger(candidate.placement) || candidate.placement < 0 || candidate.placement > 100)) return false;
  try {
    const url = new URL(candidate.url);
    if (url.protocol !== "https:") return false;
    if (candidate.kind === "pexels") {
      if (!url.hostname.endsWith("pexels.com")) return false;
      if (typeof candidate.attribution !== "string" || typeof candidate.attributionUrl !== "string") return false;
      const attributionUrl = new URL(candidate.attributionUrl);
      return attributionUrl.protocol === "https:" && attributionUrl.hostname.endsWith("pexels.com");
    }
    return candidate.attribution === undefined && candidate.attributionUrl === undefined;
  } catch {
    return false;
  }
}

export function readContentImages(value: unknown) {
  if (!Array.isArray(value)) return [] as ContentImage[];
  return value.filter(isContentImage).slice(0, 8);
}
