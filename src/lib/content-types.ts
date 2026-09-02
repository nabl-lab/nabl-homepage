/**
 * 콘텐츠 데이터 형식(타입) 정의. "모양"만 여기 두고, 로딩·헬퍼는 content.ts 담당.
 * 언어 필드 규칙: 영문은 기본 필드명(`title`), 한글은 `_ko` 접미사(`title_ko`).
 */
export type { Locale } from "../i18n/ui";

/** 연구실 소개 (about.json). 본문은 localizedText 로 언어를 고른다. */
export interface About {
  intro: string;
  intro_ko: string;
  mission: string;
  mission_ko: string;
}

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
  /** 사진 경로 (예: /images/members/xxx.jpg). 없으면 카드에서 플레이스홀더로 표시. */
  photo?: string;
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
  /** true 인 것만 PI 페이지의 "대표 논문" 에 노출된다. */
  featured?: boolean;
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

/** 기타 성과 (초청강연·저서·언론 등). achievements-etc.json. */
export interface EtcItem {
  id: string;
  kind: string;
  kind_ko: string;
  title: string;
  title_ko: string;
  venue: string;
  venue_ko: string;
  date: string;
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

/**
 * PI 페이지의 학력·경력·대외활동 항목. 세 배열이 같은 모양을 쓴다.
 * 나중에 Notion DB 의 행 하나와 1:1 로 매핑할 구조다.
 */
export interface PiEntry {
  text: string;
  text_ko: string;
  organization: string;
  startYear: number;
  /** 진행 중이면 null */
  endYear: number | null;
  /** 있으면 정렬에서 시작연도보다 우선 (작을수록 위) */
  order?: number;
}

/** PI 프로필 (pi-profile.json). 신원(이름·이메일·사진)은 members.json 의 PI 항목을 쓴다. */
export interface PiProfile {
  title: string;
  title_ko: string;
  office: string;
  office_ko: string;
  researchInterests: {
    keywords: string[];
    keywords_ko: string[];
    description: string;
    description_ko: string;
  };
  education: PiEntry[];
  career: PiEntry[];
  activities: PiEntry[];
  links: { scholar: string; orcid: string };
}
