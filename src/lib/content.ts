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
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  EtcItem,
  Resource,
} from "./content-types";

export type {
  About,
  PiProfile,
  PiEntry,
  Member,
  MemberResearchArea,
  Publication,
  Patent,
  Award,
  NewsItem,
  ResearchArea,
  ResearchProject,
  EtcItem,
  Resource,
  Locale,
} from "./content-types";

export * from "./content-helpers";

// Notion 연동: 토큰이 있으면 Notion, 없으면 JSON 더미로 폴백한다.
// 9개 DB 를 한 번에 불러오고(relation 인덱스를 한 번만 만들기 위해) 여기서 고른다.
// 오류는 던져서 빌드를 실패시키고, 0건(빈 배열)은 정상으로 본다 — notion/fallback.ts 참고.
import { notionEnabled } from "../config/notion";
import { pick } from "./notion/fallback";
import { withResolvedYear } from "./publications";
import { alumniGroups, currentMembers, unknownStatuses } from "./members";
import { withUniqueSlug } from "./notion/validate";
// 필수 필드가 빈 항목은 여기서 걸러 낸다. 항목 하나 때문에 빌드 전체가 죽지 않게
// 하는 유일한 지점이다 (CLAUDE.md 15번, lib/required-fields.ts).
import {
  completeAwards,
  completeEtc,
  completeMembers,
  completeNews,
  completePatents,
  completeProjects,
  completePublications,
  completeResearch,
  completeResources,
} from "./required-fields";
import { loadAll } from "./notion/query";

const notion = notionEnabled ? await loadAll() : null;

export const about = aboutData as About;
export const members = completeMembers(
  pick("members", notion?.members, membersData as Member[]),
);
/**
 * 현재 구성원 / Alumni — **구성원 DB 하나에서 `구성원 상태` 로 갈라낸다.**
 * (예전에는 alumni.json 더미를 썼다. 이제 Notion 이 유일한 출처다.)
 * 상태가 어느 쪽에도 안 맞으면 양쪽에서 빠지고 빌드 로그에 경고가 난다.
 */
for (const u of unknownStatuses(members)) {
  console.warn(
    `[warn] members '${u.who}': 구성원 상태 "${u.status}" 는 현재 구성원도 Alumni 도 ` +
      `아니라서 양쪽 목록에서 빠집니다. schema-people.ts 의 MEMBER_STATUS 를 확인하세요.`,
  );
}

export const currentMemberList = currentMembers(members);
export const alumni = alumniGroups(members);

/**
 * 상세 페이지가 **실제로 생성된** 구성원의 id 집합. 카드는 여기 있을 때만 링크한다.
 *
 * slug 가 아니라 **id** 인 이유: slug 가 겹치면 두 번째 사람은 상세 페이지가 없는데
 * slug 값 자체는 (첫 번째 사람의) 유효한 경로다. slug 로 판단하면 그 카드가 남의
 * 페이지로 링크된다. 경로 생성과 같은 withUniqueSlug 를 써서 둘이 어긋나지 않는다.
 */
export const memberDetailIds = new Set(
  withUniqueSlug(currentMemberList).map((m) => m.id),
);
// 연도 규칙(게재일 우선)은 Notion·JSON 어느 출처든 같게 적용한다 (lib/publications.ts).
export const publications = completePublications(
  withResolvedYear(
    pick("publications", notion?.publications, publicationsData as Publication[]),
  ),
);
export const patents = completePatents(
  pick("patents", notion?.patents, patentsData as Patent[]),
);
export const awards = completeAwards(
  pick("awards", notion?.awards, awardsData as Award[]),
);
export const news = completeNews(pick("news", notion?.news, newsData as NewsItem[]));
export const resources = completeResources(
  pick("resources", notion?.resources, [] as Resource[]),
);
// TODO: Notion 미연동 — 이 목록만 src/data/achievements-etc.json 더미 데이터를 쓴다.
// 대응 Notion DB 가 없어서 실데이터로 바뀌지 않는다. Etc 페이지를 없애거나
// Notion 에 DB 를 만들어 연결할지 결정이 필요하다 (실데이터로 착각하지 말 것).
export const achievementsEtc = completeEtc(etcData as EtcItem[]);
export const researchAreas = completeResearch(
  pick("research", notion?.researchAreas, researchData.areas as ResearchArea[]),
);
export const researchProjects = completeProjects(
  pick("projects", notion?.researchProjects, researchData.projects as ResearchProject[]),
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

// 연구 범위 소개문은 더 이상 별도 필드가 아니다.
// Notion Research DB 의 Category=Scope 행이 담당하며, lib/research.ts 가 갈라 쓴다.
