/**
 * 콘텐츠 데이터 형식 — **연구 분야** (Notion Research DB).
 *
 * relation 으로 구성원·과제가 붙어 다른 성과 타입보다 구조가 크다. 그래서
 * work-types.ts 에서 따로 뺐다 (매퍼도 map-research.ts 로 나뉘어 있다).
 *
 * 목록·상세에서 Scope / Theme 를 가르는 규칙은 src/lib/research.ts.
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */

/** 연구 분야에 연결된 구성원 요약. 공개된 사람만 담긴다. */
export interface ResearchMemberRef {
  name: string;
  name_ko: string;
  /** 비어 있으면 상세 페이지가 없으므로 링크를 걸지 않는다. */
  slug: string;
}

/** 연구 분야에 연결된 과제 요약. 공개된 과제만 담긴다. */
export interface ResearchProjectRef {
  title: string;
  title_ko: string;
  slug: string;
}

export interface ResearchArea {
  id: string;
  slug: string;
  title: string;
  title_ko: string;
  /** Notion `Description` / `Description_ko`. 상세 페이지의 본문이다. */
  summary: string;
  summary_ko: string;
  /** "Scope" | "Theme" (Notion 값 그대로) */
  category: string;
  /** Theme 전용 분류 기호 (N | A | B | L). Scope 행은 빈 문자열. */
  code: string;
  /** Notion `Keywords`(쉼표 구분)를 끊어 담은 태그. 비어 있을 수 있다. */
  keywords: string[];
  order?: number;
  featured: boolean;
  /** 공개 여부. **Theme 이고 공개된 행만** 상세 페이지를 만든다. */
  publish: boolean;
  /** 소속 연구원 (Notion `Members` relation). 공개된 사람만. */
  members: ResearchMemberRef[];
  /** 관련 과제 (Notion `Projects` relation). 공개된 과제만. */
  projects: ResearchProjectRef[];
  /** 빌드 시 내려받은 로컬 경로 */
  image?: string;
}
