/**
 * 구성원 개인정보 단위 테스트 — 매퍼가 연구원 이메일·휴대전화를 내보내지 않는지.
 *
 * 연구원 `e-mail` / `Mobile` 은 노션 내부용이다. 화면에서 숨기는 게 아니라 **매퍼 출력에
 * 아예 없어야** 빌드된 HTML·JS·JSON 어디에도 남지 않는다. 지도교수 행만 이메일을
 * `publicEmail` 로 내보낸다 (지도교수 페이지 연락처).
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mapMember } from "../src/lib/notion/map-people.ts";
import { emptyIndex } from "../src/lib/notion/types.ts";
import type { NotionPage } from "../src/lib/notion/client.ts";

const rt = (v: string) => ({ type: "rich_text", rich_text: [{ plain_text: v }] });

/** Notion 응답 모양을 흉내 낸 구성원 행. 이메일·휴대전화가 채워져 있다. */
function memberPage(position: string, mail: string): NotionPage {
  return {
    id: `page-${position}`,
    properties: {
      이름: rt("홍길동"),
      영문명: rt("Gildong Hong"),
      "직책·과정": { type: "select", select: { name: position } },
      "e-mail": { type: "email", email: mail },
      Mobile: { type: "phone_number", phone_number: "010-0000-0000" },
      Slug: rt("hong-gildong"),
    },
  } as unknown as NotionPage;
}

test("연구원 행은 이메일·휴대전화를 출력하지 않는다", () => {
  const m = mapMember(memberPage("박사과정", "student@example.edu"), emptyIndex());
  assert.ok(m);
  assert.equal(m.publicEmail, "");
  assert.ok(!("email" in m), "email 필드가 남아 있다");
  const dumped = JSON.stringify(m);
  assert.ok(!dumped.includes("student@example.edu"), "이메일 주소가 출력에 남았다");
  assert.ok(!dumped.includes("@"), "출력 어딘가에 이메일 형태 값이 있다");
  assert.ok(!dumped.includes("010-0000-0000"), "휴대전화가 출력에 남았다");
});

test("지도교수 행만 publicEmail 로 이메일을 내보낸다", () => {
  const m = mapMember(memberPage("지도교수", "pi@example.edu"), emptyIndex());
  assert.ok(m);
  assert.equal(m.publicEmail, "pi@example.edu");
  assert.ok(!JSON.stringify(m).includes("010-0000-0000"), "휴대전화가 출력에 남았다");
});
