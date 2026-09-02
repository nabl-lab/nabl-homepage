/**
 * UI 문구 사전.
 *
 * 메뉴·버튼·라벨·섹션 제목 등 화면에 고정으로 나오는 문구는 전부 여기에 모은다.
 * 새 문구가 필요하면 en 과 ko 를 **둘 다** 채운다. 컴포넌트에 문구를 하드코딩하지 말 것.
 * (연구원·논문·뉴스 같은 "콘텐츠" 는 여기가 아니라 src/data + src/lib/content.ts 담당)
 */

export const DEFAULT_LOCALE = "en" as const;
export type Locale = "en" | "ko";

export const ui = {
  en: {
    "site.name": "Nano & Artificial Biotechnology Laboratory",
    "site.shortName": "NABL",
    "site.affiliation": "Korea University, Sejong Campus",

    "nav.home": "Home",
    "nav.about": "About",
    "nav.members": "Members",
    "nav.research": "Research",
    "nav.achievements": "Achievements",
    "nav.news": "News",
    "nav.contact": "Contact",

    "a11y.skipToContent": "Skip to main content",
    "a11y.openMenu": "Open menu",
    "a11y.closeMenu": "Close menu",
    "a11y.language": "Language",

    "common.readMore": "Read more",
    "common.viewAll": "View all",
    "common.email": "Email",
    "common.address": "Address",

    "home.hero.tagline": "Designing aptamers and engineered proteins for molecular sensing.",
    "home.about.title": "About the lab",
    "home.about.body": "NABL develops nucleic acid aptamers and engineered proteins, and integrates them into practical biosensing tools — from in vitro selection and directed evolution to point-of-care devices.",
    "home.research.title": "Research areas",
    "home.stats.title": "At a glance",
    "home.stats.publications": "Publications",
    "home.stats.patents": "Patents",
    "home.stats.researchers": "Researchers",
    "home.stats.awards": "Awards",
    "home.news.title": "Latest news",
    "home.awards.title": "Recent awards",
    "home.contact.title": "Contact",

    "contact.addressLine1": "Industry–University Cooperation Bldg., Rooms 301, 320, 321",
    "contact.addressLine2": "Korea University Sejong Campus, 2511 Sejong-ro, Sejong 30019, Republic of Korea",
    "contact.emailValue": "nabl.webmaster@gmail.com",

    "footer.copyright": "Nano & Artificial Biotechnology Laboratory",
  },
  ko: {
    "site.name": "나노 및 인공 생명공학 연구실",
    "site.shortName": "NABL",
    "site.affiliation": "고려대학교 세종캠퍼스",

    "nav.home": "홈",
    "nav.about": "연구실 소개",
    "nav.members": "구성원",
    "nav.research": "연구",
    "nav.achievements": "연구 성과",
    "nav.news": "소식",
    "nav.contact": "연락처",

    "a11y.skipToContent": "본문으로 건너뛰기",
    "a11y.openMenu": "메뉴 열기",
    "a11y.closeMenu": "메뉴 닫기",
    "a11y.language": "언어",

    "common.readMore": "자세히 보기",
    "common.viewAll": "전체 보기",
    "common.email": "이메일",
    "common.address": "주소",

    "home.hero.tagline": "분자 센싱을 위한 압타머와 공학적 단백질을 설계합니다.",
    "home.about.title": "연구실 소개",
    "home.about.body": "NABL은 핵산 압타머와 공학적 단백질을 개발하고, 이를 실용적인 바이오센싱 도구로 통합합니다. 시험관 내 선별과 유도 진화부터 현장형 디바이스까지를 다룹니다.",
    "home.research.title": "연구 분야",
    "home.stats.title": "한눈에 보기",
    "home.stats.publications": "논문",
    "home.stats.patents": "특허",
    "home.stats.researchers": "연구원",
    "home.stats.awards": "수상",
    "home.news.title": "최신 소식",
    "home.awards.title": "최근 수상 내역",
    "home.contact.title": "연락처",

    "contact.addressLine1": "산학협력관 301, 320, 321호",
    "contact.addressLine2": "30019 세종특별자치시 세종로 2511 고려대학교 세종캠퍼스",
    "contact.emailValue": "nabl.webmaster@gmail.com",

    "footer.copyright": "나노 및 인공 생명공학 연구실",
  },
} as const;

/** ui 사전에서 사용할 수 있는 키 (en 기준). */
export type UiKey = keyof (typeof ui)["en"];
