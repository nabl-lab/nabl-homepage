/**
 * Notion 속성명 — **소식·공개 자료** (news, resources).
 * 같은 축의 다른 파일: schema-people.ts(사람), schema-work.ts(연구·성과).
 * 호출부는 배럴 `schema.ts` 에서 가져온다.
 */

export const P_NEWS = {
  title: "Title",
  titleKo: "Title_ko",
  summary: "Summary",
  summaryKo: "Summary_ko",
  body: "Body",
  bodyKo: "Body_ko",
  category: "Category",
  date: "Date",
  cover: "Cover",
  slug: "Slug",
  featured: "Featured",
  publish: "Publish",
  relMembers: "Related_members",
  relProject: "Related_project",
  relPublication: "Related_publication",
} as const;

export const P_RESOURCES = {
  title: "Title",
  titleKo: "Title_ko",
  description: "Description",
  descriptionKo: "Description_ko",
  type: "Type",
  date: "Date",
  order: "Order",
  slug: "Slug",
  /** 대용량일 수 있어 내려받지 않는다. External_url 로 대체한다. */
  file: "File",
  thumbnail: "Thumbnail",
  externalUrl: "External_url",
  publish: "Publish",
  relProject: "Related_project",
  relPublication: "Related_publication",
} as const;
