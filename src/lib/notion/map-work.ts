/**
 * Notion 행 → 사이트 모델 변환 (연구·성과·콘텐츠 DB).
 * 사람 관련(members, PI Profile)은 `map.ts`.
 *
 * 공통 규칙: **title 이 비어 있는 행은 null 을 돌려 조용히 건너뛴다.**
 * relation 은 RelationIndex 로 해석하며, 인덱스에 없는 대상(비공개)은 자동으로 빠진다.
 */
import type { NotionPage } from "./client";
import type {
  ResearchArea,
  ResearchProject,
  Publication,
  Patent,
  Award,
  NewsItem,
  Resource,
} from "../content-types";
import type { RelationIndex } from "./types";
import { resolveRefs } from "./types";
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
  text,
  num,
  bool,
  select,
  date,
  url,
  formula,
  relationIds,
} from "./parsers";
import { assetPath } from "./assets";

/** 모든 DB 공통: Publish 체크 여부 */
export const isPublished = (page: NotionPage, prop: string): boolean =>
  bool(page, prop);

/** 기간 문자열. 시작만 있으면 "2024–", 둘 다 없으면 빈 문자열. */
function periodOf(start: string | null, end: string | null): string {
  const s = start?.slice(0, 4) ?? "";
  const e = end?.slice(0, 4) ?? "";
  if (!s && !e) return "";
  return e && e !== s ? `${s}–${e}` : s || e;
}

export function mapResearch(page: NotionPage): ResearchArea | null {
  const title = text(page, P_RESEARCH.title);
  const titleKo = text(page, P_RESEARCH.titleKo);
  if (!title && !titleKo) return null;
  return {
    id: page.id,
    slug: text(page, P_RESEARCH.slug),
    title,
    title_ko: titleKo,
    summary: text(page, P_RESEARCH.description),
    summary_ko: text(page, P_RESEARCH.descriptionKo),
    // Scope(연구 범위) / Theme(세부 주제) 구분
    category: select(page, P_RESEARCH.category) ?? "",
    order: num(page, P_RESEARCH.order) ?? undefined,
    featured: bool(page, P_RESEARCH.featured),
    image: assetPath(page.id),
  };
}

export function mapProject(page: NotionPage): ResearchProject | null {
  const title = text(page, P_PROJECTS.title);
  const titleKo = text(page, P_PROJECTS.titleKo);
  if (!title && !titleKo) return null;
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    period: periodOf(
      date(page, P_PROJECTS.startDate),
      date(page, P_PROJECTS.endDate),
    ),
    funder: text(page, P_PROJECTS.funder),
    funder_ko: text(page, P_PROJECTS.funderKo),
  };
}

export function mapPublication(page: NotionPage): Publication | null {
  const title = text(page, P_PUBLICATIONS.title);
  const titleKo = text(page, P_PUBLICATIONS.titleKo);
  if (!title && !titleKo) return null;
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    authors: text(page, P_PUBLICATIONS.authors),
    venue: text(page, P_PUBLICATIONS.journal),
    venue_ko: "",
    year: num(page, P_PUBLICATIONS.year) ?? 0,
    category: select(page, P_PUBLICATIONS.type) ?? "",
    link: url(page, P_PUBLICATIONS.doi) ?? "",
    featured: bool(page, P_PUBLICATIONS.featured),
  };
}

export function mapPatent(page: NotionPage): Patent | null {
  const title = text(page, P_PATENTS.title);
  const titleKo = text(page, P_PATENTS.titleKo);
  if (!title && !titleKo) return null;
  const registration = text(page, P_PATENTS.registrationNumber);
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    number: registration || text(page, P_PATENTS.applicationNumber),
    // 연도 그룹에 쓰므로 등록일이 있으면 그걸, 없으면 출원일을 쓴다.
    date:
      date(page, P_PATENTS.registrationDate) ??
      date(page, P_PATENTS.filingDate) ??
      "",
    status: select(page, P_PATENTS.status) ?? "",
    inventors: text(page, P_PATENTS.inventors),
  };
}

/** awards: 수상자는 relation → 공개된 구성원 이름만 이어붙인다. */
export function mapAward(page: NotionPage, index: RelationIndex): Award | null {
  const title = text(page, P_AWARDS.title);
  const titleKo = text(page, P_AWARDS.titleKo);
  if (!title && !titleKo) return null;

  const people = resolveRefs(
    relationIds(page, P_AWARDS.relRecipient),
    index.members,
  );
  const when = date(page, P_AWARDS.date) ?? "";
  // Year 는 formula(number). Date 가 비면 null 이므로 날짜에서 직접 보정한다.
  const formulaYear = formula(page, P_AWARDS.year);
  const year =
    typeof formulaYear === "number"
      ? formulaYear
      : when
        ? Number(when.slice(0, 4))
        : 0;

  return {
    id: page.id,
    title,
    title_ko: titleKo,
    recipient: people.map((p) => p.name).filter(Boolean).join(", "),
    recipient_ko: people.map((p) => p.name_ko).filter(Boolean).join(", "),
    organization: text(page, P_AWARDS.organization),
    organization_ko: text(page, P_AWARDS.organizationKo),
    date: when,
    year,
  };
}

export function mapNews(page: NotionPage): NewsItem | null {
  const title = text(page, P_NEWS.title);
  const titleKo = text(page, P_NEWS.titleKo);
  if (!title && !titleKo) return null;
  return {
    id: page.id,
    slug: text(page, P_NEWS.slug),
    date: date(page, P_NEWS.date) ?? "",
    title,
    title_ko: titleKo,
    body: text(page, P_NEWS.body),
    body_ko: text(page, P_NEWS.bodyKo),
  };
}

export function mapResource(page: NotionPage): Resource | null {
  const title = text(page, P_RESOURCES.title);
  const titleKo = text(page, P_RESOURCES.titleKo);
  if (!title && !titleKo) return null;
  return {
    id: page.id,
    slug: text(page, P_RESOURCES.slug),
    title,
    title_ko: titleKo,
    description: text(page, P_RESOURCES.description),
    description_ko: text(page, P_RESOURCES.descriptionKo),
    type: select(page, P_RESOURCES.type) ?? "",
    date: date(page, P_RESOURCES.date),
    order: num(page, P_RESOURCES.order) ?? undefined,
    // File 은 대용량일 수 있어 내려받지 않는다 → 외부 링크만 노출한다.
    externalUrl: url(page, P_RESOURCES.externalUrl),
    // 빌드 시 내려받은 로컬 경로. 없으면 undefined → 이미지 영역을 비운다.
    thumbnail: assetPath(page.id),
  };
}
