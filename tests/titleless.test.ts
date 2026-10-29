/**
 * 제목 빈 행 검출 단위 테스트 — 컬렉션별 설정이 매퍼 조건과 맞는지.
 *
 * 지금 Notion 데이터에는 제목 빈 공개 행이 **한 건도 없다**(전 컬렉션 교차 확인).
 * 그래서 빌드 로그만으로는 이 검증이 동작하는지 알 수 없어 여기서 확인한다.
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { titlelessHints } from "../src/lib/notion/titleless.ts";
import { SPECS, type CollectionKey } from "../src/lib/notion/titleless-specs.ts";
import type { NotionPage } from "../src/lib/notion/client.ts";

/** Notion 응답 모양을 흉내 낸 최소 객체. */
function page(id: string, props: Record<string, unknown>): NotionPage {
  const properties: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "boolean") properties[k] = { type: "checkbox", checkbox: v };
    else if (v === null) properties[k] = { type: "date", date: null };
    else if (typeof v === "object") properties[k] = v;
    else
      properties[k] = {
        type: "rich_text",
        rich_text: v === "" ? [] : [{ plain_text: v }],
      };
  }
  return { id, properties } as unknown as NotionPage;
}

test("제목이 비고 공개된 행만 잡는다", () => {
  const rows = [
    page("ok", { Publish: true, Title: "있음", Slug: "ok" }),
    page("bad", { Publish: true, Title: "", Title_ko: "", Slug: "bad-slug" }),
  ];
  assert.deepEqual(titlelessHints(rows, SPECS.news), ['Slug="bad-slug"']);
});

test("미공개 행은 잡지 않는다 (어차피 화면에 안 나온다)", () => {
  const rows = [page("hidden", { Publish: false, Title: "", Title_ko: "" })];
  assert.deepEqual(titlelessHints(rows, SPECS.news), []);
});

test("한쪽 언어만 있으면 통과한다", () => {
  const rows = [page("ko-only", { Publish: true, Title: "", Title_ko: "한글 제목" })];
  assert.deepEqual(titlelessHints(rows, SPECS.news), []);
});

test("Slug 가 없으면 날짜로, 날짜도 없으면 page id 로 가리킨다", () => {
  const withDate = page("a", {
    Publish: true,
    Title: "",
    Title_ko: "",
    Date: { type: "date", date: { start: "2026-01-02" } },
  });
  assert.deepEqual(titlelessHints([withDate], SPECS.news), ["Date=2026-01-02"]);

  const bare = page("page-abc", { Publish: true, Title: "", Title_ko: "" });
  assert.deepEqual(titlelessHints([bare], SPECS.news), ["page id=page-abc"]);
});

test("rows 가 null 이면 (DS 미설정) 빈 배열", () => {
  assert.deepEqual(titlelessHints(null, SPECS.news), []);
});

// ── Members 만 결이 다른 부분 ──────────────────────────────────

test("Members 는 공개 칸이 '홈페이지 공개' 다", () => {
  const rows = [page("m", { "홈페이지 공개": true, 이름: "", Slug: "m" })];
  assert.deepEqual(titlelessHints(rows, SPECS.members), ['Slug="m"']);
  // Publish 체크박스는 Members 에서 쓰이지 않는다
  const wrong = [page("m2", { Publish: true, 이름: "" })];
  assert.deepEqual(titlelessHints(wrong, SPECS.members), []);
});

test("Members 는 '이름' 하나만 본다 (매퍼와 같은 조건)", () => {
  // 영문명이 있어도 매퍼가 버리므로 경고 대상이다
  const rows = [page("m", { "홈페이지 공개": true, 이름: "", 영문명: "Gildong Hong" })];
  assert.equal(titlelessHints(rows, SPECS.members).length, 1);
});

// ── 설정 자체의 건전성 ─────────────────────────────────────────

test("모든 컬렉션 설정에 label·publish·titleProps·fieldLabel 이 있다", () => {
  const keys = Object.keys(SPECS) as CollectionKey[];
  assert.ok(keys.length >= 9, `컬렉션 ${keys.length}개`);
  for (const k of keys) {
    const s = SPECS[k];
    assert.ok(s.label, k);
    assert.ok(s.publish, k);
    assert.ok(s.titleProps.length > 0, k);
    assert.ok(s.fieldLabel, k);
  }
});

test("Publications 의 title 속성은 '이름' 이다 (Title 이 아니다)", () => {
  assert.ok(SPECS.publications.titleProps.includes("이름"));
});

test("PI Profile 은 Content / Content_ko 를 본다", () => {
  assert.deepEqual([...SPECS.piProfile.titleProps], ["Content", "Content_ko"]);
});
