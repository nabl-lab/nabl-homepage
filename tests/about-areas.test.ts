/**
 * About 페이지 Research Scope / Areas 화면 규칙 단위 테스트.
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { areaColor, areaPanels, scopeBlocks } from "../src/lib/about-areas.ts";
import type { ResearchArea } from "../src/lib/content-types.ts";

const area = (p: Partial<ResearchArea>): ResearchArea => ({
  id: "id",
  slug: "",
  title: "",
  title_ko: "",
  summary: "",
  summary_ko: "",
  category: "Theme",
  code: "",
  keywords: [],
  featured: false,
  publish: true,
  members: [],
  projects: [],
  ...p,
});

const rows = [
  area({ id: "l", code: "L", order: 40, title: "Liquid", title_ko: "액체", slug: "liquid" }),
  area({ id: "n", code: "N", order: 10, title: "New Bio", title_ko: "신규", slug: "new-bio" }),
  area({ id: "scope", category: "Scope", order: 10, title: "Synthetic Biology", summary: "We design." }),
  area({ id: "a", code: "A", order: 20, title: "Aging", title_ko: "", slug: "" }),
];

test("Theme 행만 Order 순으로 패널이 된다", () => {
  assert.deepEqual(areaPanels(rows, "en").map((p) => p.code), ["N", "A", "L"]);
});

test("부제는 반대 언어 제목이고, 비었거나 같으면 null", () => {
  const [n, a] = areaPanels(rows, "ko");
  assert.equal(n.title, "신규");
  assert.equal(n.subtitle, "New Bio");
  // 한국어 제목이 비어 영문으로 폴백 → 부제도 영문이라 같은 줄이 두 번 나오면 안 된다
  assert.equal(a.title, "Aging");
  assert.equal(a.subtitle, null);
});

test("Code → 색. 모르는 Code 는 중립 회색", () => {
  assert.equal(areaColor("n"), "var(--color-area-n)");
  assert.equal(areaColor("B"), "var(--color-area-b)");
  assert.equal(areaColor("X"), "var(--color-ink-subtle)");
  assert.equal(areaColor(""), "var(--color-ink-subtle)");
});

test("앵커는 Code 기준, Code 가 겹치면 행 id 로 대신한다", () => {
  const dup = [area({ id: "x1", code: "N", title: "A1" }), area({ id: "x2", code: "N", title: "A2" })];
  assert.deepEqual(areaPanels(dup, "en").map((p) => p.anchor), ["area-n", "area-x2"]);
});

test("상세 링크는 상세 페이지가 실제로 생기는 행에만 (공개 + Slug, 중복 Slug 는 첫 행만)", () => {
  const list = [
    area({ id: "p1", code: "N", title: "T1", slug: "same", order: 1 }),
    area({ id: "p2", code: "A", title: "T2", slug: "same", order: 2 }),
    area({ id: "p3", code: "B", title: "T3", slug: "hidden", publish: false, order: 3 }),
  ];
  assert.deepEqual(areaPanels(list, "en").map((p) => p.detailSlug), ["same", null, null]);
});

test("제목이 양쪽 다 빈 Theme 행은 패널을 만들지 않는다", () => {
  assert.equal(areaPanels([area({ id: "e", code: "N" })], "en").length, 0);
});

test("Scope 카드: 설명이 있는 Scope 행만", () => {
  const blocks = scopeBlocks([...rows, area({ id: "s2", category: "Scope", title: "Empty" })], "ko");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "Synthetic Biology"); // 한국어 제목이 비어 영문 폴백
  assert.equal(blocks[0].description, "We design.");
});
