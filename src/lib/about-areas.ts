/**
 * About 페이지의 Research Scope / Research Areas 를 화면용으로 바꾸는 규칙.
 *
 * Notion Research DB 한 곳에서 둘 다 나온다 (가르는 규칙은 research.ts).
 *   - Scope 행 → Scope 카드 (제목 + 설명)
 *   - Theme 행 → N·A·B·L 스트립과 패널. Order 오름차순.
 *
 * 분야명·키워드는 전부 DB 텍스트에서 온다. 화면(.astro)에 다시 규칙을 쓰지 않는다.
 * import 에 `.ts` 를 붙인 이유: npm test 가 이 파일을 그대로 불러온다.
 */
import type { Locale, ResearchArea } from "./content-types";
import { localizedText } from "./content-helpers.ts";
import { scopeAreas, themeAreas, themeDetailPages } from "./research.ts";

/** Code → 색 (global.css 의 --color-area-*). 목록에 없는 Code 는 중립 회색. */
const AREA_COLOR: Record<string, string> = {
  N: "var(--color-area-n)",
  A: "var(--color-area-a)",
  B: "var(--color-area-b)",
  L: "var(--color-area-l)",
};
const FALLBACK_COLOR = "var(--color-ink-subtle)";

export function areaColor(code: string): string {
  return AREA_COLOR[code.trim().toUpperCase()] ?? FALLBACK_COLOR;
}

export interface AreaPanel {
  /** 스트립 → 패널 앵커 id. Code 기준이고, Code 가 비거나 겹치면 행 id 로 대신한다. */
  anchor: string;
  code: string;
  color: string;
  title: string;
  /** 반대 언어 제목. 비었거나 제목과 같으면 null (같은 줄이 두 번 나오지 않게). */
  subtitle: string | null;
  description: string | null;
  keywords: string[];
  image?: string;
  /** 상세 페이지가 실제로 생성되는 행만 slug. 없으면 null → 링크를 걸지 않는다. */
  detailSlug: string | null;
}

export function areaPanels(areas: ResearchArea[], lang: Locale): AreaPanel[] {
  // 링크 판단은 상세 경로 생성과 같은 함수로 한다 (Slug 가 겹친 두 번째 행은 링크 없음).
  const detailIds = new Set(themeDetailPages(areas).map((a) => a.id));
  const other: Locale = lang === "ko" ? "en" : "ko";
  const usedAnchors = new Set<string>();

  return themeAreas(areas).flatMap((a) => {
    const title = localizedText(a, "title", lang);
    if (!title) return [];
    const otherTitle = localizedText(a, "title", other);
    let anchor = `area-${(a.code.trim() || a.id).toLowerCase()}`;
    if (usedAnchors.has(anchor)) anchor = `area-${a.id}`;
    usedAnchors.add(anchor);
    return [
      {
        anchor,
        code: a.code.trim(),
        color: areaColor(a.code),
        title,
        subtitle: otherTitle && otherTitle !== title ? otherTitle : null,
        description: localizedText(a, "summary", lang),
        keywords: a.keywords,
        image: a.image,
        detailSlug: detailIds.has(a.id) ? a.slug.trim() : null,
      },
    ];
  });
}

export interface ScopeBlock {
  id: string;
  title: string | null;
  description: string;
}

/** Scope 행 → 카드. 설명이 양쪽 언어 모두 비면 건너뛴다 (제목만 있는 카드는 내보내지 않음). */
export function scopeBlocks(areas: ResearchArea[], lang: Locale): ScopeBlock[] {
  return scopeAreas(areas).flatMap((s) => {
    const description = localizedText(s, "summary", lang);
    return description
      ? [{ id: s.id, title: localizedText(s, "title", lang), description }]
      : [];
  });
}
