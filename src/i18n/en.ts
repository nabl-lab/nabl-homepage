/**
 * 영어 UI 문구. 한국어는 `ko.ts` 에 같은 키로 존재해야 한다 (ui.ts 가 타입으로 강제).
 * 화면에 고정으로 나오는 문구만 여기 둔다. 콘텐츠(구성원·논문·뉴스 등)는 src/data + content.ts.
 */
const en = {
  // 사이트 정체성
  "site.name": "Nano & Artificial Biotechnology Laboratory",
  "site.shortName": "NABL",
  "site.affiliation": "Korea University, Sejong Campus",

  // 주 메뉴 (구조는 src/i18n/nav.ts, 문구는 여기)
  "nav.home": "Home",
  "nav.about": "About",
  "nav.members": "Members",
  "nav.research": "Research",
  "nav.research.scope": "Research Scope",
  "nav.research.themes": "Themes",
  "nav.research.projects": "Projects",
  "nav.achievements": "Achievements",
  "nav.achievements.publications": "Publications",
  "nav.achievements.patents": "Patents",
  "nav.achievements.awards": "Awards",
  "nav.achievements.etc": "Etc.",
  "nav.news": "News",
  "nav.contact": "Contact",

  // 접근성
  "a11y.skipToContent": "Skip to main content",
  "a11y.openMenu": "Open menu",
  "a11y.closeMenu": "Close menu",
  "a11y.language": "Language",

  // 공통 라벨
  "common.readMore": "Read more",
  "common.viewAll": "View all",
  "common.email": "Email",
  "common.address": "Address",
  "common.backToList": "Back to the list",
  "common.viewPaper": "View paper",

  // 홈
  "home.hero.tagline":
    "Designing aptamers and engineered proteins for molecular sensing.",
  "home.about.title": "About the lab",
  "home.about.body":
    "NABL develops nucleic acid aptamers and engineered proteins, and integrates them into practical biosensing tools — from in vitro selection and directed evolution to point-of-care devices.",
  "home.research.title": "Research areas",
  "home.stats.title": "At a glance",
  "home.stats.publications": "Publications",
  "home.stats.patents": "Patents",
  "home.stats.researchers": "Researchers",
  "home.stats.awards": "Awards",
  "home.news.title": "Latest news",
  "home.awards.title": "Recent awards",
  "home.contact.title": "Contact",

  // About
  "about.title": "About",
  "about.lede": "Who we are and what we work on.",
  "about.missionTitle": "Our goal",

  // Members
  "members.title": "Members",
  "members.currentTitle": "Current Members",
  "members.lede": "Current members of NABL, grouped by role.",
  "members.noPhoto": "No photo",

  // Alumni
  "alumni.title": "Alumni",
  "alumni.lede": "Former members and where they are now.",
  "alumni.afterLabel": "Now",
  "alumni.backToMembers": "← Current members",

  // PI (책임교수) 페이지
  "pi.pageTitle": "Principal Investigator",
  "pi.officeLabel": "Office",
  "pi.present": "Present",
  "pi.researchInterests": "Research interests",
  "pi.education": "Education",
  "pi.career": "Career",
  "pi.activities": "Professional activities",
  "pi.awards": "Awards",
  "pi.selectedPublications": "Selected publications",
  "pi.links": "External links",
  "pi.scholar": "Google Scholar",
  "pi.orcid": "ORCID",

  // Contact
  "contact.title": "Contact",
  "contact.lede": "How to reach us and how to find the lab.",
  "contact.directionsTitle": "Directions",
  "contact.directionsBody":
    "The lab is on the 3rd floor of the Industry–University Cooperation Building at Korea University Sejong Campus (Rooms 301, 320, 321). From Jochiwon Station it is about 15 minutes by bus or taxi.",
  "contact.mapPlaceholder": "A map will be added here later.",
  "contact.addressLine1":
    "Industry–University Cooperation Bldg., Rooms 301, 320, 321",
  "contact.addressLine2":
    "Korea University Sejong Campus, 2511 Sejong-ro, Sejong 30019, Republic of Korea",
  "contact.emailValue": "nabl.webmaster@gmail.com",

  // 직책 라벨 (data 의 position 값 → 화면 표기)
  "position.pi": "Principal Investigator",
  "position.researchProfessor": "Research Professor",
  "position.phd": "Ph.D. Course",
  "position.msphd": "M.S.–Ph.D. Integrated",
  "position.ms": "M.S. Course",
  "position.undergrad": "Undergraduate Researcher",

  // Research 페이지
  "research.lede": "Our research scope, themes, and current projects.",
  "research.projectFunder": "Funded by",

  // Publications 페이지
  "pub.lede": "Peer-reviewed papers and conference proceedings.",
  "pub.filterAll": "All",
  "pub.catInternational": "International",
  "pub.catDomestic": "Domestic",
  "pub.catConference": "Conference",
  "pub.empty": "No publications in this category yet.",

  // Patents 페이지
  "patent.registered": "Registered",
  "patent.applied": "Applied",
  "patent.inventorsLabel": "Inventors",

  // News 페이지
  "news.lede": "Announcements and updates from the lab.",
  "news.prev": "Previous",
  "news.next": "Next",

  // 푸터
  "footer.copyright": "Nano & Artificial Biotechnology Laboratory",
} satisfies Record<string, string>;

export default en;
