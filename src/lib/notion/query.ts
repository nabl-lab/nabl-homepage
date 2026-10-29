/**
 * Notion 조회 오케스트레이터.
 *
 * 9개 DB 를 **한 번씩만** 불러온 뒤, 공개된 항목으로 relation 인덱스를 만들고
 * 그 인덱스를 매퍼에 넘긴다 (행마다 개별 조회하지 않는다).
 * 오류는 잡지 않고 그대로 던져 빌드를 실패시킨다. 빈 배열은 정상이다.
 */
import type { Member, ResearchArea, ResearchProject, Publication, Patent, Award, NewsItem, Resource, PiEntry, SiteContentEntry } from "../content-types";
import { queryAllRows, type NotionPage } from "./client";
// 속성명은 배럴 schema.ts 하나로 가져온다 (schema-people / -work / -news).
import { P_MEMBERS, PI_SECTION, P_RESEARCH, P_PROJECTS, P_PUBLICATIONS, P_PATENTS, P_AWARDS, P_NEWS, P_RESOURCES, P_SITE_CONTENT } from "./schema";
// 매퍼는 배럴 map.ts 하나로 가져온다 (실제 파일은 map-people / map-work / map-news).
import {
  mapMember,
  mapPiEntry,
  isPiEntryPublished,
  piSectionOf,
  mapResearch,
  mapProject,
  mapPublication,
  mapPatent,
  mapAward,
  mapNews,
  mapSiteContent,
  mapResource,
} from "./map";
import { checkSlugs } from "./validate";
import { checkAllTitleless } from "./titleless";
import { isCurrent } from "../members";
import {
  checkMemberResearchAreas,
  checkProjectDates,
  checkResearchAreas,
} from "./validate-rows";
import { buildRelationIndex, published } from "./relation-index";

export interface NotionContent {
  members: Member[] | null;
  researchAreas: ResearchArea[] | null;
  researchProjects: ResearchProject[] | null;
  publications: Publication[] | null;
  patents: Patent[] | null;
  awards: Award[] | null;
  news: NewsItem[] | null;
  resources: Resource[] | null;
  piEducation: PiEntry[] | null;
  piCareer: PiEntry[] | null;
  piActivities: PiEntry[] | null;
  siteContent: SiteContentEntry[] | null;
}

/** null = 해당 DS 가 설정되지 않음 → 호출부에서 JSON 폴백 */
function mapped<T>(
  rows: NotionPage[] | null,
  publishProp: string,
  fn: (p: NotionPage) => T | null,
): T[] | null {
  if (rows === null) return null;
  return published(rows, publishProp)
    .map(fn)
    .filter((v): v is T => v !== null);
}

export async function loadAll(): Promise<NotionContent> {
  // prettier-ignore
  const [mRows, rRows, pjRows, pbRows, ptRows, awRows, nwRows, rsRows, piRows, scRows] =
    await Promise.all([
      queryAllRows("members"),
      queryAllRows("research"),
      queryAllRows("projects"),
      queryAllRows("publications"),
      queryAllRows("patents"),
      queryAllRows("awards"),
      queryAllRows("news"),
      queryAllRows("resources"),
      queryAllRows("piProfile"),
      queryAllRows("siteContent"),
    ]);

  // relation 인덱스 (담는 범위는 notion/types.ts 주석 참고)
  const index = buildRelationIndex({
    members: mRows,
    projects: pjRows,
    publications: pbRows,
    research: rRows,
  });

  // 제목이 비어 매퍼가 버릴 행을 모든 컬렉션에서 한 번에 알린다 (notion/titleless.ts).
  // prettier-ignore
  checkAllTitleless({ members: mRows, piProfile: piRows, research: rRows, projects: pjRows,
    publications: pbRows, patents: ptRows, awards: awRows, news: nwRows, resources: rsRows,
    siteContent: scRows });

  const members = mapped(mRows, P_MEMBERS.publish, (p) => mapMember(p, index));
  // 연구 분야 경고는 **현재 구성원만** 본다. 졸업생은 분야를 연결하지 않는 게 정상이라
  // 전원을 대상으로 하면 경고가 수십 줄 쏟아져 쓸모가 없어진다.
  if (members) checkMemberResearchAreas(members.filter(isCurrent));

  // 연구 분야 점검은 **공개 여부와 무관하게 전 행**을 본다 (publish 는 함수가 판단).
  const allResearch = (rRows ?? [])
    .map((p) => mapResearch(p, index))
    .filter((v): v is NonNullable<typeof v> => v !== null);
  checkResearchAreas(allResearch);
  const news = mapped(nwRows, P_NEWS.publish, mapNews);
  const resources = mapped(rsRows, P_RESOURCES.publish, mapResource);

  const projects = mapped(pjRows, P_PROJECTS.publish, mapProject);
  if (projects) checkProjectDates(projects);

  // Slug 경고도 현재 구성원만 본다 — 졸업생은 상세 페이지를 만들지 않으므로
  // Slug 가 없는 게 정상이다.
  if (members)
    checkSlugs(
      "members",
      members.filter(isCurrent).map((m) => ({ slug: m.slug, label: m.name_ko })),
    );
  if (news) checkSlugs("news", news.map((n) => ({ slug: n.slug, label: n.title_ko || n.title })));
  if (resources)
    checkSlugs("resources", resources.map((r) => ({ slug: r.slug, label: r.title_ko || r.title })));

  const piBy = (section: string): PiEntry[] | null =>
    piRows === null
      ? null
      : piRows
          .filter(isPiEntryPublished)
          .filter((p) => piSectionOf(p) === section)
          .map(mapPiEntry)
          .filter((v): v is PiEntry => v !== null);

  return {
    members,
    researchAreas: mapped(rRows, P_RESEARCH.publish, (p) => mapResearch(p, index)),
    researchProjects: projects,
    publications: mapped(pbRows, P_PUBLICATIONS.publish, mapPublication),
    patents: mapped(ptRows, P_PATENTS.publish, mapPatent),
    awards: mapped(awRows, P_AWARDS.publish, (p) => mapAward(p, index)),
    news,
    siteContent: mapped(scRows, P_SITE_CONTENT.publish, mapSiteContent),
    resources,
    piEducation: piBy(PI_SECTION.education),
    piCareer: piBy(PI_SECTION.career),
    piActivities: piBy(PI_SECTION.service),
  };
}
