/**
 * 콘텐츠 데이터 형식 — **소식·공개 자료**.
 *
 * 같은 축의 다른 파일: people-types.ts(사람), work-types.ts(연구·성과).
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */

export interface NewsItem {
  id: string;
  slug: string;
  date: string;
  title: string;
  title_ko: string;
  body: string;
  body_ko: string;
}

/** 자료실 항목 (Notion Resources). File 은 내려받지 않고 externalUrl 로만 노출한다. */
export interface Resource {
  id: string;
  slug: string;
  title: string;
  title_ko: string;
  description: string;
  description_ko: string;
  type: string;
  date: string | null;
  order?: number;
  /** 외부 링크. 없으면 다운로드 버튼을 숨긴다. */
  externalUrl: string | null;
  /** 빌드 시 public/ 으로 내려받은 로컬 경로 */
  thumbnail?: string;
}
