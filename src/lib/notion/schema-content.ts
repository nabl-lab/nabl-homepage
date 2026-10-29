/**
 * Notion 속성명 — **페이지 문구** (Site Content).
 *
 * 화면에 박혀 있던 소개·비전 문단을 Notion 에서 고칠 수 있게 하는 DB 다.
 * 코드가 `Key` 로 찾고, 같은 Key 가 여러 행이면 `Order` 순서대로 문단이 된다.
 *
 * `Block` 과 `Note` 는 **사람용 메모라 코드가 읽지 않는다** (여기 적어 두지도 않는다).
 * `Page` 도 Notion 에서 보기 좋게 묶는 용도라 코드가 쓰지 않는다.
 *
 * 같은 축의 다른 파일: schema-people.ts, schema-work.ts, schema-news.ts.
 */
export const P_SITE_CONTENT = {
  /** title. 문구 식별자 (예: about.intro). 코드가 이 값으로 찾는다. */
  key: "Key",
  content: "Content",
  contentKo: "Content_ko",
  /** number. 같은 Key 안에서 문단 순서. 없으면 맨 뒤로 보낸다. */
  order: "Order",
  publish: "Publish",
} as const;
