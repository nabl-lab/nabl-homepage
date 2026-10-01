/**
 * 콘텐츠 데이터 형식 — **연구·성과** (논문, 특허, 수상, 기타 성과, 연구 분야, 연구 과제).
 *
 * 같은 축의 다른 파일: people-types.ts(사람), news-types.ts(소식·자료).
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */

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
  /** 화면에 그대로 찍는 기간 문자열 (예: "2024–2027") */
  period: string;
  funder: string;
  funder_ko: string;
  /** Notion Status 값 그대로. "Ongoing" 이면 진행 중 그룹으로 올린다. */
  status: string;
  /** 내부용(과제 번호). **화면에 표시하지 않는다.** 나중에 쓸 수 있게 담아만 둔다. */
  grantNumber: string;
  /** 이 과제를 사사한 논문의 Notion 페이지 id. **화면에 표시하지 않는다.** */
  publicationIds: string[];
  /** ISO 날짜. 연도별 그룹은 startDate 기준이다. 비어 있으면 진행 중으로 본다. */
  startDate: string | null;
  endDate: string | null;
}

export interface Publication {
  id: string;
  title: string;
  title_ko: string;
  authors: string;
  venue: string;
  venue_ko: string;
  /**
   * 화면의 연도 그룹에 쓰는 값. Published_date 의 연도 → Year 숫자 순으로 정한다.
   * 둘 다 없으면 **null = "연도 미상"** 이다 (0 을 쓰면 실제 연도처럼 정렬돼 섞인다).
   */
  year: number | null;
  /** 게재일(ISO). 같은 연도 안의 정렬 기준. 없으면 그 연도 뒤로 밀린다. */
  publishedDate: string | null;
  /**
   * Notion `Type` 값 그대로 (International | Domestic | Conference | Book | Patent).
   * 유니온으로 좁히지 않는다 — Notion 에서 선택지가 추가돼도 빌드가 죽지 않게 하고,
   * 라벨은 optionLabel("publicationType", …) 이 없으면 원문을 그대로 보여준다.
   */
  category: string;
  link: string;
  featured?: boolean; // true 인 것만 PI 페이지 "대표 논문" 에 노출
  /** 내부용(사사 여부). **화면에 표시하지 않는다.** 나중에 쓸 수 있게 담아만 둔다. */
  personalGrant: boolean;
  /** 사사 과제(Projects) 의 Notion 페이지 id. **화면에 표시하지 않는다.** */
  fundingProjectIds: string[];
}

export interface Patent {
  id: string;
  title: string;
  title_ko: string;
  /** 화면에 찍는 번호. 등록번호가 있으면 등록번호, 없으면 출원번호. */
  number: string;
  /** 연도 그룹용 날짜. 등록일이 있으면 등록일, 없으면 출원일. */
  date: string;
  /**
   * Notion `Status` 값 그대로 (Filed | Published | Registered | Transferred | Expired).
   * 라벨은 optionLabel("patentStatus", …). 모르는 값은 원문을 그대로 보여준다.
   *
   * 주의: 등록/출원 구분에는 **쓰지 않는다.** 선택지 철자에 의존하면 Notion 에서
   * 값이 하나 바뀌는 순간 조용히 틀린 목록이 나오기 때문이다.
   * 구분은 registrationNumber / registrationDate 유무로 판단한다 (src/lib/patents.ts).
   */
  status: string;
  /** 등록번호. 등록/출원 구분의 근거 중 하나. */
  registrationNumber: string;
  /** 등록일(ISO). 등록/출원 구분의 근거 중 하나. */
  registrationDate: string | null;
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
