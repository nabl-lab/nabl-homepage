/**
 * 영어 UI 문구 — 페이지별.
 * 공통 문구는 `en-common.ts`, Notion 선택지 라벨은 `options.ts`.
 * `ko-pages.ts` 에 같은 키가 있어야 한다 (ui.ts 가 타입으로 강제).
 */
const enPages = {
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
  "about.piLabel": "Principal Investigator",

  // Members
  "members.title": "Members",
  "members.currentTitle": "Current Members",
  "members.lede": "Current members of NABL, grouped by role.",
  "members.noPhoto": "No photo",
  "member.topicLabel": "Research topic",
  "member.joinedLabel": "Joined",

  // Alumni
  "alumni.title": "Alumni",
  "alumni.lede": "Former members of NABL, by degree program.",
  "alumni.afterLabel": "Now",
  "alumni.backToMembers": "← Current members",

  // PI (책임교수) 페이지
  "pi.pageTitle": "Principal Investigator",
  "pi.lede": "The principal investigator of NABL.",
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

  // Research
  "research.lede": "Our research scope, themes, and current projects.",
  "research.projectFunder": "Funded by",

  // Projects
  "projects.lede": "Ongoing and past research projects.",
  "projects.filterAll": "All",
  "projects.piLabel": "Principal investigator",
  "projects.participantsLabel": "Participants",
  "projects.funderLabel": "Funded by",
  "projects.periodLabel": "Period",

  // Publications
  "pub.lede": "Peer-reviewed papers and conference proceedings.",
  "pub.filterAll": "All",

  // Patents
  "patent.lede": "Patents filed and registered by the lab.",
  "patent.inventorsLabel": "Inventors",
  "patent.numberLabel": "Application / Registration no.",
  "patent.applicantLabel": "Applicant",

  // Awards
  "award.lede": "Awards received by lab members.",

  // News
  "news.lede": "Announcements and updates from the lab.",
  "news.prev": "Previous",
  "news.next": "Next",

  // Resources
  "resources.lede": "Reports, posters, presentations, datasets and protocols.",
  "resources.download": "Open file",
} satisfies Record<string, string>;

export default enPages;
