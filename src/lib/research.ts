/**
 * 연구 분야 목록·상세의 공통 규칙.
 *
 * Notion Research DB 한 곳에 `Scope`(연구 범위)와 `Theme`(세부 주제)이 같이 들어 있다.
 * 화면에서 쓰는 방식이 다르므로 여기서 한 번만 가른다.
 *   - Scope : /research 목록 상단의 소개 문구. 상세 페이지 없음
 *   - Theme : /research 목록의 카드 + 공개된 행만 상세 페이지
 *
 * 정렬은 `Order` 오름차순(작은 숫자 먼저)이고, 값이 없으면 맨 뒤다 (byOrder).
 *
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type { ResearchArea } from "./content-types";
import { RESEARCH_CATEGORY } from "./notion/schema-work.ts";

/** Order 오름차순. 값이 없으면 맨 뒤. */
function byOrder<T extends { order?: number }>(list: T[]): T[] {
  const far = Number.MAX_SAFE_INTEGER;
  return [...list].sort((a, b) => (a.order ?? far) - (b.order ?? far));
}

/** 소개 문구로 쓰는 Scope 행. Order 순. */
export function scopeAreas(areas: ResearchArea[]): ResearchArea[] {
  return byOrder(areas.filter((a) => a.category === RESEARCH_CATEGORY.scope));
}

/** 카드로 쓰는 Theme 행. Order 순. 공개 여부와 무관하게 전부 (목록에는 이름을 보인다). */
export function themeAreas(areas: ResearchArea[]): ResearchArea[] {
  return byOrder(areas.filter((a) => a.category === RESEARCH_CATEGORY.theme));
}

/**
 * 상세 페이지를 만들 행 — **공개 + Theme + Slug 있음** 세 조건을 모두 만족할 때만.
 *
 * Slug 가 겹치면 먼저 온 행만 남긴다. 같은 경로를 두 번 만들면 빌드가 죽기 때문이다
 * (News 의 빈 Slug 가 목록 경로와 충돌해 빌드를 멈춘 적이 있다 — CLAUDE.md 15번).
 * 겹침 자체는 빌드 로그에 경고로 남는다 (notion/validate-rows.ts).
 */
export function themeDetailPages(areas: ResearchArea[]): ResearchArea[] {
  const seen = new Set<string>();
  return themeAreas(areas).filter((a) => {
    const slug = a.slug.trim();
    if (!a.publish || !slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

/** 이 분야에 상세 페이지가 있는지 (목록 카드에서 링크를 걸지 말지 판단). */
export function hasDetailPage(area: ResearchArea): boolean {
  return (
    area.publish && area.slug.trim() !== "" && area.category === RESEARCH_CATEGORY.theme
  );
}
