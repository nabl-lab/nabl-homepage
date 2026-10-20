/**
 * Notion 속성명 매핑 — 사람 관련 DB (members, PI Profile).
 * 실측 스키마(2026-09-10 조회) 기준. 진입점은 `schema.ts` 다.
 *
 * 주의: `직책·과정`, `졸업·퇴실일`, `재직·재학` 의 가운뎃점은 U+00B7 MIDDLE DOT 이다.
 * 겉보기가 같은 U+30FB(・) 등으로 바뀌면 조용히 매칭에 실패한다.
 */

/** members — title=`이름`, 공개=`홈페이지 공개`, 순서=`홈페이지 순서` */
export const P_MEMBERS = {
  nameKo: "이름", // title
  nameEn: "영문명",
  position: "직책·과정", // 가운뎃점 U+00B7
  status: "구성원 상태",
  publish: "홈페이지 공개",
  order: "홈페이지 순서",
  joined: "입실일",
  left: "졸업·퇴실일", // 가운뎃점 U+00B7
  email: "e-mail",
  slug: "Slug",
  topicKo: "연구 주제",
  /** multi_select. 옵션은 "Ph.D." / "M.S.". Alumni 를 두 그룹으로 가르는 데 쓴다. */
  degrees: "학위",
  /** rich_text. 학위 하나당 한 줄(\n 구분). 빈 줄은 버린다. */
  degreeHistory: "학위 이력",
  /** number. 없으면 null → Alumni 정렬에서 맨 뒤. */
  graduatedYear: "졸업 연도",
  /** 2~3문장 연구 소개. rich_text 지만 서식·링크는 버리고 평문만 쓴다. */
  researchDescriptionKo: "연구 설명",
  photo: "프로필 사진",
  /**
   * 연구 분야 relation → Research DB (dual, 역방향은 Research 의 `Members`).
   * **Category=Theme 행만** 화면에 쓴다 (map-people.ts).
   * 같은 DB 에 이름이 비슷한 다중선택 `연구 분야` 가 남아 있지만 **읽지 않는다**
   * (곧 Notion 에서 삭제될 속성이다).
   */
  relResearchAreas: "연구 분야 (Research)",
  relAwards: "Awards",
  relPublications: "Publications",
  relProjectsPi: "Projects_PI",
  relProjects: "Projects",
  relPatents: "Patents",
  relNews: "News",
} as const;

/**
 * members `구성원 상태` 값. 가운뎃점 U+00B7.
 * 재직 중(active)만 현재 구성원, 나머지는 졸업생 쪽으로 본다.
 */
export const MEMBER_STATUS = {
  active: "재직·재학",
  leave: "휴학",
  completed: "수료",
  graduated: "졸업",
  left: "퇴직·퇴실",
} as const;

/** piProfile — title 이 `Content` 다 (Title 아님). Section 으로 학력/경력/대외활동을 나눈다. */
export const P_PI_PROFILE = {
  content: "Content", // title
  contentKo: "Content_ko",
  organization: "Organization",
  organizationKo: "Organization_ko",
  section: "Section", // Education | Career | Service
  startYear: "Start_year",
  endYear: "End_year",
  order: "Order",
  publish: "Publish",
} as const;

export const PI_SECTION = {
  education: "Education",
  career: "Career",
  service: "Service",
} as const;
