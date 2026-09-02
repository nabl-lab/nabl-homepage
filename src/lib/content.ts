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
  PiEntry,
  Locale,
} from "./content-types";

export * from "./content-helpers";

export const about = aboutData as About;
export const piProfile = piProfileData as PiProfile;
export const members = membersData as Member[];
export const alumni = alumniData as Alumnus[];
export const publications = publicationsData as Publication[];
export const patents = patentsData as Patent[];
export const awards = awardsData as Award[];
export const news = newsData as NewsItem[];
export const achievementsEtc = etcData as EtcItem[];
export const researchAreas = researchData.areas as ResearchArea[];
export const researchProjects = researchData.projects as ResearchProject[];

/** 연구 범위 소개문. localizedText(researchScope, "scope", lang) 로 읽는다. */
export const researchScope = {
  scope: researchData.scope,
  scope_ko: researchData.scope_ko,
};
