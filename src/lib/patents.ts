/**
 * 특허 분류 — 등록 / 출원 / 미표시.
 *
 * 규칙 (위에서부터 먼저 걸리는 것으로 정한다)
 *  1) Status 가 Expired → **홈페이지에 표시하지 않는다** (Publish 가 켜져 있어도)
 *  2) 등록번호 또는 등록일이 있으면 → 등록
 *  3) 그 외 → 출원
 *
 * 2·3번은 Notion `Status` 선택지(Registered / Filed) 철자에 의존하지 않는다.
 * 선택지 이름이 하나 바뀌는 순간 조용히 틀린 목록이 나오기 때문이다.
 * Status 는 화면 표시용으로만 쓴다.
 *
 * 1번만 예외적으로 Status 값을 본다. 만료 여부를 알려 주는 다른 속성이 없기 때문이다.
 * 이쪽은 철자가 바뀌어도 **항목이 다시 보이게 될 뿐**이어서(빠지는 게 아니라) 눈에 띈다.
 * 만료 특허가 계속 보이면 Notion 의 Status 선택지 이름이 바뀐 것이니
 * src/lib/notion/schema-work.ts 의 PATENT_STATUS 를 맞춰 주면 된다.
 *
 * 필터는 JS 없이 정적 경로로 구현한다 (이 사이트의 기존 방식).
 *   /achievements/patents        → 등록 (기본)
 *   /achievements/patents/filed  → 출원
 */
import type { Patent } from "./content-types";
import { PATENT_STATUS } from "./notion/schema-work";

/** 화면 구분 값. URL 슬러그로도 그대로 쓴다. */
export const PATENT_VIEWS = ["registered", "filed"] as const;
export type PatentView = (typeof PATENT_VIEWS)[number];

/** 기본 선택. 바로 보여 줄 목록은 등록 특허다. */
export const DEFAULT_PATENT_VIEW: PatentView = "registered";

/** 만료 특허인지. 만료는 등록·출원 어느 목록에도 넣지 않는다. */
export function isExpired(p: Patent): boolean {
  return p.status.trim() === PATENT_STATUS.expired;
}

/** 홈페이지에 보여 줄 특허인지 (만료 제외). */
export function isVisible(p: Patent): boolean {
  return !isExpired(p);
}

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

/** 구분별로 나눈 목록. 만료 특허는 양쪽 모두에서 빠진다. */
export function splitPatents(list: Patent[]): Record<PatentView, Patent[]> {
  const visible = list.filter(isVisible);
  return {
    registered: visible.filter(isRegistered),
    filed: visible.filter((p) => !isRegistered(p)),
  };
}
