/**
 * 영어 UI 문구 — 사이트 공통 (정체성·메뉴·접근성·공통 라벨·푸터).
 * 페이지별 문구는 `en-pages.ts`, Notion 선택지 라벨은 `options.ts`.
 * `ko-common.ts` 에 같은 키가 있어야 한다 (ui.ts 가 타입으로 강제).
 */
const enCommon = {
  // 사이트 정체성
  "site.name": "Nano & Artificial Biotechnology Laboratory",
  "site.shortName": "NABL",
  "site.affiliation": "Korea University, Sejong Campus",
  "site.description":
    "Nano & Artificial Biotechnology Laboratory at Korea University Sejong Campus — aptamer engineering, protein design, and point-of-care biosensors.",

  // 주 메뉴 (구조는 src/i18n/nav.ts, 문구는 여기)
  "nav.home": "Home",
  "nav.about": "About",
  "nav.members": "Members",
  "nav.research": "Research",
  "nav.research.scope": "Research Scope",
  "nav.research.themes": "Themes",
  "nav.projects": "Projects",
  "nav.research.publications": "Publications",
  "nav.achievements": "Achievements",
  "nav.achievements.patents": "Patents",
  "nav.achievements.awards": "Awards",
  "nav.achievements.etc": "Etc.",
  "nav.news": "News",
  "nav.resources": "Resources",
  "nav.contact": "Contact",

  // 접근성
  "a11y.skipToContent": "Skip to main content",
  "a11y.openMenu": "Open menu",
  "a11y.closeMenu": "Close menu",
  "a11y.language": "Language",
  "a11y.primaryNav": "Main navigation",
  "a11y.filterPublications": "Filter publications by type",
  "a11y.filterProjects": "Filter projects by status",
  "a11y.articleNav": "News article navigation",

  // 공통 라벨
  "common.readMore": "Read more",
  "common.viewAll": "View all",
  "common.email": "Email",
  "common.address": "Address",
  "common.backToList": "Back to the list",
  "common.viewPaper": "View paper",
  "common.empty": "Nothing has been added here yet.",

  // 푸터
  "footer.copyright": "Nano & Artificial Biotechnology Laboratory",
} satisfies Record<string, string>;

export default enCommon;
