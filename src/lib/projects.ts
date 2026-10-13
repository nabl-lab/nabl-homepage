/**
 * 연구 과제 목록 — 진행 중 판정 · 정렬 · 기간 표시.
 *
 * 이 파일의 함수는 모두 **순수 함수**다. 빌드 날짜를 인자로 받으므로 테스트에서
 * 시점을 고정할 수 있다 (tests/projects.test.ts).
 *
 * ## import 에 `.ts` 확장자를 쓰는 이유
 * 이 파일을 `node --test` 가 번들 없이 직접 실행한다. Node 의 ESM 은 확장자를
 * 생략한 상대 경로를 해석하지 못하므로 값 import 에는 확장자를 붙인다.
 * (Vite 와 astro check 는 둘 다 이 표기를 그대로 받는다)
 *
 * ## Notion 쪽 주의
 * - 정렬용 수식 속성 `Sort_group` 은 **쓰지 않는다.** 수식 결과는 API 가 응답하는
 *   시점에 따라 달라질 수 있어, 빌드 결과가 흔들린다. 아래 규칙으로 직접 계산한다.
 * - `Order` 속성도 목록 정렬에 쓰지 않는다 (Notion 에 남아 있지만 무시한다).
 */
import type { ResearchProject } from "./content-types";
import { PROJECT_STATUS } from "./notion/schema-work.ts";

/** 빌드 시점의 Asia/Seoul 날짜 ("YYYY-MM-DD"). 진행 중 판정의 기준점. */
export function seoulBuildDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * 진행 중인 과제인지. 아래 중 하나라도 해당하면 진행 중이다.
 *  - Status 가 "Ongoing"
 *  - End_date 가 비어 있음 (종료 예정일을 아직 모르는 과제)
 *  - End_date 가 빌드 날짜 이후 (종료 예정일이 미래)
 *
 * "Planned" 는 진행 중으로 보지 않는다 — 종료 그룹과 같은 규칙으로 정렬된다.
 * 날짜는 "YYYY-MM-DD" 라서 문자열 비교만으로 대소가 맞는다 (Date 로 바꾸지 않는다).
 */
export function isOngoing(p: ResearchProject, buildDate: string): boolean {
  if (p.status === PROJECT_STATUS.ongoing) return true;
  if (!p.endDate) return true;
  return p.endDate >= buildDate;
}

/** 정렬 비교용 키. 없는 날짜를 그룹 맨 아래/맨 위로 보내는 센티넬을 끼운다. */
const START_WHEN_MISSING = ""; // 빈 문자열이 가장 작다 → 내림차순에서 맨 아래
const END_WHEN_MISSING = "9999-99-99"; // 가장 크다 → 내림차순에서 맨 위

/**
 * 목록 정렬. 원본 배열을 바꾸지 않는다.
 *
 *  1) 진행 중인 과제가 맨 위
 *  2) 같은 그룹 안에서는 Start_date 내림차순 (늦게 시작한 과제가 위).
 *     기간이 겹쳐도 이 규칙만 따른다
 *  3) Start_date 가 같으면 End_date 내림차순 (End_date 없는 항목이 위),
 *     그다음 표시 제목순
 *  4) Start_date 가 없는 항목은 각 그룹의 맨 아래
 *
 * @param lang 제목 동순위를 가를 때 쓴다. 표시 제목이 언어마다 다르므로 필요하다
 *             (명세의 sortProjects(projects, buildDate) 에서 인자 하나가 늘었다).
 */
export function sortProjects(
  list: ResearchProject[],
  buildDate: string,
  lang: "ko" | "en",
): ResearchProject[] {
  const collator = new Intl.Collator(lang === "ko" ? "ko" : "en");
  const titleOf = (p: ResearchProject) =>
    lang === "ko" ? p.title_ko || p.title : p.title || p.title_ko;

  return [...list].sort((a, b) => {
    const ongoingA = isOngoing(a, buildDate);
    const ongoingB = isOngoing(b, buildDate);
    if (ongoingA !== ongoingB) return ongoingA ? -1 : 1;

    const startA = a.startDate ?? START_WHEN_MISSING;
    const startB = b.startDate ?? START_WHEN_MISSING;
    if (startA !== startB) return startA < startB ? 1 : -1;

    const endA = a.endDate ?? END_WHEN_MISSING;
    const endB = b.endDate ?? END_WHEN_MISSING;
    if (endA !== endB) return endA < endB ? 1 : -1;

    return collator.compare(titleOf(a), titleOf(b));
  });
}

/**
 * "YYYY-MM-DD" → "YYYY.MM". 문자열에서 연·월을 직접 떼어 낸다.
 *
 * `new Date("2021-03-01")` 은 UTC 자정으로 해석돼 Asia/Seoul 로 찍으면 전날(2월)로
 * 밀린다. 그래서 Date 를 거치지 않는다.
 */
function yearMonth(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso.trim());
  return m ? `${m[1]}.${m[2]}` : null;
}

/** 기간 구분 기호. en dash 양옆에 공백 한 칸. */
const DASH = "\u2013";

/**
 * 기간 표시 문자열. 기간 줄을 아예 숨겨야 하면 null 을 돌려준다.
 *
 *  종료된 과제            "2020.03 – 2023.02"
 *  진행 중 + 종료 예정일   "2021.06 – 2028.02"
 *  진행 중 + 종료일 없음   "2021.06 – 진행 중" / "2021.06 – Present"
 *  같은 달에 시작·종료     "2020.03"
 *  시작일 없음             null (호출부에서 기간 줄을 렌더하지 않는다)
 *
 * @param presentLabel "진행 중" / "Present". 화면 문구는 ui 사전에서만 관리하므로
 *                     (CLAUDE.md 11번) 여기에 하드코딩하지 않고 호출부가 넘긴다.
 *                     명세의 `locale` 인자를 이 라벨로 바꾼 것이다.
 */
export function formatPeriod(
  start: string | null,
  end: string | null,
  ongoing: boolean,
  presentLabel: string,
): string | null {
  if (!start) return null;
  const from = yearMonth(start);
  if (!from) return null;

  if (!end) return ongoing ? `${from} ${DASH} ${presentLabel}` : from;

  const to = yearMonth(end);
  if (!to || to === from) return from;
  return `${from} ${DASH} ${to}`;
}
