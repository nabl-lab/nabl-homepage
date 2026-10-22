/**
 * 필수 필드 검증 단위 테스트 — 불완전한 항목만 빠지고 나머지는 남는지.
 *
 * 실행: npm test
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고.
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  completeAwards,
  completeMembers,
  completeNews,
  completePatents,
  completeResources,
} from "../src/lib/required-fields.ts";
import { checkTitlelessRows } from "../src/lib/notion/validate.ts";
import type { Member, NewsItem } from "../src/lib/content-types.ts";

/** console.warn 을 가로채 로그 문구까지 확인한다. */
let warnings: string[] = [];
const realWarn = console.warn;
beforeEach(() => {
  warnings = [];
  console.warn = (msg?: unknown) => void warnings.push(String(msg));
});
afterEach(() => {
  console.warn = realWarn;
});

function newsItem(p: Partial<NewsItem> & { id: string }): NewsItem {
  return {
    slug: "a-slug",
    title: "Title",
    title_ko: "",
    body: "",
    body_ko: "",
    date: "2026-01-02",
    ...p,
  } as NewsItem;
}

function member(p: Partial<Member> & { id: string }): Member {
  return {
    slug: "",
    name: "",
    name_ko: "홍길동",
    position: "박사과정",
    status: "재직·재학",
    joinedDate: "",
    leftDate: "",
    email: "",
    researchTopic: "",
    researchTopic_ko: "",
    researchDescription: "",
    researchDescription_ko: "",
    ...p,
  } as Member;
}

// ── 소식 ───────────────────────────────────────────────────────

test("slug 가 비면 그 소식만 빠지고 나머지는 남는다", () => {
  const kept = completeNews([
    newsItem({ id: "ok" }),
    newsItem({ id: "bad", slug: "", title_ko: "테스트용 뉴스" }),
  ]);
  assert.deepEqual(kept.map((n) => n.id), ["ok"]);
});

test("경고 문구가 어떤 항목이 왜 빠졌는지 알려 준다", () => {
  completeNews([newsItem({ id: "bad", slug: "", title_ko: "테스트용 뉴스" })]);
  assert.equal(warnings[0], "[skip] News '테스트용 뉴스': slug 누락");
});

test("date 가 비면 빠진다 (화면에 Invalid Date 가 찍히는 것을 막는다)", () => {
  const kept = completeNews([newsItem({ id: "bad", date: "" })]);
  assert.equal(kept.length, 0);
  assert.match(warnings[0], /date 누락/);
});

test("date 형식이 깨져 있어도 빠진다", () => {
  assert.equal(completeNews([newsItem({ id: "bad", date: "2026년 1월" })]).length, 0);
});

test("필드 두 개가 동시에 비면 한 줄에 둘 다 적는다", () => {
  completeNews([newsItem({ id: "bad", slug: "", date: "", title: "Both missing" })]);
  assert.equal(warnings[0], "[skip] News 'Both missing': slug, date 누락");
});

test("제목이 비어 있으면 '(제목 없음)' 으로 찍는다", () => {
  completeNews([newsItem({ id: "bad", slug: "", title: "", title_ko: "" })]);
  assert.match(warnings[0], /\(제목 없음\)/);
});

test("건너뛴 건수 요약을 남긴다", () => {
  completeNews([newsItem({ id: "ok" }), newsItem({ id: "bad", slug: "" })]);
  assert.match(warnings.at(-1)!, /News: 1건을 건너뛰었습니다 \(전체 2건\)/);
});

test("모두 정상이면 경고를 남기지 않는다", () => {
  const items = [newsItem({ id: "a" }), newsItem({ id: "b", slug: "b-slug" })];
  assert.equal(completeNews(items).length, 2);
  assert.deepEqual(warnings, []);
});

test("0건을 넣으면 0건이 나오고 경고도 없다", () => {
  assert.deepEqual(completeNews([]), []);
  assert.deepEqual(warnings, []);
});

// ── 구성원 ─────────────────────────────────────────────────────

test("직책이 비어도 구성원은 남는다 (일부러 필수가 아니다)", () => {
  const kept = completeMembers([member({ id: "a", position: "" })]);
  assert.equal(kept.length, 1);
  assert.deepEqual(warnings, []);
});

test("slug 가 비어도 구성원은 남는다 (상세 페이지만 안 만든다)", () => {
  assert.equal(completeMembers([member({ id: "a", slug: "" })]).length, 1);
});

test("이름이 양쪽 다 비면 구성원이 빠진다", () => {
  const kept = completeMembers([member({ id: "a", name: "", name_ko: "" })]);
  assert.equal(kept.length, 0);
  assert.match(warnings[0], /이름 누락/);
});

test("영문명만 있어도 구성원은 남는다", () => {
  assert.equal(
    completeMembers([member({ id: "a", name: "Gildong Hong", name_ko: "" })]).length,
    1,
  );
});

// ── 날짜로 연도 그룹을 만드는 것들 ────────────────────────────────

test("특허는 날짜가 없으면 빠진다 (NaN 연도 그룹 방지)", () => {
  const base = {
    id: "a",
    title: "T",
    title_ko: "",
    number: "",
    status: "",
    registrationNumber: "",
    registrationDate: null,
    country: "",
    inventors: "",
  };
  assert.equal(completePatents([{ ...base, date: "" }]).length, 0);
  assert.equal(completePatents([{ ...base, date: "2020-03-01" }]).length, 1);
});

test("수상은 날짜가 없으면 빠진다 (NaN 연도 그룹 방지)", () => {
  const base = {
    id: "a",
    title: "T",
    title_ko: "",
    recipient: "",
    recipient_ko: "",
    organization: "",
    organization_ko: "",
    year: 0,
  };
  assert.equal(completeAwards([{ ...base, date: "" }]).length, 0);
  assert.equal(completeAwards([{ ...base, date: "2020-03-01" }]).length, 1);
});

// ── 공개 자료 ──────────────────────────────────────────────────

test("공개 자료는 slug 가 비면 빠진다 (상세 경로가 slug 로 만들어진다)", () => {
  const base = {
    id: "a",
    title: "T",
    title_ko: "",
    description: "",
    description_ko: "",
    type: "",
    date: null,
    externalUrl: null,
  };
  assert.equal(completeResources([{ ...base, slug: "" }]).length, 0);
  assert.match(warnings[0], /slug 누락/);
  assert.equal(completeResources([{ ...base, slug: "guide" }]).length, 1);
});

// ── 제목 없는 행 (Notion 경로) ───────────────────────────────────

test("소식은 제목이 양쪽 다 비면 빠진다 (JSON 폴백 경로)", () => {
  const kept = completeNews([newsItem({ id: "bad", title: "", title_ko: "" })]);
  assert.equal(kept.length, 0);
  assert.match(warnings[0], /title 누락/);
});

test("checkTitlelessRows 는 단서를 모아 한 줄로 경고한다", () => {
  checkTitlelessRows("News", ['Slug="a" Date=2026-01-02', "page id=abc"], "Title / Title_ko");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Title \/ Title_ko 이\(가\) 비어 제외된 항목 2건/);
  assert.match(warnings[0], /Slug="a" Date=2026-01-02, page id=abc/);
});

test("빠진 속성 이름은 컬렉션마다 다르게 찍힌다", () => {
  checkTitlelessRows("Members", ["page id=abc"], "이름");
  assert.match(warnings[0], /Members: 이름 이\(가\) 비어/);
});

test("제목 없는 행이 없으면 경고하지 않는다", () => {
  checkTitlelessRows("News", [], "Title / Title_ko");
  assert.deepEqual(warnings, []);
});
