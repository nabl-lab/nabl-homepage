/**
 * 인물 화면(PI 페이지·구성원 상세) 공통 규칙.
 *
 * 두 화면이 같은 블록을 쓰므로 판단 로직도 한곳에 둔다. 화면(.astro)에 규칙을
 * 다시 쓰지 마라 — 한쪽만 고쳐져 어긋나는 것을 막으려는 것이다.
 *
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type { Member, MemberResearchArea, PiEntry } from "./content-types";

/** 외부 프로필 링크 한 줄. 비어 있는 링크는 목록에 넣지 않는다. */
export interface ProfileLink {
  /** ui 사전 키가 아니라 고정 서비스 이름이다 (상표라 번역하지 않는다). */
  label: string;
  href: string;
}

/**
 * 직위 한 줄. `Position`/`Position_ko` 가 비면 **`직책·과정` 라벨로 폴백**한다.
 * 교수님만 Position 을 채워 두었고 다른 구성원은 비어 있어서, 폴백이 기본 동작이다.
 *
 * @param positionLabel optionLabel("memberPosition", …) 로 번역한 직책 라벨
 */
export function positionLine(
  localized: string | null,
  positionLabel: string,
): string | null {
  return localized || positionLabel || null;
}

/** 채워진 외부 프로필 링크만. 셋 다 비면 빈 배열 → 화면이 그 영역을 숨긴다. */
export function profileLinks(member: Member): ProfileLink[] {
  const { scholar, orcid, researchGate } = member.links;
  return [
    { label: "Google Scholar", href: scholar },
    { label: "ORCID", href: orcid },
    { label: "ResearchGate", href: researchGate },
  ].filter((l) => l.href.trim() !== "");
}

/** 연구 분야 카드 정렬 — Research DB 의 Order 오름차순, 없으면 맨 뒤. */
export function sortedAreas(areas: MemberResearchArea[]): MemberResearchArea[] {
  const far = Number.MAX_SAFE_INTEGER;
  return [...areas].sort((a, b) => (a.order ?? far) - (b.order ?? far));
}

/** 학력·대외활동 정렬: Order 오름차순(없으면 뒤), 같으면 시작연도 내림차순. */
export function sortEntries(entries: PiEntry[]): PiEntry[] {
  const far = Number.MAX_SAFE_INTEGER;
  return [...entries].sort(
    (a, b) => (a.order ?? far) - (b.order ?? far) || b.startYear - a.startYear,
  );
}

export interface CareerGroup {
  /** 현직이면 true. 화면 라벨은 호출부가 ui 사전에서 꺼낸다. */
  current: boolean;
  items: PiEntry[];
}

/**
 * 경력을 **현직 / 이전** 으로 가른다. `End_year` 가 비어 있으면 현직이다.
 * 각 묶음 안은 Order 오름차순. 비어 있는 묶음은 돌려주지 않는다.
 */
export function careerGroups(entries: PiEntry[]): CareerGroup[] {
  const current = sortEntries(entries.filter((e) => e.endYear === null));
  const past = sortEntries(entries.filter((e) => e.endYear !== null));
  const groups: CareerGroup[] = [];
  if (current.length > 0) groups.push({ current: true, items: current });
  if (past.length > 0) groups.push({ current: false, items: past });
  return groups;
}

/**
 * 연도 표기. 끝 연도가 없으면 "현재"에 해당하는 말을 호출부가 넘긴다
 * (화면 문구를 lib 에 하드코딩하지 않기 위해서다 — CLAUDE.md 11번).
 */
export function yearRange(
  entry: PiEntry,
  presentLabel: string,
): string {
  const end = entry.endYear === null ? presentLabel : String(entry.endYear);
  return entry.startYear === entry.endYear
    ? String(entry.startYear)
    : `${entry.startYear} \u2013 ${end}`;
}
