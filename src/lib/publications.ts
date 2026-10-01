/**
 * 논문 목록의 연도 그룹 · URL 필터 해석.
 *
 연도 규칙:
 *  - year 는 Published_date(게재일) 의 연도 → 없으면 Year 숫자 → 둘 다 없으면 null
 *    (null = "연도 미상")
 *  - 연도 그룹은 내림차순, "연도 미상" 그룹은 언제나 맨 뒤
 *  - 같은 연도 안에서는 publishedDate 최신순, 날짜 없는 항목은 그 뒤로
 *
 * 연도 결정은 content.ts 가 데이터를 넘겨줄 때 withResolvedYear() 로 **한 번만** 한다.
 * Notion 매퍼에 두면 src/data 의 JSON 폴백에는 규칙이 적용되지 않아 두 출처가 어긋난다.
 *
 * 필터는 JS 없이 **정적 경로**로 구현한다 (이 사이트의 기존 방식).
 * 경로 한 칸은 분류 슬러그, 4자리 숫자는 연도로 읽는다.
 *   /research/publications                        → 전체 · 전체 연도
 *   /research/publications/international          → 분류만
 *   /research/publications/2023                   → 연도만
 *   /research/publications/international/2023     → 분류 + 연도
 */
import type { Publication } from "./content-types";
import {
  PUBLICATION_TYPES,
  slugToPublicationType,
  typeToSlug,
} from "./notion/publication-types";

/**
 * 논문 한 건의 연도를 정한다. 게재일의 연도 → Year 숫자 → null("연도 미상").
 *
 * Published_date 속성이 Notion 스키마에 없어도 publishedDate 가 null 로 들어오므로
 * Year 숫자로 조용히 넘어간다 (빌드가 깨지지 않는다).
 */
export function resolvePublicationYear(
  publishedDate: string | null | undefined,
  yearNum: number | null | undefined,
): number | null {
  const fromDate = publishedDate ? Number(publishedDate.slice(0, 4)) : NaN;
  if (Number.isFinite(fromDate) && fromDate > 0) return fromDate;
  return typeof yearNum === "number" && Number.isFinite(yearNum) && yearNum > 0
    ? yearNum
    : null;
}

/** 목록 전체에 연도 규칙을 적용한다. content.ts 가 출처에 상관없이 한 번 호출한다. */
export function withResolvedYear(list: Publication[]): Publication[] {
  return list.map((p) => ({
    ...p,
    publishedDate: p.publishedDate ?? null,
    year: resolvePublicationYear(p.publishedDate, p.year),
  }));
}

export interface PublicationYearGroup {
  /** null 이면 "연도 미상" 그룹 */
  year: number | null;
  items: Publication[];
}

/** 같은 연도 안의 정렬: 게재일 최신순, 날짜 없으면 뒤로. */
function byPublishedDesc(a: Publication, b: Publication): number {
  const da = a.publishedDate ?? "";
  const db = b.publishedDate ?? "";
  if (da === db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return db.localeCompare(da);
}

/** 데이터에 실제로 있는 연도. 내림차순. "연도 미상"은 포함하지 않는다. */
export function publicationYears(list: Publication[]): number[] {
  const years = new Set<number>();
  for (const p of list) if (p.year !== null) years.add(p.year);
  return [...years].sort((a, b) => b - a);
}

/** 연도 미상 건수. 필터 바에 표시한다. */
export function unknownYearCount(list: Publication[]): number {
  return list.filter((p) => p.year === null).length;
}

/** 연도별 그룹. 연도 내림차순, "연도 미상"은 맨 뒤. */
export function groupPublicationsByYear(list: Publication[]): PublicationYearGroup[] {
  const byYear = new Map<number, Publication[]>();
  const unknown: Publication[] = [];

  for (const p of list) {
    if (p.year === null) {
      unknown.push(p);
      continue;
    }
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year)!.push(p);
  }

  const groups: PublicationYearGroup[] = [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items: items.sort(byPublishedDesc) }));

  if (unknown.length > 0) groups.push({ year: null, items: unknown.sort(byPublishedDesc) });
  return groups;
}

/** 데이터가 있는 분류만. 0건인 분류는 탭을 만들지 않는다 (죽은 링크 방지). */
export function shownPublicationTypes(counts: Record<string, number>): string[] {
  return PUBLICATION_TYPES.filter((type) => (counts[type] ?? 0) > 0);
}

/**
 * 분류 탭 영역을 보여 줄지. 분류가 1종류 이하면 "전체" 와 같은 목록이 되므로 숨긴다.
 * 연도 필터는 분류 탭과 무관하게 남는다.
 */
export function publicationTypeTabsVisible(counts: Record<string, number>): boolean {
  return shownPublicationTypes(counts).length > 1;
}

export interface PublicationFilters {
  /** Notion Type 값. null = 전체 */
  type: string | null;
  /** 연도. null = 전체 */
  year: number | null;
}

/** URL 경로 조각(`international/2023` 등)을 분류·연도로 나눈다. 모르는 값은 무시한다. */
export function parsePublicationFilters(param: string | undefined): PublicationFilters {
  const parts = (param ?? "").split("/").filter(Boolean);
  let type: string | null = null;
  let year: number | null = null;
  for (const part of parts) {
    if (/^\d{4}$/.test(part)) year = Number(part);
    else type ??= slugToPublicationType(part);
  }
  return { type, year };
}

/**
 * 분류·연도 → rest 파라미터 값. 둘 다 없으면 undefined (= 접미사 없는 기본 경로).
 * getStaticPaths 가 만드는 경로와 화면 링크가 같은 규칙을 쓰도록 여기 한 곳에 둔다.
 */
export function publicationFilterParam(
  type: string | null,
  year: number | null,
): string | undefined {
  const parts = [type ? typeToSlug(type) : "", year ? String(year) : ""].filter(Boolean);
  return parts.length > 0 ? parts.join("/") : undefined;
}

/** 분류·연도로 화면 링크 경로를 만든다. */
export function publicationPath(type: string | null, year: number | null): string {
  const param = publicationFilterParam(type, year);
  return `/research/publications${param ? "/" + param : ""}`;
}
