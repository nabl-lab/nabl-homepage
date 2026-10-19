/**
 * 연구 분야 목록·상세 규칙 + 행 점검 경고 단위 테스트.
 *
 * 실제 Notion 5행이 전부 Publish=false 라 빌드 로그만으로는 상세 페이지 생성과
 * 경고 동작을 확인할 수 없다. 그래서 여기서 검증한다.
 *
 * 실행: npm test
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  hasDetailPage,
  scopeAreas,
  themeAreas,
  themeDetailPages,
} from "../src/lib/research.ts";
import { checkResearchAreas } from "../src/lib/notion/validate-rows.ts";
import type { ResearchArea } from "../src/lib/research-types.ts";

function area(p: Partial<ResearchArea> & { id: string }): ResearchArea {
  return {
    slug: p.id,
    title: p.id,
    title_ko: "",
    summary: "본문",
    summary_ko: "",
    category: "Theme",
    code: "",
    keywords: [],
    featured: false,
    publish: true,
    members: [],
    projects: [],
    ...p,
  };
}
const ids = (list: ResearchArea[]) => list.map((a) => a.id);

// ── 목록 (요구사항 4) ───────────────────────────────────────────

test("Scope 와 Theme 를 갈라내고 Order 오름차순으로 준다", () => {
  const list = [
    area({ id: "theme-b", order: 20 }),
    area({ id: "scope", category: "Scope", order: 10 }),
    area({ id: "theme-a", order: 10 }),
  ];
  assert.deepEqual(ids(scopeAreas(list)), ["scope"]);
  assert.deepEqual(ids(themeAreas(list)), ["theme-a", "theme-b"]);
});

test("Order 가 없는 행은 맨 뒤로 간다", () => {
  const list = [area({ id: "no-order" }), area({ id: "first", order: 1 })];
  assert.deepEqual(ids(themeAreas(list)), ["first", "no-order"]);
});

test("목록은 미공개 Theme 도 담는다 (이름은 보여 주므로)", () => {
  assert.deepEqual(ids(themeAreas([area({ id: "hidden", publish: false })])), ["hidden"]);
});

// ── 상세 페이지 생성 조건 (요구사항 1) ──────────────────────────

test("공개 + Theme + Slug 있음 일 때만 상세 페이지를 만든다", () => {
  const list = [
    area({ id: "ok" }),
    area({ id: "unpublished", publish: false }),
    area({ id: "scope-row", category: "Scope" }),
    area({ id: "no-slug", slug: "" }),
  ];
  assert.deepEqual(ids(themeDetailPages(list)), ["ok"]);
});

test("Slug 가 겹치면 먼저 온 행만 경로를 만든다 (중복 경로는 빌드를 죽인다)", () => {
  const list = [
    area({ id: "first", slug: "dup", order: 1 }),
    area({ id: "second", slug: "dup", order: 2 }),
  ];
  assert.deepEqual(ids(themeDetailPages(list)), ["first"]);
});

test("전 행이 미공개면 상세 페이지가 0개다 (지금 실제 데이터 상태)", () => {
  const list = [area({ id: "a", publish: false }), area({ id: "b", publish: false })];
  assert.deepEqual(themeDetailPages(list), []);
});

test("hasDetailPage 는 목록 카드의 링크 여부와 같은 조건을 쓴다", () => {
  assert.equal(hasDetailPage(area({ id: "a" })), true);
  assert.equal(hasDetailPage(area({ id: "a", publish: false })), false);
  assert.equal(hasDetailPage(area({ id: "a", slug: "  " })), false);
  assert.equal(hasDetailPage(area({ id: "a", category: "Scope" })), false);
});

// ── 행 점검 경고 (요구사항 5) ───────────────────────────────────

let warnings: string[] = [];
const realWarn = console.warn;
beforeEach(() => {
  warnings = [];
  console.warn = (m?: unknown) => void warnings.push(String(m));
});
afterEach(() => {
  console.warn = realWarn;
});

test("정상 행이면 경고가 없다", () => {
  checkResearchAreas([area({ id: "a", title_ko: "분야 가" })]);
  assert.deepEqual(warnings, []);
});

test("공개인데 Slug 없으면 경고한다", () => {
  checkResearchAreas([area({ id: "a", title_ko: "분야 가", slug: "" })]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /분야 가.*Slug 가 없어/s);
});

test("공개인데 Description 이 양쪽 다 비면 경고한다", () => {
  checkResearchAreas([area({ id: "a", title_ko: "분야 가", summary: "", summary_ko: "" })]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Description 이 양쪽 언어 모두 비어/);
});

test("한쪽 언어만 있어도 Description 경고는 없다", () => {
  checkResearchAreas([area({ id: "a", summary: "", summary_ko: "한글 본문" })]);
  assert.deepEqual(warnings, []);
});

test("Slug 중복을 경고한다", () => {
  checkResearchAreas([area({ id: "a", slug: "dup" }), area({ id: "b", slug: "dup" })]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Slug "dup" 가 2건 겹칩니다/);
});

test("미공개 행은 Slug·Description 이 비어도 경고하지 않는다", () => {
  checkResearchAreas([
    area({ id: "a", publish: false, slug: "", summary: "", summary_ko: "" }),
  ]);
  assert.deepEqual(warnings, []);
});

test("예약어 Slug 를 경고한다 (/research/publications 와 충돌)", () => {
  checkResearchAreas([area({ id: "a", slug: "publications" })]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /이미 쓰이는 경로와 겹칩니다/);
});
