/**
 * Notion 속성명 매핑 — 연구·성과·콘텐츠 DB
 * (research, projects, publications, patents, awards).
 * 실측 스키마(2026-09-10 조회) 기준. 진입점은 `schema.ts` 다.
 */

export const P_RESEARCH = {
  title: "Title",
  titleKo: "Title_ko",
  description: "Description",
  descriptionKo: "Description_ko",
  category: "Category", // Scope | Theme
  featured: "Featured",
  publish: "Publish",
  order: "Order",
  slug: "Slug",
  image: "Image",
  relProjects: "Projects",
} as const;

/** research `Category` — Scope(연구 범위)와 Theme(연구 주제)를 한 DB 에서 구분한다. */
export const RESEARCH_CATEGORY = {
  scope: "Scope",
  theme: "Theme",
} as const;

export const P_PROJECTS = {
  title: "Title",
  titleKo: "Title_ko",
  description: "Description",
  descriptionKo: "Description_ko",
  status: "Status", // Planned | Ongoing | Completed
  startDate: "Start_date",
  endDate: "End_date",
  funder: "Funding_organization",
  funderKo: "Funding_organization_ko",
  websiteUrl: "Website_url",
  featured: "Featured",
  publish: "Publish",
  order: "Order",
  slug: "Slug",
  /** relation. 1페이지 제한이 아직 안 걸려 있어 배열로 받아 첫 항목만 쓴다. */
  relPi: "Principal_investigator",
  relParticipants: "Participants",
  relResearch: "Related_research",
  /** 내부용(과제 번호). 홈페이지에 표시하지 않는다 — 타입에만 담아 둔다. */
  grantNumber: "Grant_number",
  /** Publications.Funding_projects 의 역방향 relation. 표시하지 않는다. */
  relPublications: "Publications",
  relPatents: "Patents",
  relNews: "News",
  relResources: "Resources",
} as const;

export const PROJECT_STATUS = {
  planned: "Planned",
  ongoing: "Ongoing",
  completed: "Completed",
} as const;

/**
 * publications — title 이 `이름` 이다 (Title 아님). Order 속성 없음.
 *
 * 연도는 Published_date(게재일) 의 연도를 먼저 쓰고, 없으면 Year 숫자를 쓴다.
 * 둘 다 없으면 "연도 미상" 그룹으로 간다 (src/lib/publications.ts).
 */
export const P_PUBLICATIONS = {
  title: "이름", // title
  titleKo: "Title_ko",
  authors: "Authors",
  journal: "Journal",
  year: "Year",
  publishedDate: "Published_date", // date. 게재일 — 연도 결정에 우선 사용
  type: "Type", // International | Domestic | Conference | Patent | Book
  doi: "DOI",
  featured: "Featured",
  publish: "Publish",
  /** 내부용(사사 여부). 홈페이지에 표시하지 않는다 — 타입에만 담아 둔다. */
  personalGrant: "Personal_grant",
  relAuthors: "Authors_members",
  relNews: "News",
  relResources: "Resources",
  /** 사사 과제 relation → Projects. 지금은 표시하지 않는다. */
  relFundingProjects: "Funding_projects",
} as const;

/** 논문 목록에서 제외할 Type. 특허는 Patents DB 가 따로 있다. */
export const PUBLICATION_EXCLUDED_TYPE = "Patent";

/** patents — Order 속성 없음 → Filing_date 내림차순 정렬. */
export const P_PATENTS = {
  title: "Title",
  titleKo: "Title_ko",
  status: "Status", // Filed | Published | Registered | Transferred | Expired
  country: "Country",
  applicationNumber: "Application_number",
  registrationNumber: "Registration_number",
  filingDate: "Filing_date",
  registrationDate: "Registration_date",
  applicant: "Applicant",
  inventors: "Inventors",
  featured: "Featured",
  publish: "Publish",
  relInventors: "Inventors_members",
  relProject: "Related_project",
} as const;

/** awards — `Year` 는 formula(number). Date 가 비면 null 이므로 null 안전 처리 필요. */
export const P_AWARDS = {
  title: "Title",
  titleKo: "Title_ko",
  organization: "Organization",
  organizationKo: "Organization_ko",
  date: "Date",
  year: "Year", // formula → number | null
  category: "Category",
  publish: "Publish",
  relRecipient: "Recipient",
} as const;
