/**
 * Notion 행 → 사이트 모델 변환 — **페이지 문구** (Site Content).
 *
 * 공통 규칙: Key 가 비어 있으면 찾을 방법이 없으므로 null 을 돌려 건너뛴다
 * (그 사실은 빌드 로그에 남는다 — notion/titleless.ts).
 * Block·Note·Page 는 사람용 메모라 읽지 않는다.
 *
 * 호출부는 배럴 `map.ts` 에서 가져온다.
 */
import type { NotionPage } from "./client";
import type { SiteContentEntry } from "../content-types";
import { P_SITE_CONTENT } from "./schema-content";
import { text, num } from "./parsers";

export function mapSiteContent(page: NotionPage): SiteContentEntry | null {
  const key = text(page, P_SITE_CONTENT.key);
  if (!key) return null;
  return {
    key,
    content: text(page, P_SITE_CONTENT.content),
    content_ko: text(page, P_SITE_CONTENT.contentKo),
    order: num(page, P_SITE_CONTENT.order),
  };
}
