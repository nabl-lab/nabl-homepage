/**
 * Notion 선택지(select/status) 값 → 화면 라벨.
 *
 * **Notion 선택지가 바뀌면 이 파일만 보면 된다.** 속성별로 묶여 있다.
 *
 * 규칙: Notion 에 들어 있는 값은 이미 한쪽 언어다.
 *  - 영문 DB(research·projects·publications·patents·awards·news·resources)의 값은 영어
 *    → 한국어(ko) 라벨만 적는다
 *  - members 의 값은 한국어 → 영어(en) 라벨만 적는다
 * 적지 않은 쪽은 **원문을 그대로** 쓴다. 그래서 Notion 에서 선택지를 새로 추가해도
 * 빌드가 죽지 않고 원문이 그대로 노출된다.
 *
 * 같은 단어가 속성마다 다른 뜻일 수 있으므로(예: Presentation = 발표 / 발표자료)
 * 반드시 속성 이름공간을 지정해 쓴다.
 */
import type { Locale } from "./ui";

type LabelMap = Partial<Record<Locale, Record<string, string>>>;

const SETS = {
  /** members `직책·과정` (한국어 → 영어) */
  memberPosition: {
    en: {
      지도교수: "Principal Investigator",
      연구교수: "Research Professor",
      박사후연구원: "Postdoctoral Researcher",
      박사과정: "PhD Student",
      석사과정: "MS Student",
      학부연구생: "Undergraduate Researcher",
      연구원: "Researcher",
      행정: "Administrative Staff",
    },
  },
  /** members `구성원 상태` (가운뎃점 U+00B7) */
  memberStatus: {
    en: {
      "재직·재학": "Active",
      휴학: "On leave",
      수료: "Coursework completed",
      졸업: "Graduated",
      "퇴직·퇴실": "Departed",
    },
  },
  /** research `Category` */
  researchCategory: {
    ko: { Scope: "연구 범위", Theme: "연구 주제" },
  },
  /** projects `Status` */
  projectStatus: {
    ko: { Planned: "계획", Ongoing: "진행 중", Completed: "완료" },
  },
  /** publications `Type` (Patent 는 목록에서 제외하지만 라벨은 남겨둔다) */
  publicationType: {
    ko: {
      International: "국제",
      Domestic: "국내",
      Conference: "학회",
      Book: "저서",
      Patent: "특허",
    },
  },
  /** patents `Status` — 영문은 Notion 값 그대로 쓴다 */
  patentStatus: {
    ko: {
      Filed: "출원",
      Published: "공개",
      Registered: "등록",
      Transferred: "이전",
      Expired: "만료",
    },
  },
  /** patents `Country` */
  patentCountry: {
    ko: { KR: "한국", US: "미국", PCT: "PCT", Other: "기타" },
  },
  /** awards `Category` */
  awardCategory: {
    ko: {
      Research: "연구",
      Paper: "논문",
      Presentation: "발표",
      Scholarship: "장학",
      Other: "기타",
    },
  },
  /** news `Category` */
  newsCategory: {
    ko: {
      Publication: "논문",
      Award: "수상",
      Conference: "학회",
      Seminar: "세미나",
      "Lab Life": "연구실 생활",
      Recruitment: "모집",
      Other: "기타",
    },
  },
  /** resources `Type` */
  resourceType: {
    ko: {
      Report: "보고서",
      Poster: "포스터",
      Presentation: "발표자료",
      Dataset: "데이터셋",
      Protocol: "프로토콜",
      Media: "미디어",
      Other: "기타",
    },
  },
  /** PI Profile `Section` */
  piSection: {
    ko: { Education: "학력", Career: "경력", Service: "대외 활동" },
  },
} satisfies Record<string, LabelMap>;

export type OptionSet = keyof typeof SETS;

/**
 * 선택지 값을 현재 언어 라벨로 바꾼다.
 * 매핑에 없는 값(운영자가 Notion 에서 새로 추가한 선택지)은 **원문을 그대로** 돌려준다.
 */
export function optionLabel(
  set: OptionSet,
  value: string,
  lang: Locale,
): string {
  const v = value.trim();
  if (!v) return "";
  const map = (SETS[set] as LabelMap)[lang];
  return map?.[v] ?? v;
}
