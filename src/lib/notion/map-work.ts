/**
 * Notion 행 → 사이트 모델 변환 — **연구·성과** (research, projects, publications,
 * patents, awards). 속성명은 schema-work.ts 에서만 가져온다.
 *
 * 공통 규칙: **title 이 비어 있는 행은 null 을 돌려 조용히 건너뛴다** (오류 아님).
 * relation 은 RelationIndex 로 해석하며, 인덱스에 없는 대상(비공개)은 자동으로 빠진다.
 * 같은 축의 다른 파일: map-people.ts(사람), map-news.ts(소식·자료).
 * 호출부는 배럴 `map.ts` 에서 가져온다.
 */
import type { NotionPage } from "./client";
import type { ResearchArea, ResearchProject, Publication, Patent, Award } from "../content-types";
import { type RelationIndex, resolveRefs } from "./types";
import { P_RESEARCH, P_PROJECTS, P_PUBLICATIONS, P_PATENTS, P_AWARDS } from "./schema-work";
import { text, num, bool, select, date, url, formula, relationIds } from "./parsers";
import { assetPath } from "./assets";

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
  const startDate = date(page, P_PROJECTS.startDate);
  const endDate = date(page, P_PROJECTS.endDate);
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    period: periodOf(startDate, endDate),
    funder: text(page, P_PROJECTS.funder),
    funder_ko: text(page, P_PROJECTS.funderKo),
    status: select(page, P_PROJECTS.status) ?? "",
    startDate,
    endDate,
    // 아래 둘은 화면에 표시하지 않는다 (내부용·역방향 relation). 타입에만 담아 둔다.
    grantNumber: text(page, P_PROJECTS.grantNumber),
    publicationIds: relationIds(page, P_PROJECTS.relPublications),
  };
}

export function mapPublication(page: NotionPage): Publication | null {
  const title = text(page, P_PUBLICATIONS.title);
  const titleKo = text(page, P_PUBLICATIONS.titleKo);
  if (!title && !titleKo) return null;
  const publishedDate = date(page, P_PUBLICATIONS.publishedDate);
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    authors: text(page, P_PUBLICATIONS.authors),
    venue: text(page, P_PUBLICATIONS.journal),
    venue_ko: "",
    // 연도 결정(게재일 우선)은 content.ts 가 출처와 무관하게 한 번에 적용한다.
    // 여기서는 Notion `Year` 숫자를 그대로 담는다.
    year: num(page, P_PUBLICATIONS.year),
    publishedDate,
    category: select(page, P_PUBLICATIONS.type) ?? "",
    link: url(page, P_PUBLICATIONS.doi) ?? "",
    // 아래 둘은 화면에 표시하지 않는다 (내부용·사사 과제 relation). 타입에만 담아 둔다.
    personalGrant: bool(page, P_PUBLICATIONS.personalGrant),
    fundingProjectIds: relationIds(page, P_PUBLICATIONS.relFundingProjects),
    featured: bool(page, P_PUBLICATIONS.featured),
  };
}

export function mapPatent(page: NotionPage): Patent | null {
  const title = text(page, P_PATENTS.title);
  const titleKo = text(page, P_PATENTS.titleKo);
  if (!title && !titleKo) return null;
  const registrationNumber = text(page, P_PATENTS.registrationNumber);
  const registrationDate = date(page, P_PATENTS.registrationDate);
  return {
    id: page.id,
    title,
    title_ko: titleKo,
    number: registrationNumber || text(page, P_PATENTS.applicationNumber),
    // 연도 그룹에 쓰므로 등록일이 있으면 그걸, 없으면 출원일을 쓴다.
    date: registrationDate ?? date(page, P_PATENTS.filingDate) ?? "",
    status: select(page, P_PATENTS.status) ?? "",
    registrationNumber,
    registrationDate,
    country: select(page, P_PATENTS.country) ?? "",
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
