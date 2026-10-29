/**
 * 콘텐츠 데이터 형식 진입점.
 *
 * **페이지·컴포넌트는 이 파일도 직접 보지 않는다.** 데이터와 타입 모두
 * `src/lib/content.ts` 에서만 가져온다 (CLAUDE.md 4번 항목).
 *
 * 줄 수 상한 때문에 notion/schema-*.ts 와 같은 축으로 나눠 두고 여기서 모아 내보낸다:
 *  - people-types.ts : 구성원 (졸업생은 구성원에서 파생 — lib/members.ts)
 *  - work-types.ts     : 논문, 특허, 수상, 기타 성과, 연구 과제
 *  - research-types.ts : 연구 분야
 *  - news-types.ts   : 소식, 공개 자료
 *  - pi-types.ts     : 지도교수 프로필
 */
export type { Locale } from "../i18n/ui";

export type { Member, MemberResearchArea } from "./people-types";
export type {
  ResearchArea,
  ResearchMemberRef,
  ResearchProjectRef,
} from "./research-types";
export type {
  ResearchProject,
  Publication,
  Patent,
  Award,
  EtcItem,
} from "./work-types";
export type { NewsItem, Resource } from "./news-types";
export type { SiteContentEntry } from "./site-content-types";
export type { PiEntry, PiProfile } from "./pi-types";
