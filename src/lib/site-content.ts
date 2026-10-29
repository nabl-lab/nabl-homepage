/**
 * 페이지 문구 조회 — Key 로 찾아 **문단 배열**로 돌려준다.
 *
 * 규칙
 *  - Notion 에서 Publish 된 행만 들어온다 (query.ts 의 mapped 가 걸러 준다)
 *  - 같은 Key 가 여러 행이면 `Order` 오름차순으로 이어 붙인다. Order 가 없으면 맨 뒤
 *  - 각 문단은 localizedText 규칙을 따른다 (현재 언어 → 반대 언어 → 둘 다 비면 건너뜀)
 *  - 해당 Key 가 없으면 **빈 배열**이다. 화면은 그때 영역을 렌더하지 않는다
 *
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type { SiteContentEntry } from "./content-types";
import type { Locale } from "./content-types";
import { localizedText } from "./content-helpers.ts";

/** 같은 Key 안의 정렬: Order 오름차순, 없으면 맨 뒤. */
function byOrder(a: SiteContentEntry, b: SiteContentEntry): number {
  const far = Number.MAX_SAFE_INTEGER;
  return (a.order ?? far) - (b.order ?? far);
}

/**
 * 그 Key 의 문단들. 양쪽 언어 모두 빈 문단은 건너뛴다.
 *
 * @example paragraphs(siteContent, "about.intro", lang) // → ["1문단", "2문단", "3문단"]
 */
export function paragraphs(
  entries: SiteContentEntry[],
  key: string,
  lang: Locale,
): string[] {
  return entries
    .filter((e) => e.key === key)
    .sort(byOrder)
    .map((e) => localizedText(e, "content", lang))
    .filter((v): v is string => Boolean(v));
}

/**
 * 한 문단만 필요한 자리(히어로 한 줄 소개 등). 없으면 null.
 * 여러 행이 들어 있으면 Order 가 가장 앞선 것을 쓴다.
 */
export function oneParagraph(
  entries: SiteContentEntry[],
  key: string,
  lang: Locale,
): string | null {
  return paragraphs(entries, key, lang)[0] ?? null;
}

/** 데이터에 들어 있는 Key 목록 (중복 제거). 빌드 검증·문서용. */
export function contentKeys(entries: SiteContentEntry[]): string[] {
  return [...new Set(entries.map((e) => e.key))].sort();
}
