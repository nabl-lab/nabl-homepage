/**
 * 콘텐츠 데이터 형식 — **페이지 문구** (Notion Site Content).
 *
 * 화면에 박혀 있던 소개·비전 문단을 Notion 에서 고치기 위한 것이다.
 * 같은 `key` 가 여러 행이면 `order` 순서대로 **문단 배열**이 된다.
 *
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */
export interface SiteContentEntry {
  /** 문구 식별자 (예: "about.intro"). 코드가 이 값으로 찾는다. */
  key: string;
  /** 영문. localizedText 규칙의 기본 필드. */
  content: string;
  /** 한글. localizedText 가 `content` 가 비면 이걸 쓴다. */
  content_ko: string;
  /** 같은 key 안에서의 문단 순서. 없으면 맨 뒤. */
  order: number | null;
}
