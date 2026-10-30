/**
 * 현재 구성원 / Alumni 분리·정렬 단위 테스트.
 *
 * 실제 Notion 데이터에는 휴학·수료·퇴직·퇴실 상태가 아직 없어서 빌드만으로는
 * 그 분기를 확인할 수 없다. 그래서 여기서 검증한다.
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alumniGroups,
  currentMembers,
  isAlumnus,
  isCurrent,
  unknownStatuses,
} from "../src/lib/members.ts";
import type { Member } from "../src/lib/people-types.ts";

function member(p: Partial<Member> & { id: string }): Member {
  return {
    slug: p.id,
    name: p.id,
    name_ko: "",
    position: "",
    status: "재직·재학",
    joinedDate: "",
    leftDate: "",
    email: "",
    positionTitle: "",
    positionTitle_ko: "",
    researchTopic: "",
    researchTopic_ko: "",
    researchDescription: "",
    researchDescription_ko: "",
    researchAreas: [],
    office: "",
    office_ko: "",
    officePhone: "",
    links: { scholar: "", orcid: "", researchGate: "" },
    degrees: [],
    degreeHistory: [],
    graduatedYear: null,
    ...p,
  };
}
const ids = (list: Member[]) => list.map((m) => m.id);

// ── 현재 / Alumni 분리 ─────────────────────────────────────────

test("재직·재학 / 휴학 / 수료는 현재 구성원", () => {
  for (const st of ["재직·재학", "휴학", "수료"]) {
    assert.equal(isCurrent(member({ id: "a", status: st })), true, st);
    assert.equal(isAlumnus(member({ id: "a", status: st })), false, st);
  }
});

test("졸업 / 퇴직·퇴실은 Alumni", () => {
  for (const st of ["졸업", "퇴직·퇴실"]) {
    assert.equal(isAlumnus(member({ id: "a", status: st })), true, st);
    assert.equal(isCurrent(member({ id: "a", status: st })), false, st);
  }
});

test("현재 구성원 목록에 졸업생이 섞이지 않는다", () => {
  const list = [
    member({ id: "cur", status: "재직·재학" }),
    member({ id: "grad", status: "졸업" }),
    member({ id: "leave", status: "휴학" }),
  ];
  assert.deepEqual(ids(currentMembers(list)), ["cur", "leave"]);
});

test("알 수 없는 상태는 양쪽에서 빠지고 경고 대상이 된다", () => {
  const list = [member({ id: "x", status: "파견", name_ko: "홍길동" })];
  assert.deepEqual(currentMembers(list), []);
  assert.deepEqual(alumniGroups(list), []);
  assert.deepEqual(unknownStatuses(list), [{ who: "홍길동", status: "파견" }]);
});

test("상태가 빈 문자열이어도 빌드가 아니라 경고로 끝난다", () => {
  assert.deepEqual(unknownStatuses([member({ id: "x", status: "" })]), [
    { who: "x", status: "" },
  ]);
});

// ── Alumni 그룹 ────────────────────────────────────────────────

const grad = (id: string, degrees: string[], year: number | null, name = id) =>
  member({ id, status: "졸업", degrees, graduatedYear: year, name });

test("학위에 Ph.D. 가 있으면 Ph.D. 그룹, 없으면 M.S. 그룹", () => {
  const g = alumniGroups([
    grad("phd", ["Ph.D."], 2023),
    grad("ms", ["M.S."], 2022),
    grad("none", [], 2021),
  ]);
  assert.deepEqual(g.map((x) => x.key), ["phd", "ms"]);
  assert.deepEqual(ids(g[0].items), ["phd"]);
  assert.deepEqual(ids(g[1].items), ["ms", "none"]);
});

test("Ph.D.+M.S. 를 모두 가진 사람은 Ph.D. 쪽에만 한 번 나온다", () => {
  const g = alumniGroups([grad("both", ["Ph.D.", "M.S."], 2021)]);
  assert.deepEqual(g.map((x) => x.key), ["phd"]);
  assert.deepEqual(ids(g[0].items), ["both"]);
});

test("졸업 연도 내림차순으로 정렬한다", () => {
  const g = alumniGroups([
    grad("y2018", ["M.S."], 2018),
    grad("y2026", ["M.S."], 2026),
    grad("y2022", ["M.S."], 2022),
  ]);
  assert.deepEqual(ids(g[0].items), ["y2026", "y2022", "y2018"]);
});

test("졸업 연도가 없는 사람은 맨 뒤로 간다", () => {
  const g = alumniGroups([
    grad("none", ["M.S."], null),
    grad("y2015", ["M.S."], 2015),
  ]);
  assert.deepEqual(ids(g[0].items), ["y2015", "none"]);
});

test("같은 연도면 영문명 오름차순", () => {
  const g = alumniGroups([
    grad("c", ["M.S."], 2024, "Chang Hyun Lee"),
    grad("a", ["M.S."], 2024, "An Na Choi"),
    grad("s", ["M.S."], 2024, "Seo Young Hwang"),
  ]);
  assert.deepEqual(ids(g[0].items), ["a", "c", "s"]);
});

test("영문명이 비면 한국어 이름으로 정렬한다", () => {
  const g = alumniGroups([
    member({ id: "b", status: "졸업", degrees: ["M.S."], graduatedYear: 2024, name: "", name_ko: "나" }),
    member({ id: "a", status: "졸업", degrees: ["M.S."], graduatedYear: 2024, name: "", name_ko: "가" }),
  ]);
  assert.deepEqual(ids(g[0].items), ["a", "b"]);
});

test("빈 그룹은 돌려주지 않는다 (빈 제목이 화면에 남지 않게)", () => {
  const g = alumniGroups([grad("ms", ["M.S."], 2020)]);
  assert.equal(g.length, 1);
  assert.equal(g[0].key, "ms");
});

test("Alumni 가 0명이면 빈 배열", () => {
  assert.deepEqual(alumniGroups([member({ id: "cur" })]), []);
  assert.deepEqual(alumniGroups([]), []);
});

test("원본 배열을 바꾸지 않는다", () => {
  const list = [grad("old", ["M.S."], 2010), grad("new", ["M.S."], 2024)];
  alumniGroups(list);
  assert.deepEqual(ids(list), ["old", "new"]);
});
