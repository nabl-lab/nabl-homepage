/**
 * PI(책임교수) 페이지 전용 파생 데이터.
 *
 * 원본 JSON 은 여전히 content.ts 만 읽는다. 이 파일은 content.ts 가 내보낸 값에서
 * PI 페이지에 필요한 형태(수상 필터, 대표 논문, 항목 정렬)를 만든다.
 */
import { members, awards, publications, piProfile } from "./content";
import type { Award, Publication, PiEntry } from "./content";

export { piProfile };

/** PI 멤버. members.json 에서 position 이 "Principal Investigator" 인 항목으로 식별한다. */
export const pi = members.find((m) => m.position === "Principal Investigator") ?? null;

/**
 * awards.json 에서 PI 가 수상자인 것만. 별도 입력 없이 수상자 이름(영/한)으로 매칭한다.
 * (awards 데이터에 수상자 id 필드가 없으므로 이름으로 맞춘다.)
 */
export const piAwards: Award[] = pi
  ? awards.filter(
      (a) => a.recipient === pi.name || a.recipient_ko === pi.name_ko,
    )
  : [];

/** publications.json 에서 featured 로 표시된 대표 논문만, 연도 내림차순. */
export const featuredPublications: Publication[] = publications
  .filter((p) => p.featured === true)
  .sort((a, b) => b.year - a.year);

/** 학력·경력·대외활동 정렬: order 우선(작을수록 위), 없으면 시작연도 내림차순. */
export function sortEntries(entries: PiEntry[]): PiEntry[] {
  const far = Number.MAX_SAFE_INTEGER;
  return [...entries].sort(
    (a, b) => (a.order ?? far) - (b.order ?? far) || b.startYear - a.startYear,
  );
}
