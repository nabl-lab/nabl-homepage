/**
 * 한국어 UI 문구. `en.ts` 와 키가 정확히 일치해야 한다 (ui.ts 가 타입으로 강제).
 */
const ko = {
  // 사이트 정체성
  "site.name": "나노 및 인공 생명공학 연구실",
  "site.shortName": "NABL",
  "site.affiliation": "고려대학교 세종캠퍼스",

  // 주 메뉴 (구조는 src/i18n/nav.ts, 문구는 여기)
  "nav.home": "홈",
  "nav.about": "연구실 소개",
  "nav.members": "구성원",
  "nav.research": "연구",
  "nav.research.scope": "연구 범위",
  "nav.research.themes": "연구 주제",
  "nav.research.projects": "프로젝트",
  "nav.achievements": "연구 성과",
  "nav.achievements.publications": "논문",
  "nav.achievements.patents": "특허",
  "nav.achievements.awards": "수상",
  "nav.achievements.etc": "기타",
  "nav.news": "소식",
  "nav.contact": "연락처",

  // 접근성
  "a11y.skipToContent": "본문으로 건너뛰기",
  "a11y.openMenu": "메뉴 열기",
  "a11y.closeMenu": "메뉴 닫기",
  "a11y.language": "언어",

  // 공통 라벨
  "common.readMore": "자세히 보기",
  "common.viewAll": "전체 보기",
  "common.email": "이메일",
  "common.address": "주소",
  "common.backToList": "목록으로 돌아가기",
  "common.viewPaper": "논문 보기",

  // 홈
  "home.hero.tagline": "분자 센싱을 위한 압타머와 공학적 단백질을 설계합니다.",
  "home.about.title": "연구실 소개",
  "home.about.body":
    "NABL은 핵산 압타머와 공학적 단백질을 개발하고, 이를 실용적인 바이오센싱 도구로 통합합니다. 시험관 내 선별과 유도 진화부터 현장형 디바이스까지를 다룹니다.",
  "home.research.title": "연구 분야",
  "home.stats.title": "한눈에 보기",
  "home.stats.publications": "논문",
  "home.stats.patents": "특허",
  "home.stats.researchers": "연구원",
  "home.stats.awards": "수상",
  "home.news.title": "최신 소식",
  "home.awards.title": "최근 수상 내역",
  "home.contact.title": "연락처",

  // About
  "about.title": "연구실 소개",
  "about.lede": "우리가 누구이고 무엇을 연구하는지 소개합니다.",
  "about.missionTitle": "연구 목표",

  // Members
  "members.title": "구성원",
  "members.currentTitle": "현재 구성원",
  "members.lede": "직책별로 정리한 NABL 현재 구성원입니다.",
  "members.noPhoto": "사진 없음",

  // Alumni
  "alumni.title": "졸업생",
  "alumni.lede": "연구실을 거쳐 간 구성원과 현재 소속입니다.",
  "alumni.afterLabel": "졸업 후",
  "alumni.backToMembers": "← 현재 구성원",

  // PI (책임교수) 페이지
  "pi.pageTitle": "책임교수",
  "pi.officeLabel": "연구실",
  "pi.present": "현재",
  "pi.researchInterests": "연구 관심사",
  "pi.education": "학력",
  "pi.career": "경력",
  "pi.activities": "대외 활동",
  "pi.awards": "수상",
  "pi.selectedPublications": "대표 논문",
  "pi.links": "외부 링크",
  "pi.scholar": "Google Scholar",
  "pi.orcid": "ORCID",

  // Contact
  "contact.title": "연락처",
  "contact.lede": "연락 방법과 찾아오는 길입니다.",
  "contact.directionsTitle": "찾아오는 길",
  "contact.directionsBody":
    "고려대학교 세종캠퍼스 산학협력관 3층입니다 (301, 320, 321호). 조치원역에서 버스나 택시로 약 15분 거리입니다.",
  "contact.mapPlaceholder": "지도가 이 자리에 추가될 예정입니다.",
  "contact.addressLine1": "산학협력관 301, 320, 321호",
  "contact.addressLine2": "30019 세종특별자치시 세종로 2511 고려대학교 세종캠퍼스",
  "contact.emailValue": "nabl.webmaster@gmail.com",

  // 직책 라벨
  "position.pi": "책임교수 (PI)",
  "position.researchProfessor": "연구교수",
  "position.phd": "박사과정",
  "position.msphd": "석·박사통합과정",
  "position.ms": "석사과정",
  "position.undergrad": "학부연구생",

  // 푸터
  "footer.copyright": "나노 및 인공 생명공학 연구실",
} satisfies Record<string, string>;

export default ko;
