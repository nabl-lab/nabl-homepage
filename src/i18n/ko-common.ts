/**
 * 한국어 UI 문구 — 사이트 공통. `en-common.ts` 와 키가 정확히 일치해야 한다.
 */
const koCommon = {
  // 사이트 정체성
  "site.name": "나노 및 인공 생명공학 연구실",
  "site.shortName": "NABL",
  "site.affiliation": "고려대학교 세종캠퍼스",
  "site.description":
    "고려대학교 세종캠퍼스 나노 및 인공 생명공학 연구실 — 압타머 공학, 단백질 설계, 현장형 바이오센서 연구.",

  // 주 메뉴 (구조는 src/i18n/nav.ts, 문구는 여기)
  "nav.home": "홈",
  "nav.about": "연구실 소개",
  "nav.members": "구성원",
  "nav.research": "연구",
  "nav.research.scope": "연구 범위",
  "nav.research.themes": "연구 주제",
  "nav.projects": "프로젝트",
  "nav.research.publications": "논문",
  "nav.achievements": "연구 성과",
  "nav.achievements.patents": "특허",
  "nav.achievements.awards": "수상",
  "nav.achievements.etc": "기타",
  "nav.news": "소식",
  "nav.resources": "자료실",
  "nav.contact": "연락처",

  // 접근성
  "a11y.skipToContent": "본문으로 건너뛰기",
  "a11y.openMenu": "메뉴 열기",
  "a11y.closeMenu": "메뉴 닫기",
  "a11y.language": "언어",
  "a11y.primaryNav": "주 메뉴",
  "a11y.filterPublications": "논문 분류 필터",
  "a11y.filterProjects": "프로젝트 상태 필터",
  "a11y.articleNav": "글 이동",

  // 공통 라벨
  "common.readMore": "자세히 보기",
  "common.viewAll": "전체 보기",
  "common.email": "이메일",
  "common.address": "주소",
  "common.backToList": "목록으로 돌아가기",
  "common.viewPaper": "논문 보기",
  "common.empty": "아직 등록된 항목이 없습니다.",

  // 푸터
  "footer.copyright": "나노 및 인공 생명공학 연구실",
} satisfies Record<string, string>;

export default koCommon;
