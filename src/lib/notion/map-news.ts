/**
 * Notion 행 → 사이트 모델 변환 — **소식·공개 자료** (news, resources).
 * 속성명은 schema-work.ts 에서만 가져온다.
 *
 * 공통 규칙: **title 이 비어 있는 행은 null 을 돌려 조용히 건너뛴다** (오류 아님).
 * 같은 축의 다른 파일: map-people.ts(사람), map-work.ts(연구·성과).
 * 호출부는 배럴 `map.ts` 에서 가져온다.
 */
import type { NotionPage } from "./client";
import type { NewsItem, Resource } from "../content-types";
import { P_NEWS, P_RESOURCES } from "./schema-news";
import { text, num, select, date, url } from "./parsers";
import { assetPath } from "./assets";

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
