/**
 * Notion 계층 전용 타입 — 사이트 모델(content-types.ts)과 구분된다.
 *
 * relation 속성은 page id 배열만 주므로, DB 별로 **한 번만** 조회해 만든
 * id→객체 맵(RelationIndex)을 매퍼에 넘겨 재사용한다. 행마다 개별 조회하지 않는다.
 * 맵에는 **공개(Publish) 된 항목만** 넣는다 → 비공개 대상은 자동으로 빠진다.
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
 * relation 해석용 인덱스. 공개된 항목만 담는다.
 * 키는 Notion page id.
 */
export interface RelationIndex {
  members: Map<string, PersonRef>;
  projects: Map<string, TitleRef>;
  publications: Map<string, TitleRef>;
  research: Map<string, TitleRef>;
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
