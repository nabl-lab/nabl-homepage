/**
 * Notion 조회 오케스트레이터.
 *
 * 9개 DB 를 **한 번씩만** 불러온 뒤, 공개된 항목으로 relation 인덱스를 만들고
 * 그 인덱스를 매퍼에 넘긴다 (행마다 개별 조회하지 않는다).
 * 오류는 잡지 않고 그대로 던져 빌드를 실패시킨다. 빈 배열은 정상이다.
 */
import type {
  Member,
  ResearchArea,
  ResearchProject,
  Publication,
  Patent,
  Award,
  NewsItem,
  Resource,
  PiEntry,
} from "../content-types";
import { queryAllRows, type NotionPage } from "./client";
import { emptyIndex, type RelationIndex, type TitleRef } from "./types";
import { text, bool } from "./parsers";
import { P_MEMBERS } from "./schema-people";
import {
  P_RESEARCH,
  P_PROJECTS,
  P_PUBLICATIONS,
  P_PATENTS,
  P_AWARDS,
  P_NEWS,
  P_RESOURCES,
} from "./schema-work";
import {
  mapMember,
  isMemberPublished,
  mapPiEntry,
  isPiEntryPublished,
  piSectionOf,
} from "./map";
import {
  mapResearch,
  mapProject,
  mapPublication,
  mapPatent,
  mapAward,
  mapNews,
  mapResource,
} from "./map-work";
import { checkSlugs } from "./validate";
import { PI_SECTION } from "./schema-people";

/** Publish 체크된 행만 남긴다. 설정이 없어 null 인 경우 빈 배열로 본다. */
const published = (rows: NotionPage[] | null, prop: string): NotionPage[] =>
  (rows ?? []).filter((r) => bool(r, prop));

const titleRef = (
  r: NotionPage,
  titleProp: string,
  titleKoProp: string,
  slugProp: string,
): TitleRef => ({
  id: r.id,
  slug: slugProp ? text(r, slugProp) : "",
  title: text(r, titleProp),
  title_ko: text(r, titleKoProp),
});

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
  const [mRows, rRows, pjRows, pbRows, ptRows, awRows, nwRows, rsRows, piRows] =
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
    ]);

  // relation 인덱스 — 공개된 항목만 담으므로 비공개 대상은 자동으로 빠진다.
  const index: RelationIndex = emptyIndex();
  for (const r of published(mRows, P_MEMBERS.publish)) {
    const nameKo = text(r, P_MEMBERS.nameKo);
    if (!nameKo) continue;
    index.members.set(r.id, {
      id: r.id,
      slug: text(r, P_MEMBERS.slug),
      name: text(r, P_MEMBERS.nameEn),
      name_ko: nameKo,
    });
  }
  for (const r of published(pjRows, P_PROJECTS.publish))
    index.projects.set(r.id, titleRef(r, P_PROJECTS.title, P_PROJECTS.titleKo, P_PROJECTS.slug));
  for (const r of published(pbRows, P_PUBLICATIONS.publish))
    index.publications.set(r.id, titleRef(r, P_PUBLICATIONS.title, P_PUBLICATIONS.titleKo, ""));
  for (const r of published(rRows, P_RESEARCH.publish))
    index.research.set(r.id, titleRef(r, P_RESEARCH.title, P_RESEARCH.titleKo, P_RESEARCH.slug));

  const members = mapped(mRows, P_MEMBERS.publish, mapMember);
  const news = mapped(nwRows, P_NEWS.publish, mapNews);
  const resources = mapped(rsRows, P_RESOURCES.publish, mapResource);

  if (members) checkSlugs("members", members.map((m) => ({ slug: m.slug, label: m.name_ko })));
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
    researchAreas: mapped(rRows, P_RESEARCH.publish, mapResearch),
    researchProjects: mapped(pjRows, P_PROJECTS.publish, mapProject),
    publications: mapped(pbRows, P_PUBLICATIONS.publish, mapPublication),
    patents: mapped(ptRows, P_PATENTS.publish, mapPatent),
    awards: mapped(awRows, P_AWARDS.publish, (p) => mapAward(p, index)),
    news,
    resources,
    piEducation: piBy(PI_SECTION.education),
    piCareer: piBy(PI_SECTION.career),
    piActivities: piBy(PI_SECTION.service),
  };
}
