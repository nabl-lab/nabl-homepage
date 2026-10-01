/**
 * 콘텐츠 데이터 형식 진입점.
 *
 * **페이지·컴포넌트는 이 파일도 직접 보지 않는다.** 데이터와 타입 모두
 * `src/lib/content.ts` 에서만 가져온다 (CLAUDE.md 4번 항목).
 *
 * 줄 수 상한 때문에 notion/schema-*.ts 와 같은 축으로 나눠 두고 여기서 모아 내보낸다:
 *  - people-types.ts : 구성원, 졸업생
 *  - work-types.ts   : 논문, 특허, 수상, 기타 성과, 연구 분야, 연구 과제
 *  - news-types.ts   : 소식, 공개 자료
 *  - pi-types.ts     : 지도교수 프로필
 *
 * 아래 About 만 여기 남겨 둔다 — 연구실 소개 한 덩어리뿐이라 파일을 따로 두면
 * 찾아가는 수고만 늘어난다.
 */
export type { Locale } from "../i18n/ui";

/** 연구실 소개 (about.json). 본문은 localizedText 로 언어를 고른다. */
export interface About {
  intro: string;
  intro_ko: string;
  mission: string;
  mission_ko: string;
}

export type { Member, Alumnus } from "./people-types";
export type {
  ResearchArea,
  ResearchProject,
  Publication,
  Patent,
  Award,
  EtcItem,
} from "./work-types";
export type { NewsItem, Resource } from "./news-types";
export type { PiEntry, PiProfile } from "./pi-types";
