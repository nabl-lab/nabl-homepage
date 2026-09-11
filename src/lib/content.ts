/**
 * 콘텐츠 데이터 접근점 (single source of truth).
 *
 * 페이지·컴포넌트는 콘텐츠 데이터를 여기에서만 가져온다. `src/data/*.json` 을 직접
 * import 하지 말 것. 콘텐츠 텍스트는 반드시 `localizedText()` 로 언어를 고른다.
 *
 * 지금은 `src/data/` 의 더미 JSON 을 그대로 내보낸다. 나중에 Google Sheets(CSV) /
 * Notion API 연동을 붙일 때는 **이 파일만** 고치면 된다 (같은 형태의 배열로 가공해 export).
 * - 데이터 "모양"(타입) → `content-types.ts`
 * - 가공 헬퍼(정렬·그룹핑·폴백) → `content-helpers.ts` (아래에서 re-export)
 */
import aboutData from "../data/about.json";
import piProfileData from "../data/pi-profile.json";
import membersData from "../data/members.json";
import alumniData from "../data/alumni.json";
import publicationsData from "../data/publications.json";
import patentsData from "../data/patents.json";
import awardsData from "../data/awards.json";
import newsData from "../data/news.json";
import researchData from "../data/research.json";
import etcData from "../data/achievements-etc.json";
import type {
  About,
  PiProfile,
  Member,
  Alumnus,
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  EtcItem,
  Resource,
  PiEntry,
} from "./content-types";

export type {
  About,
  PiProfile,
  Member,
  Alumnus,
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  EtcItem,
  Resource,
  PiEntry,
  Locale,
} from "./content-types";

export * from "./content-helpers";

// Notion 연동: 토큰이 있으면 Notion, 없으면 JSON 더미로 폴백한다.
// 9개 DB 를 한 번에 불러오고(relation 인덱스를 한 번만 만들기 위해) 여기서 고른다.
// 오류는 던져서 빌드를 실패시키고, 0건(빈 배열)은 정상으로 본다 — notion/fallback.ts 참고.
import { notionEnabled } from "../config/notion";
import { pick } from "./notion/fallback";
import { loadAll } from "./notion/query";

const notion = notionEnabled ? await loadAll() : null;

export const about = aboutData as About;
export const members = pick("members", notion?.members, membersData as Member[]);
export const alumni = alumniData as Alumnus[]; // Notion 에 대응 DB 없음 (구성원 상태로 파생 예정)
export const publications = pick(
  "publications",
  notion?.publications,
  publicationsData as Publication[],
);
export const patents = pick("patents", notion?.patents, patentsData as Patent[]);
export const awards = pick("awards", notion?.awards, awardsData as Award[]);
export const news = pick("news", notion?.news, newsData as NewsItem[]);
export const resources = pick("resources", notion?.resources, [] as Resource[]);
export const achievementsEtc = etcData as EtcItem[]; // Notion 에 대응 DB 없음
export const researchAreas = pick(
  "research",
  notion?.researchAreas,
  researchData.areas as ResearchArea[],
);
export const researchProjects = pick(
  "projects",
  notion?.researchProjects,
  researchData.projects as ResearchProject[],
);

/**
 * PI 프로필 — 경계가 둘로 나뉜다.
 *  - 학력·경력·대외활동: **Notion** PI Profile DB (Section 으로 구분)
 *  - 직위·연구실·관심사·외부링크: **JSON**(pi-profile.json). 아직 Notion 에 대응 속성이 없다.
 * 나중에 Notion 으로 옮기려면 해당 속성을 DB 에 추가하고 아래 세 줄처럼 pick() 으로 바꾼다.
 */
const piJson = piProfileData as PiProfile;
export const piProfile: PiProfile = {
  ...piJson,
  education: pick("pi.education", notion?.piEducation, piJson.education),
  career: pick("pi.career", notion?.piCareer, piJson.career),
  activities: pick("pi.activities", notion?.piActivities, piJson.activities),
};

/** 연구 범위 소개문. localizedText(researchScope, "scope", lang) 로 읽는다. */
export const researchScope = {
  scope: researchData.scope,
  scope_ko: researchData.scope_ko,
};
