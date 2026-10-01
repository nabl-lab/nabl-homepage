/**
 * 특허의 등록 / 출원 구분.
 *
 * 구분 근거는 **Registration_number 또는 Registration_date 의 유무**다.
 * Notion `Status` 선택지(Registered / Filed …) 철자에 의존하지 않는다 — 선택지 이름이
 * 하나 바뀌는 순간 조용히 틀린 목록이 나오기 때문이다. Status 는 화면 표시용으로만 쓴다.
 *
 * 필터는 JS 없이 정적 경로로 구현한다 (이 사이트의 기존 방식).
 *   /achievements/patents        → 등록 (기본)
 *   /achievements/patents/filed  → 출원
 */
import type { Patent } from "./content-types";

/** 화면 구분 값. URL 슬러그로도 그대로 쓴다. */
export const PATENT_VIEWS = ["registered", "filed"] as const;
export type PatentView = (typeof PATENT_VIEWS)[number];

/** 기본 선택. 바로 보여 줄 목록은 등록 특허다. */
export const DEFAULT_PATENT_VIEW: PatentView = "registered";

/** 등록된 특허인지. 등록번호나 등록일이 하나라도 있으면 등록으로 본다. */
export function isRegistered(p: Patent): boolean {
  return p.registrationNumber.trim() !== "" || p.registrationDate !== null;
}

/** 슬러그 → 구분 값. 모르는 값이면 null. */
export function slugToPatentView(slug: string | undefined): PatentView | null {
  if (!slug) return DEFAULT_PATENT_VIEW;
  return (PATENT_VIEWS as readonly string[]).includes(slug) ? (slug as PatentView) : null;
}

/** 구분 값 → URL 경로. 기본 구분은 접미사 없는 경로를 쓴다. */
export function patentPath(view: PatentView): string {
  return view === DEFAULT_PATENT_VIEW
    ? "/achievements/patents"
    : `/achievements/patents/${view}`;
}

/** 구분별로 나눈 목록. */
export function splitPatents(list: Patent[]): Record<PatentView, Patent[]> {
  return {
    registered: list.filter(isRegistered),
    filed: list.filter((p) => !isRegistered(p)),
  };
}
