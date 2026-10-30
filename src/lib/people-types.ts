/**
 * 콘텐츠 데이터 형식 — **사람** (구성원).
 * 졸업생은 별도 타입이 없다 — 구성원 DB 의 `구성원 상태` 로 갈라낸다 (lib/members.ts).
 * PI(지도교수) 프로필은 pi-types.ts 가 따로 담당한다.
 *
 * 같은 축의 다른 파일: work-types.ts(연구·성과), news-types.ts(소식·자료).
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */

/**
 * 구성원에게 연결된 연구 분야 한 건 (Notion Research DB 의 Theme 행).
 *
 * 필드명이 `title_ko` 인 이유: 콘텐츠 텍스트는 전부 `localizedText(item, "title", lang)`
 * 로 꺼내는 규칙이고(CLAUDE.md 11번), 그 헬퍼가 `title` / `title_ko` 짝을 찾는다.
 * `titleKo` 로 두면 이 객체만 폴백 규칙 밖으로 빠져 호출부에서 직접 분기해야 한다.
 */
export interface MemberResearchArea {
  title: string;
  title_ko: string;
  /** 상세 URL 조각. 비어 있을 수 있다 (그때는 링크를 걸지 않는다). */
  slug: string;
  /** Theme 분류 기호 (N | A | B | L). 지금은 화면에 쓰지 않고 담아만 둔다. */
  code: string;
  /**
   * Notion `Category` 값 그대로 (Theme | Scope). 구성원에게는 Theme 만 붙어야 하고,
   * Scope 가 붙어 있으면 빌드 로그에 경고가 난다 (notion/validate.ts).
   * Patent.status 처럼 Notion 값을 그대로 담는 기존 방식과 같다.
   */
  category: string;
  /** Research 행이 공개됐는지. **false 면 이름만 보여 주고 링크를 걸지 않는다.** */
  publish: boolean;
  /** 카드 정렬 기준 (Research DB 의 Order). 없으면 맨 뒤. */
  order?: number;
  /** 카드에 태그로 보여 줄 키워드. */
  keywords: string[];
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
  /**
   * Notion `구성원 상태` (재직·재학 / 휴학 / 수료 / 졸업 / 퇴직·퇴실).
   * 현재 구성원과 Alumni 를 가르는 기준이다 (src/lib/members.ts).
   */
  status: string;
  /** Notion `학위` (multi_select). "Ph.D." 가 있으면 Ph.D. Alumni 그룹으로 간다. */
  degrees: string[];
  /** Notion `학위 이력` 을 줄 단위로 끊은 것. 빈 줄은 없다. 0개일 수 있다. */
  degreeHistory: string[];
  /** Notion `졸업 연도`. 없으면 null → Alumni 정렬에서 맨 뒤. */
  graduatedYear: number | null;
  /** 같은 직책 안에서 이 값이 있으면 우선해 정렬한다. */
  order?: number;
  joinedDate: string;
  /** 졸업·퇴실일. 재직 중이면 빈 문자열. */
  leftDate: string;
  email: string;
  /**
   * 직위 한 줄 (Notion `Position` / `Position_ko`).
   * 비어 있으면 화면이 `직책·과정` 라벨로 폴백한다 (lib/person.ts 의 positionLine).
   */
  positionTitle: string;
  positionTitle_ko: string;
  researchTopic: string;
  researchTopic_ko: string;
  /**
   * 2~3문장 연구 소개 (Notion `연구 설명`). 연구 주제보다 자세한 설명이다.
   *
   * 연구 주제와 마찬가지로 Notion 에 영문 속성이 없어 researchDescription 은 항상
   * 빈 문자열이고, localizedText 가 _ko 로 폴백한다 — /en 에서도 한국어 원문이 나온다.
   * 비어 있을 수 있다. 비면 화면에서 그 영역을 아예 렌더하지 않는다.
   */
  researchDescription: string;
  researchDescription_ko: string;
  /**
   * 연구 분야 — Notion 관계 속성 `연구 분야 (Research)` 를 Research DB 와 조인한 결과.
   * 0개일 수 있다 (그때는 화면에서 그 영역을 렌더하지 않고 빌드 로그에 경고가 난다).
   */
  researchAreas: MemberResearchArea[];
  /** 연구실 위치. 비면 그 줄을 숨긴다. */
  office: string;
  office_ko: string;
  /** 연구실 전화. 언어 구분 없는 한 값. 비면 그 줄을 숨긴다. */
  officePhone: string;
  /** 외부 프로필 URL. 셋 다 비면 그 영역 자체를 숨긴다. */
  links: { scholar: string; orcid: string; researchGate: string };
  /** 빌드 시 public/ 으로 내려받은 로컬 경로. 없으면 플레이스홀더. */
  photo?: string;
}
