/**
 * 논문 분류 ↔ URL 슬러그 변환.
 *
 * Notion `Type` 선택지 값을 그대로 쓰되, URL 은 소문자 슬러그로 만든다
 * (예: "International" → /achievements/publications/international).
 */

/**
 * 논문 목록·필터에 노출할 Type.
 * Notion `Type` 에는 `Patent` 도 있지만 특허는 Patents DB 가 따로 있어 제외한다.
 */
export const PUBLICATION_TYPES = [
  "International",
  "Domestic",
  "Conference",
  "Book",
] as const;

/** Notion Type 값 → URL 슬러그 */
export const typeToSlug = (type: string): string =>
  type.toLowerCase().replace(/\s+/g, "-");

/** URL 슬러그 → Notion Type 값. 모르는 슬러그면 null. */
export function slugToPublicationType(slug: string): string | null {
  return PUBLICATION_TYPES.find((t) => typeToSlug(t) === slug) ?? null;
}
