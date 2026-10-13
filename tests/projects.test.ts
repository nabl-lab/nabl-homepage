/**
 * 연구 과제 목록 로직 단위 테스트 — 진행 중 판정 · 정렬 · 기간 표시.
 *
 * 실행: npm test   (Node 내장 테스트 러너. 새 의존성 없음)
 *
 * 빌드 날짜를 인자로 넘기므로 "오늘"이 바뀌어도 결과가 흔들리지 않는다.
 * import 에 `.ts` 를 붙이는 이유는 src/lib/projects.ts 주석 참고.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatPeriod,
  isOngoing,
  seoulBuildDate,
  sortProjects,
} from "../src/lib/projects.ts";
import type { ResearchProject } from "../src/lib/work-types.ts";

/** 테스트에 필요한 값만 받아 ResearchProject 를 만든다. */
function project(p: Partial<ResearchProject> & { id: string }): ResearchProject {
  return {
    title: p.id,
    title_ko: "",
    startDate: null,
    endDate: null,
    status: "Completed",
    funder: "",
    funder_ko: "",
    description: "",
    description_ko: "",
    slug: "",
    featured: false,
    grantNumber: "",
    publicationIds: [],
    ...p,
  };
}

const TODAY = "2026-10-13";
const ids = (list: ResearchProject[]) => list.map((p) => p.id);

// ── 진행 중 판정 ────────────────────────────────────────────────

test("Status=Ongoing + 종료 예정일이 미래면 진행 중", () => {
  const p = project({ id: "a", status: "Ongoing", startDate: "2021-06-01", endDate: "2028-02-29" });
  assert.equal(isOngoing(p, TODAY), true);
  assert.equal(formatPeriod(p.startDate, p.endDate, true, "Present"), "2021.06 – 2028.02");
});

test("End_date 가 비어 있으면 진행 중", () => {
  const p = project({ id: "a", status: "Completed", startDate: "2021-06-01", endDate: null });
  assert.equal(isOngoing(p, TODAY), true);
});

test("End_date 가 과거여도 Status=Ongoing 이면 진행 중", () => {
  const p = project({ id: "a", status: "Ongoing", startDate: "2018-03-01", endDate: "2020-02-29" });
  assert.equal(isOngoing(p, TODAY), true);
});

test("End_date 가 미래면 Status 와 무관하게 진행 중", () => {
  const p = project({ id: "a", status: "Completed", startDate: "2024-03-01", endDate: "2027-02-28" });
  assert.equal(isOngoing(p, TODAY), true);
});

test("End_date 가 과거이고 Status=Completed 면 진행 중이 아니다", () => {
  const p = project({ id: "a", status: "Completed", startDate: "2020-03-01", endDate: "2023-02-28" });
  assert.equal(isOngoing(p, TODAY), false);
});

test("Status=Planned 는 진행 중이 아니다 (종료 그룹과 같은 규칙)", () => {
  const p = project({ id: "a", status: "Planned", startDate: "2019-01-01", endDate: "2020-12-31" });
  assert.equal(isOngoing(p, TODAY), false);
});

test("End_date 가 빌드 날짜와 같은 날이면 진행 중 (>= 비교)", () => {
  const p = project({ id: "a", status: "Completed", startDate: "2020-01-01", endDate: TODAY });
  assert.equal(isOngoing(p, TODAY), true);
});

// ── 정렬 ───────────────────────────────────────────────────────

test("진행 중 2개 + 종료 3개 → 진행 중이 위, 각 그룹 안에서 시작일 내림차순", () => {
  const list = [
    project({ id: "done-2020", startDate: "2020-03-01", endDate: "2023-02-28" }),
    project({ id: "ongoing-2021", status: "Ongoing", startDate: "2021-06-01", endDate: "2028-02-29" }),
    project({ id: "done-2018", startDate: "2018-01-01", endDate: "2019-12-31" }),
    project({ id: "ongoing-2024", startDate: "2024-03-01", endDate: null }),
    project({ id: "done-2021", startDate: "2021-11-01", endDate: "2022-01-31" }),
  ];
  assert.deepEqual(ids(sortProjects(list, TODAY, "ko")), [
    "ongoing-2024",
    "ongoing-2021",
    "done-2021",
    "done-2020",
    "done-2018",
  ]);
});

test("시작일이 같으면 End_date 내림차순, End_date 없는 항목이 위", () => {
  const list = [
    project({ id: "ends-2022", status: "Ongoing", startDate: "2021-06-01", endDate: "2022-12-31" }),
    project({ id: "no-end", status: "Ongoing", startDate: "2021-06-01", endDate: null }),
    project({ id: "ends-2028", status: "Ongoing", startDate: "2021-06-01", endDate: "2028-02-29" }),
  ];
  assert.deepEqual(ids(sortProjects(list, TODAY, "ko")), ["no-end", "ends-2028", "ends-2022"]);
});

