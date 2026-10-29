/**
 * 페이지 문구 조회 단위 테스트 — Key 로 찾아 Order 순서대로 문단을 만드는지.
 *
 * 실행: npm test
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  contentKeys,
  oneParagraph,
  paragraphs,
} from "../src/lib/site-content.ts";
import { checkSiteContentKeys } from "../src/lib/notion/validate-content.ts";
import type { SiteContentEntry } from "../src/lib/site-content-types.ts";

const e = (
  key: string,
  order: number | null,
  content: string,
  content_ko = "",
): SiteContentEntry => ({ key, order, content, content_ko });

test("같은 Key 의 문단을 Order 오름차순으로 돌려준다", () => {
  const rows = [e("about.intro", 30, "third"), e("about.intro", 10, "first"), e("about.intro", 20, "second")];
  assert.deepEqual(paragraphs(rows, "about.intro", "en"), ["first", "second", "third"]);
});

test("다른 Key 는 섞이지 않는다", () => {
  const rows = [e("about.intro", 10, "intro"), e("about.mission", 10, "mission")];
  assert.deepEqual(paragraphs(rows, "about.mission", "en"), ["mission"]);
});

test("Order 가 없는 문단은 맨 뒤로 간다", () => {
  const rows = [e("k", null, "no-order"), e("k", 10, "first")];
  assert.deepEqual(paragraphs(rows, "k", "en"), ["first", "no-order"]);
});

test("한국어 화면은 content_ko 를 쓰고, 비면 영문으로 폴백한다", () => {
  const rows = [e("k", 10, "English", "한국어"), e("k", 20, "EN only", "")];
  assert.deepEqual(paragraphs(rows, "k", "ko"), ["한국어", "EN only"]);
  assert.deepEqual(paragraphs(rows, "k", "en"), ["English", "EN only"]);
});

test("영문이 비면 한국어로 폴백한다", () => {
  const rows = [e("k", 10, "", "한국어만")];
  assert.deepEqual(paragraphs(rows, "k", "en"), ["한국어만"]);
});

test("양쪽 언어가 모두 빈 문단은 건너뛴다", () => {
  const rows = [e("k", 10, "", ""), e("k", 20, "살아남음")];
  assert.deepEqual(paragraphs(rows, "k", "en"), ["살아남음"]);
});

test("없는 Key 는 빈 배열 (화면이 그 영역을 렌더하지 않는다)", () => {
  assert.deepEqual(paragraphs([e("a", 10, "x")], "b", "en"), []);
  assert.deepEqual(paragraphs([], "a", "en"), []);
});

test("oneParagraph 는 Order 가 가장 앞선 문단 하나", () => {
  const rows = [e("k", 20, "second"), e("k", 10, "first")];
  assert.equal(oneParagraph(rows, "k", "en"), "first");
  assert.equal(oneParagraph(rows, "none", "en"), null);
});

test("원본 배열을 바꾸지 않는다", () => {
  const rows = [e("k", 20, "b"), e("k", 10, "a")];
  paragraphs(rows, "k", "en");
  assert.deepEqual(rows.map((r) => r.content), ["b", "a"]);
});

test("contentKeys 는 중복을 없애고 정렬해 돌려준다", () => {
  const rows = [e("b", 10, "x"), e("a", 10, "y"), e("a", 20, "z")];
  assert.deepEqual(contentKeys(rows), ["a", "b"]);
});

// ── 필수 Key 경고 ──────────────────────────────────────────────

let warnings: string[] = [];
const realWarn = console.warn;
beforeEach(() => {
  warnings = [];
  console.warn = (m?: unknown) => void warnings.push(String(m));
});
afterEach(() => {
  console.warn = realWarn;
});

test("about.intro 가 없으면 경고한다", () => {
  checkSiteContentKeys([{ key: "about.mission" }]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Key "about\.intro" 가 없습니다/);
  assert.match(warnings[0], /\/about 의 연구실 소개 영역이 화면에 나오지 않습니다/);
});

test("about.intro 가 있으면 경고하지 않는다", () => {
  checkSiteContentKeys([{ key: "about.intro" }]);
  assert.deepEqual(warnings, []);
});
