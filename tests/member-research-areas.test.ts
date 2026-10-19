/**
 * 구성원 연구 분야 검증 단위 테스트 — 경고 3종이 제대로 나는지.
 *
 * 실제 Notion 데이터는 지금 전부 정상이라(공개 구성원 11명 모두 Theme 행 1개 이상,
 * Slug 전부 있음) 빌드 로그만으로는 경고 동작을 확인할 수 없다. 그래서 여기서 검증한다.
 *
 * 실행: npm test
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { checkMemberResearchAreas } from "../src/lib/notion/validate.ts";

let warnings: string[] = [];
const realWarn = console.warn;
beforeEach(() => {
  warnings = [];
  console.warn = (msg?: unknown) => void warnings.push(String(msg));
});
afterEach(() => {
  console.warn = realWarn;
});

type Area = { title: string; title_ko: string; slug: string; category: string };
const area = (p: Partial<Area> = {}): Area => ({
  title: "Theme A",
  title_ko: "분야 가",
  slug: "theme-a",
  category: "Theme",
  ...p,
});
const member = (name_ko: string, areas: Area[]) => ({ name: "", name_ko, researchAreas: areas });

test("정상 데이터면 경고가 없다", () => {
  checkMemberResearchAreas([member("홍길동", [area()])]);
  assert.deepEqual(warnings, []);
});

test("연구 분야가 비면 경고한다 (이름을 모아 한 줄로)", () => {
  checkMemberResearchAreas([member("홍길동", []), member("김철수", [])]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /연구 분야가 연결되지 않은 공개 구성원 2명/);
  assert.match(warnings[0], /홍길동, 김철수/);
  assert.match(warnings[0], /연구 분야 \(Research\)/);
});

test("Scope 행이 연결되면 경고한다", () => {
  checkMemberResearchAreas([
    member("홍길동", [area({ category: "Scope", title_ko: "합성생물학" })]),
  ]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /홍길동 → 합성생물학/);
  assert.match(warnings[0], /Theme 행만 연결/);
});

test("Slug 가 없으면 경고한다", () => {
  checkMemberResearchAreas([member("홍길동", [area({ slug: "", title_ko: "분야 나" })])]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /홍길동 → 분야 나/);
  assert.match(warnings[0], /Slug 가 없어 상세 링크를 만들 수 없습니다/);
});

test("Scope + Slug 없음이 겹치면 경고가 두 줄 난다", () => {
  checkMemberResearchAreas([member("홍길동", [area({ category: "Scope", slug: "" })])]);
  assert.equal(warnings.length, 2);
});

test("미공개(Publish 미체크) 행은 경고 대상이 아니다", () => {
  // publish 는 링크 여부만 가른다. 검증 함수는 publish 를 보지 않는다.
  checkMemberResearchAreas([member("홍길동", [area()])]);
  assert.deepEqual(warnings, []);
});

test("전환기 다중선택 폴백(category 빈 값)은 Scope 경고를 내지 않는다", () => {
  checkMemberResearchAreas([member("홍길동", [area({ category: "", slug: "" })])]);
  // Slug 경고만 난다
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Slug 가 없어/);
});

test("여러 분야 중 문제 있는 것만 지적한다", () => {
  checkMemberResearchAreas([
    member("백승필", [
      area({ title_ko: "분야 가" }),
      area({ title_ko: "분야 나", slug: "" }),
      area({ title_ko: "합성생물학", category: "Scope" }),
    ]),
  ]);
  assert.equal(warnings.length, 2);
  assert.ok(warnings.some((w) => /분야 나/.test(w) && /Slug/.test(w)));
  assert.ok(warnings.some((w) => /합성생물학/.test(w) && /Theme/.test(w)));
  assert.ok(!warnings.some((w) => /분야 가/.test(w)));
});

test("이름이 비면 '(이름 없음)' 으로 찍는다", () => {
  checkMemberResearchAreas([{ name: "", name_ko: "", researchAreas: [] }]);
  assert.match(warnings[0], /\(이름 없음\)/);
});

test("0명을 넣으면 경고가 없다", () => {
  checkMemberResearchAreas([]);
  assert.deepEqual(warnings, []);
});
