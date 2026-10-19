/**
 * Notion 행 → 사이트 모델 변환 — **연구 분야** (research).
 *
 * 다른 매퍼와 달리 relation 조인이 둘 붙는다 (`Members`, `Projects`). 그래서
 * map-work.ts 에서 따로 뺐다. 속성명은 schema-work.ts 의 P_RESEARCH 에서만 가져온다.
 *
 * 인덱스에는 **공개 항목만** 들어 있어(members·projects) 비공개 구성원·과제는 자동으로
 * 빠진다. 별도 필터가 필요 없다.
 *
 * 같은 축의 다른 파일: map-people.ts(사람), map-work.ts(과제·성과), map-news.ts(소식·자료).
 * 호출부는 배럴 `map.ts` 에서 가져온다.
 */
import type { NotionPage } from "./client";
import type { ResearchArea } from "../content-types";
import { type RelationIndex, resolveRefs } from "./types";
import { P_RESEARCH } from "./schema-work";
import { text, num, bool, select, relationIds } from "./parsers";
import { assetPath } from "./assets";

/** `Keywords`(쉼표 구분) → 태그 배열. 빈 조각은 버린다. */
function keywordsOf(page: NotionPage): string[] {
  return text(page, P_RESEARCH.keywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * research 행 → ResearchArea.
 *
 * Members·Projects relation 은 인덱스로 해석한다. 인덱스에는 공개 항목만 들어 있어
 * 비공개 구성원·과제는 자동으로 빠진다 (별도 필터가 필요 없다).
 */
export function mapResearch(page: NotionPage, index: RelationIndex): ResearchArea | null {
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
    code: select(page, P_RESEARCH.code) ?? "",
    keywords: keywordsOf(page),
    order: num(page, P_RESEARCH.order) ?? undefined,
    featured: bool(page, P_RESEARCH.featured),
    publish: bool(page, P_RESEARCH.publish),
    members: resolveRefs(relationIds(page, P_RESEARCH.relMembers), index.members).map(
      (m) => ({ name: m.name, name_ko: m.name_ko, slug: m.slug }),
    ),
    projects: resolveRefs(relationIds(page, P_RESEARCH.relProjects), index.projects).map(
      (p) => ({ title: p.title, title_ko: p.title_ko, slug: p.slug }),
    ),
    image: assetPath(page.id),
  };
}
