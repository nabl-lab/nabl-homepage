/**
 * 콘텐츠 데이터 형식(타입) 정의.
 *
 * 데이터의 "모양"만 여기서 정의한다. 실제 데이터 로딩과 헬퍼 함수는 `content.ts` 담당이며,
 * 페이지·컴포넌트는 여전히 `content.ts` 를 통해서만 타입과 데이터를 가져온다.
 *
 * 언어 필드 규칙: 영문은 기본 필드명(`title`), 한글은 `_ko` 접미사(`title_ko`).
 */
export type { Locale } from "../i18n/ui";

export interface Member {
  id: string;
  name: string;
  name_ko: string;
  position: string;
  /** 같은 직책 안에서 이 값이 있으면 입실일보다 우선해 정렬한다. */
  order?: number;
  joinedDate: string;
  email: string;
  researchTopic: string;
  researchTopic_ko: string;
}

export interface Alumnus {
  id: string;
  name: string;
  name_ko: string;
  degree: string;
  graduatedYear: number;
  afterAffiliation: string;
  afterAffiliation_ko: string;
}

export interface Publication {
  id: string;
  title: string;
  title_ko: string;
  authors: string;
  venue: string;
  venue_ko: string;
  year: number;
  category: "international" | "domestic" | "conference";
  link: string;
}

export interface Patent {
  id: string;
  title: string;
  title_ko: string;
  number: string;
  date: string;
  status: "registered" | "applied";
  inventors: string;
}

export interface Award {
  id: string;
  title: string;
  title_ko: string;
  recipient: string;
  recipient_ko: string;
  organization: string;
  organization_ko: string;
  date: string;
  year: number;
}

export interface NewsItem {
  id: string;
  slug: string;
  date: string;
  title: string;
  title_ko: string;
  body: string;
  body_ko: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  title_ko: string;
  summary: string;
  summary_ko: string;
  themes: string[];
  themes_ko: string[];
}

export interface ResearchProject {
  id: string;
  title: string;
  title_ko: string;
  period: string;
  funder: string;
  funder_ko: string;
}
