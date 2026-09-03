/**
 * 콘텐츠 데이터 가공 헬퍼 — 언어 폴백, 정렬, 그룹핑 (순수 함수).
 *
 * 데이터 로딩·export 는 content.ts 담당이고 여기는 변형 로직만 둔다.
 * content.ts 가 이 파일을 그대로 re-export 하므로, 페이지는 여전히
 * `src/lib/content.ts` 에서만 가져오면 된다.
 */
import type { Member, Locale } from "./content-types";

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

/**
 * `position` 필드로 묶는다. 그룹 순서는 POSITION_ORDER 를 따르고, 목록에 없는
 * 직책은 맨 뒤로 간다. 그룹 안의 정렬은 호출부에서 미리 해서 넘긴다
 * (JS sort 는 안정적이라 여기서 다시 정렬해도 그 순서가 유지된다).
 * 예) 구성원: groupByPosition(sortMembers(members))
 *     졸업생: groupByPosition([...alumni].sort(졸업연도·이름순))
 */
export function groupByPosition<T extends { position: string }>(
  list: T[],
): { position: string; items: T[] }[] {
  const sorted = [...list].sort(
    (a, b) => positionRank(a.position) - positionRank(b.position),
  );
  const groups: { position: string; items: T[] }[] = [];
  for (const item of sorted) {
    const g = groups.find((x) => x.position === item.position);
    if (g) g.items.push(item);
    else groups.push({ position: item.position, items: [item] });
  }
  return groups;
}

/** 날짜 문자열(ISO) 내림차순 정렬. 뉴스·수상 목록에 쓴다. */
export function byDateDesc<T extends { date: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 날짜가 있는 목록을 연도별로 묶는다. 연도 내림차순, 각 그룹 안도 날짜 내림차순.
 * 수상·특허·기타 성과 목록에서 같은 연도를 한 번만 표시할 때 쓴다.
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
