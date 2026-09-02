/**
 * 콘텐츠 데이터 접근점 (single source of truth).
 *
 * 페이지·컴포넌트는 콘텐츠 데이터를 여기에서만 가져온다. `src/data/*.json` 을 직접
 * import 하지 말 것. 콘텐츠 텍스트는 반드시 `localizedText()` 로 언어를 고른다.
 *
 * 지금은 `src/data/` 의 더미 JSON 을 그대로 내보낸다. 나중에 Google Sheets(CSV) /
 * Notion API 연동을 붙일 때는 **이 파일만** 고치면 된다 (같은 형태의 배열로 가공해 export).
 * 데이터 "모양"(타입)은 `content-types.ts` 에 있다.
 */
import membersData from "../data/members.json";
import alumniData from "../data/alumni.json";
import publicationsData from "../data/publications.json";
import patentsData from "../data/patents.json";
import awardsData from "../data/awards.json";
import newsData from "../data/news.json";
import researchData from "../data/research.json";
import type {
  Member,
  Alumnus,
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  Locale,
} from "./content-types";

export type {
  Member,
  Alumnus,
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  Locale,
} from "./content-types";

export const members = membersData as Member[];
export const alumni = alumniData as Alumnus[];
export const publications = publicationsData as Publication[];
export const patents = patentsData as Patent[];
export const awards = awardsData as Award[];
export const news = newsData as NewsItem[];
export const researchAreas = researchData.areas as ResearchArea[];
export const researchProjects = researchData.projects as ResearchProject[];
export const researchScope: Record<Locale, string> = {
  en: researchData.scope,
  ko: researchData.scope_ko,
};

/**
 * 언어 폴백 헬퍼 — 콘텐츠 텍스트는 반드시 이 함수로 가져온다.
 * `base` 는 영문 필드명, `${base}_ko` 는 한글 필드명.
 * 현재 로케일 값 우선 → 없으면 반대 언어 → 둘 다 비었으면 null (호출부에서 항목을 건너뛴다).
 */
export function localizedText(
  item: Record<string, unknown>,
  base: string,
  locale: Locale,
): string | null {
  const en = String(item[base] ?? "").trim();
  const ko = String(item[`${base}_ko`] ?? "").trim();
  const [primary, secondary] = locale === "ko" ? [ko, en] : [en, ko];
  return primary || secondary || null;
}

/** 직책 표시 순서. 목록에 없는 직책이 들어오면 맨 뒤로 보낸다. */
export const POSITION_ORDER = [
  "Principal Investigator",
  "Research Professor",
  "Ph.D. Course",
  "M.S.-Ph.D. Integrated",
  "M.S. Course",
  "Undergraduate Researcher",
] as const;

export function positionRank(position: string): number {
  const i = (POSITION_ORDER as readonly string[]).indexOf(position);
  return i === -1 ? POSITION_ORDER.length : i;
}

/** 직책 순 → 같은 직책 안에서는 order(있으면) → 입실일 순으로 정렬한다. */
export function sortMembers(list: Member[]): Member[] {
  const far = Number.MAX_SAFE_INTEGER;
  return [...list].sort(
    (a, b) =>
      positionRank(a.position) - positionRank(b.position) ||
      (a.order ?? far) - (b.order ?? far) ||
      a.joinedDate.localeCompare(b.joinedDate),
  );
}

/** 날짜 문자열(ISO) 내림차순 정렬. 뉴스·수상 목록에 쓴다. */
export function byDateDesc<T extends { date: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 날짜가 있는 목록을 연도별로 묶는다. 연도는 내림차순, 각 그룹 안도 날짜 내림차순.
 * 수상·소식 목록에서 같은 연도를 한 번만 표시할 때 쓴다 (홈·전용 페이지 공통).
 */
export function groupByYear<T extends { date: string }>(
  list: T[],
): { year: number; items: T[] }[] {
  const groups = new Map<number, T[]>();
  for (const item of byDateDesc(list)) {
    const year = new Date(item.date).getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(item);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}
