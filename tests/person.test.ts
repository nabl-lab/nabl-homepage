/**
 * 인물 화면 공통 규칙 단위 테스트 — 직위 폴백 · 외부 링크 · 경력 현직/이전.
 *
 * 실제 Notion 데이터는 교수님 한 분만 새 속성이 채워져 있어서, 빈 값 분기는
 * 빌드만으로 전부 확인할 수 없다. 그래서 여기서 검증한다.
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  careerGroups,
  positionLine,
  profileLinks,
  sortEntries,
  sortedAreas,
  yearRange,
} from "../src/lib/person.ts";
import type { Member, MemberResearchArea, PiEntry } from "../src/lib/content-types.ts";

const entry = (p: Partial<PiEntry> & { text: string }): PiEntry => ({
  text_ko: "",
  organization: "",
  startYear: 2000,
  endYear: null,
  ...p,
});

const memberWithLinks = (
  links: Partial<Member["links"]>,
): Member => ({ links: { scholar: "", orcid: "", researchGate: "", ...links } }) as Member;

// ── 직위 폴백 ──────────────────────────────────────────────────

test("Position 이 있으면 그것을 쓴다", () => {
  assert.equal(positionLine("생명정보공학과 교수", "지도교수"), "생명정보공학과 교수");
});

test("Position 이 비면 직책·과정 라벨로 폴백한다", () => {
  assert.equal(positionLine(null, "박사과정"), "박사과정");
  assert.equal(positionLine("", "연구교수"), "연구교수");
});

test("둘 다 비면 null — 화면이 그 줄을 숨긴다", () => {
  assert.equal(positionLine(null, ""), null);
  assert.equal(positionLine("", ""), null);
});

// ── 외부 링크 ──────────────────────────────────────────────────

test("채워진 링크만 돌려준다", () => {
  const links = profileLinks(memberWithLinks({ orcid: "https://orcid.org/x" }));
  assert.deepEqual(links, [{ label: "ORCID", href: "https://orcid.org/x" }]);
});

test("셋 다 비면 빈 배열 — 화면이 그 영역을 숨긴다", () => {
  assert.deepEqual(profileLinks(memberWithLinks({})), []);
});

test("공백만 있는 링크도 비어 있는 것으로 본다", () => {
  assert.deepEqual(profileLinks(memberWithLinks({ scholar: "   " })), []);
});

test("세 링크 순서는 Scholar → ORCID → ResearchGate", () => {
  const links = profileLinks(
    memberWithLinks({ scholar: "s", orcid: "o", researchGate: "r" }),
  );
  assert.deepEqual(links.map((l) => l.label), [
    "Google Scholar",
    "ORCID",
    "ResearchGate",
  ]);
});

// ── 경력 현직/이전 ─────────────────────────────────────────────

test("End_year 가 비면 현직, 값이 있으면 이전", () => {
  const groups = careerGroups([
    entry({ text: "past", startYear: 2010, endYear: 2015, order: 50 }),
    entry({ text: "now", startYear: 2016, endYear: null, order: 10 }),
  ]);
  assert.deepEqual(groups.map((g) => g.current), [true, false]);
  assert.deepEqual(groups[0].items.map((e) => e.text), ["now"]);
  assert.deepEqual(groups[1].items.map((e) => e.text), ["past"]);
});

test("각 묶음 안은 Order 오름차순", () => {
  const groups = careerGroups([
    entry({ text: "c", order: 30 }),
    entry({ text: "a", order: 10 }),
    entry({ text: "b", order: 20 }),
  ]);
  assert.deepEqual(groups[0].items.map((e) => e.text), ["a", "b", "c"]);
});

test("현직이 없으면 이전 묶음만 돌려준다 (빈 제목이 남지 않게)", () => {
  const groups = careerGroups([entry({ text: "past", endYear: 2020 })]);
  assert.deepEqual(groups.map((g) => g.current), [false]);
});

test("0건이면 빈 배열", () => {
  assert.deepEqual(careerGroups([]), []);
});

test("원본 배열을 바꾸지 않는다", () => {
  const list = [entry({ text: "b", order: 20 }), entry({ text: "a", order: 10 })];
  careerGroups(list);
  assert.deepEqual(list.map((e) => e.text), ["b", "a"]);
});

// ── 연도 표기 ──────────────────────────────────────────────────

test("끝 연도가 없으면 넘겨받은 '현재' 문구를 쓴다", () => {
  assert.equal(yearRange(entry({ text: "x", startYear: 2016 }), "현재"), "2016 – 현재");
  assert.equal(yearRange(entry({ text: "x", startYear: 2016 }), "Present"), "2016 – Present");
});

test("시작·종료가 같은 해면 한 번만 표시", () => {
  assert.equal(yearRange(entry({ text: "x", startYear: 2003, endYear: 2003 }), "현재"), "2003");
});

test("구분 기호는 en dash 양옆 공백", () => {
  assert.equal(
    yearRange(entry({ text: "x", startYear: 1997, endYear: 2003 }), "현재"),
    "1997 \u2013 2003",
  );
});

// ── 정렬 ───────────────────────────────────────────────────────

test("연구 분야 카드는 Order 오름차순, 없으면 맨 뒤", () => {
  const area = (title: string, order?: number): MemberResearchArea =>
    ({ title, title_ko: "", slug: "", code: "", category: "Theme", publish: false, order, keywords: [] });
  const sorted = sortedAreas([area("no"), area("b", 20), area("a", 10)]);
  assert.deepEqual(sorted.map((a) => a.title), ["a", "b", "no"]);
});

test("학력·대외활동은 Order 우선, 같으면 시작연도 내림차순", () => {
  const sorted = sortEntries([
    entry({ text: "old", startYear: 1991, order: 10 }),
    entry({ text: "new", startYear: 1997, order: 10 }),
  ]);
  assert.deepEqual(sorted.map((e) => e.text), ["new", "old"]);
});