test("시작일·종료일이 같으면 표시 제목순 (한글 페이지는 title_ko 기준)", () => {
  const list = [
    project({ id: "c", title_ko: "다과제", startDate: "2020-01-01", endDate: "2021-01-01" }),
    project({ id: "a", title_ko: "가과제", startDate: "2020-01-01", endDate: "2021-01-01" }),
    project({ id: "b", title_ko: "나과제", startDate: "2020-01-01", endDate: "2021-01-01" }),
  ];
  assert.deepEqual(ids(sortProjects(list, TODAY, "ko")), ["a", "b", "c"]);
});

test("Start_date 가 없는 항목은 각 그룹의 맨 아래", () => {
  const list = [
    project({ id: "no-start-ongoing", status: "Ongoing", startDate: null, endDate: null }),
    project({ id: "ongoing", status: "Ongoing", startDate: "2021-01-01", endDate: "2028-01-01" }),
    project({ id: "no-start-done", startDate: null, endDate: "2019-01-01" }),
    project({ id: "done", startDate: "2018-01-01", endDate: "2019-01-01" }),
  ];
  assert.deepEqual(ids(sortProjects(list, TODAY, "ko")), [
    "ongoing",
    "no-start-ongoing",
    "done",
    "no-start-done",
  ]);
});

test("sortProjects 는 원본 배열을 바꾸지 않는다", () => {
  const list = [
    project({ id: "old", startDate: "2018-01-01", endDate: "2019-01-01" }),
    project({ id: "new", startDate: "2021-01-01", endDate: "2022-01-01" }),
  ];
  sortProjects(list, TODAY, "ko");
  assert.deepEqual(ids(list), ["old", "new"]);
});

// ── 기간 표시 ───────────────────────────────────────────────────

test("종료된 과제는 시작·종료 연월", () => {
  assert.equal(formatPeriod("2020-03-01", "2023-02-28", false, "Present"), "2020.03 – 2023.02");
});

test("진행 중 + 종료일 없음 → 영문 Present / 한글 진행 중", () => {
  assert.equal(formatPeriod("2021-06-01", null, true, "Present"), "2021.06 – Present");
  assert.equal(formatPeriod("2021-06-01", null, true, "진행 중"), "2021.06 – 진행 중");
});

test("시작·종료가 같은 달이면 한쪽만 표시", () => {
  assert.equal(formatPeriod("2020-03-01", "2020-03-31", false, "Present"), "2020.03");
});

test("Start_date 가 없으면 기간 줄을 만들지 않는다 (null)", () => {
  assert.equal(formatPeriod(null, "2023-02-28", false, "Present"), null);
});

test("월초 날짜가 전월로 밀리지 않는다 (타임존)", () => {
  // new Date("2021-03-01") 은 UTC 자정 → Asia/Seoul 로 찍으면 2월 28일이 된다.
  // 문자열에서 연·월을 직접 떼어 내므로 그 현상이 없어야 한다.
  assert.equal(formatPeriod("2021-03-01", "2021-03-31", false, "Present"), "2021.03");
  assert.equal(formatPeriod("2021-01-01", "2021-12-31", false, "Present"), "2021.01 – 2021.12");
});

test("구분 기호는 en dash 양옆 공백 한 칸", () => {
  assert.equal(formatPeriod("2020-03-01", "2023-02-28", false, "Present"), "2020.03 \u2013 2023.02");
});

test("날짜 형식이 깨져 있으면 기간 줄을 만들지 않는다", () => {
  assert.equal(formatPeriod("2020", "2023-02-28", false, "Present"), null);
});

// ── 제목 폴백 ──────────────────────────────────────────────────

test("Title_ko 가 비면 한글 정렬에서도 Title 을 쓴다", () => {
  const list = [
    project({ id: "b", title: "나과제", title_ko: "", startDate: "2020-01-01", endDate: "2021-01-01" }),
    project({ id: "a", title: "가과제", title_ko: "", startDate: "2020-01-01", endDate: "2021-01-01" }),
  ];
  assert.deepEqual(ids(sortProjects(list, TODAY, "ko")), ["a", "b"]);
});

// ── 빌드 날짜 ──────────────────────────────────────────────────

test("seoulBuildDate 는 Asia/Seoul 기준 날짜를 돌려준다", () => {
  // UTC 2026-10-12 15:30 == KST 2026-10-13 00:30 → 서울에서는 이미 13일이다.
  assert.equal(seoulBuildDate(new Date("2026-10-12T15:30:00Z")), "2026-10-13");
  assert.equal(seoulBuildDate(new Date("2026-10-12T14:00:00Z")), "2026-10-12");
  assert.match(seoulBuildDate(), /^\d{4}-\d{2}-\d{2}$/);
});
