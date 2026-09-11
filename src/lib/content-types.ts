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
  /** 비어 있을 수 있다. 있을 때만 /members/[slug] 상세 페이지를 만든다. */
  slug: string;
  /** 영문명. 비어 있으면 localizedText 가 name_ko 로 폴백한다. */
  name: string;
  name_ko: string;
  /** Notion `직책·과정` 의 한국어 값. 비어 있을 수 있다(정렬 맨 뒤). */
  position: string;
  /** Notion `구성원 상태` (재직·재학 / 휴학 / 수료 / 졸업 / 퇴직·퇴실) */
  status: string;
  /** 같은 직책 안에서 이 값이 있으면 우선해 정렬한다. */
  order?: number;
  joinedDate: string;
  /** 졸업·퇴실일. 재직 중이면 빈 문자열. */
  leftDate: string;
  email: string;
  researchTopic: string;
  researchTopic_ko: string;
  /** 빌드 시 public/ 으로 내려받은 로컬 경로. 없으면 플레이스홀더. */
  photo?: string;
}

export interface Alumnus {
  id: string;
  name: string;
  name_ko: string;
  /** 수료한 학위 과정. members.json 의 position 과 같은 어휘 (예: "Ph.D. Course"). */
  position: string;
  graduatedYear: number;
  thesis_title: string;
  thesis_title_ko: string;
  /** 데이터는 유지하되 현재 화면에는 표시하지 않음 (alumni.astro 주석 참고). */
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
  /**
   * Notion `Type` 값 그대로 (International | Domestic | Conference | Book | Patent).
   * 유니온으로 좁히지 않는다 — Notion 에서 선택지가 추가돼도 빌드가 죽지 않게 하고,
   * 라벨은 optionLabel("publicationType", …) 이 없으면 원문을 그대로 보여준다.
   */
  category: string;
  link: string;
  featured?: boolean; // true 인 것만 PI 페이지 "대표 논문" 에 노출
}

export interface Patent {
  id: string;
  title: string;
  title_ko: string;
  number: string;
  date: string;
  /**
   * Notion `Status` 값 그대로 (Filed | Published | Registered | Transferred | Expired).
   * 라벨은 optionLabel("patentStatus", …). 모르는 값은 원문을 그대로 보여준다.
   */
  status: string;
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

/** 기타 성과 (초청강연·저서·언론 등, achievements-etc.json) */
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

/**
 * 연구 항목 (Notion Research). 한 DB 안에서 `Category` 로 두 역할을 나눈다.
 *  - Scope : 연구 범위 소개문 (여러 건이면 Order 순으로 모두 표시)
 *  - Theme : 세부 연구주제 카드
 */
export interface ResearchArea {
  id: string;
  slug: string;
  title: string;
  title_ko: string;
  summary: string;
  summary_ko: string;
  /** "Scope" | "Theme" (Notion 값 그대로) */
  category: string;
  order?: number;
  featured: boolean;
  /** 빌드 시 내려받은 로컬 경로 */
  image?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  title_ko: string;
  period: string;
  funder: string;
  funder_ko: string;
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

// PI 관련 타입은 역할이 달라 분리했다. 가져다 쓰는 경로는 여기 그대로 유지한다.
export type { PiEntry, PiProfile } from "./pi-types";
