/**
 * 콘텐츠 데이터 형식 — **사람** (구성원, 졸업생).
 * PI(지도교수) 프로필은 pi-types.ts 가 따로 담당한다.
 *
 * 같은 축의 다른 파일: work-types.ts(연구·성과), news-types.ts(소식·자료).
 * 페이지·컴포넌트는 이 파일을 직접 import 하지 않고 content.ts 에서 타입을 가져온다.
 */

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
  /**
   * 2~3문장 연구 소개 (Notion `연구 설명`). 연구 주제보다 자세한 설명이다.
   *
   * 연구 주제와 마찬가지로 Notion 에 영문 속성이 없어 researchDescription 은 항상
   * 빈 문자열이고, localizedText 가 _ko 로 폴백한다 — /en 에서도 한국어 원문이 나온다.
   * 비어 있을 수 있다. 비면 화면에서 그 영역을 아예 렌더하지 않는다.
   */
  researchDescription: string;
  researchDescription_ko: string;
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
