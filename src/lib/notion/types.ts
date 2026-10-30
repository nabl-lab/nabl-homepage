/**
 * Notion 계층 전용 타입 — 사이트 모델(content-types.ts)과 구분된다.
 *
 * relation 속성은 page id 배열만 주므로, DB 별로 **한 번만** 조회해 만든
 * id→객체 맵(RelationIndex)을 매퍼에 넘겨 재사용한다. 행마다 개별 조회하지 않는다.
 * 맵에는 **공개(Publish) 된 항목만** 넣는다 → 비공개 대상은 자동으로 빠진다.
 *
 * **예외: `research` 맵만 미공개 행까지 담는다.** 연구 분야는 공개 전에도 구성원
 * 페이지에 이름을 보여 줘야 해서다(그래야 멤버 페이지가 비어 보이지 않는다).
 * 대신 `publish` 를 같이 담아, 링크를 걸지 말지는 화면이 판단한다.
 */

/** relation 으로 연결된 구성원 요약 */
export interface PersonRef {
  id: string;
  slug: string;
  /** 영문명 (비어 있을 수 있다) */
  name: string;
  /** 한국어 이름 */
  name_ko: string;
}

/** relation 으로 연결된 일반 항목(프로젝트·논문·연구분야) 요약 */
export interface TitleRef {
  id: string;
  slug: string;
  title: string;
  title_ko: string;
}

/**
 * relation 으로 연결된 연구 분야 요약.
 *
 * TitleRef 와 달리 `publish` 와 `category`·`code` 를 함께 담는다.
 *  - `publish`: 상세 링크를 걸지 말지 화면이 판단한다 (미공개면 이름만 표시)
 *  - `category`: 구성원에게 붙는 건 `Theme` 행만이어야 한다. `Scope` 가 붙어 있으면
 *                빌드 로그에 경고가 난다 (notion/validate.ts)
 *  - `code`: Theme 전용 분류 기호(N | A | B | L). 카드 배지에 쓴다
 *  - `order`·`keywords`: 구성원 화면의 연구 분야 카드가 쓴다
 */
export interface ResearchAreaRef {
  id: string;
  slug: string;
  title: string;
  title_ko: string;
  category: string;
  code: string;
  publish: boolean;
  /** 카드 정렬 기준 (Research DB 의 Order). 없으면 맨 뒤. */
  order?: number;
  /** `Keywords`(쉼표 구분)를 끊은 태그. 카드에 보여 준다. */
  keywords: string[];
}

/**
 * relation 해석용 인덱스. 키는 Notion page id.
 * `research` 를 뺀 나머지는 공개된 항목만 담는다 (위 머리말의 예외 설명 참고).
 */
export interface RelationIndex {
  members: Map<string, PersonRef>;
  projects: Map<string, TitleRef>;
  publications: Map<string, TitleRef>;
  /** 미공개 행까지 전부 담는다. 공개 여부는 각 항목의 `publish` 로 판단한다. */
  research: Map<string, ResearchAreaRef>;
}

/** 빈 인덱스 (폴백·테스트용) */
export function emptyIndex(): RelationIndex {
  return {
    members: new Map(),
    projects: new Map(),
    publications: new Map(),
    research: new Map(),
  };
}

/**
 * id 배열을 인덱스로 해석한다. 맵에 없는 id(비공개·삭제됨)는 조용히 버린다.
 */
export function resolveRefs<T>(ids: string[], index: Map<string, T>): T[] {
  return ids.map((id) => index.get(id)).filter((v): v is T => v !== undefined);
}
