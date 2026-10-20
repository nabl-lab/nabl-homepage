/**
 * 구성원을 **현재 구성원 / Alumni** 로 가르고, Alumni 를 학위별로 묶는다.
 *
 * 기준은 Notion `구성원 상태` 하나다.
 *   현재 구성원 : 재직·재학 / 휴학 / 수료
 *   Alumni     : 졸업 / 퇴직·퇴실
 * 그 밖의 값(Notion 에 선택지가 새로 생긴 경우)은 **어느 쪽에도 넣지 않고** 빌드
 * 로그에 경고를 남긴다 — 조용히 현재 구성원으로 섞여 들어가는 쪽이 더 위험하다.
 *
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type { Member } from "./content-types";
import { MEMBER_STATUS } from "./notion/schema-people.ts";

/** 현재 구성원으로 보는 상태 */
export const CURRENT_STATUSES: string[] = [
  MEMBER_STATUS.active,
  MEMBER_STATUS.leave,
  MEMBER_STATUS.completed,
];

/** Alumni 로 보는 상태 */
export const ALUMNI_STATUSES: string[] = [
  MEMBER_STATUS.graduated,
  MEMBER_STATUS.left,
];

/** Alumni 그룹 키. 화면 문구는 호출부가 ui 사전에서 꺼낸다. */
export type AlumniGroupKey = "phd" | "ms";

export interface AlumniGroup {
  key: AlumniGroupKey;
  items: Member[];
}

/** 박사 학위를 받은 졸업생인지. `학위` 에 "Ph.D." 가 있으면 그렇다. */
const hasPhd = (m: Member): boolean => m.degrees.includes("Ph.D.");

export const isCurrent = (m: Member): boolean => CURRENT_STATUSES.includes(m.status);
export const isAlumnus = (m: Member): boolean => ALUMNI_STATUSES.includes(m.status);

/** 현재 구성원. 정렬은 기존 방식(sortMembers)을 호출부에서 그대로 쓴다. */
export function currentMembers(list: Member[]): Member[] {
  return list.filter(isCurrent);
}

/**
 * Alumni 정렬 — 졸업 연도 내림차순, 연도 없는 사람은 맨 뒤.
 * 같은 연도면 영문명 오름차순 (영문명이 비면 한국어 이름으로 폴백).
 */
function byGraduation(a: Member, b: Member): number {
  const ya = a.graduatedYear;
  const yb = b.graduatedYear;
  if (ya !== yb) {
    if (ya === null) return 1; // 연도 없음 → 뒤로
    if (yb === null) return -1;
    return yb - ya;
  }
  const na = a.name || a.name_ko;
  const nb = b.name || b.name_ko;
  return na.localeCompare(nb, "en");
}

/**
 * Alumni 를 Ph.D. / M.S. 두 그룹으로 묶는다. 각 그룹은 byGraduation 순이고,
 * 비어 있는 그룹은 아예 돌려주지 않는다 (화면에 빈 제목이 남지 않게).
 *
 * Ph.D. 와 M.S. 를 모두 가진 사람은 **Ph.D. 쪽에만** 들어간다 (중복 노출 방지).
 */
export function alumniGroups(list: Member[]): AlumniGroup[] {
  const alumni = list.filter(isAlumnus);
  const phd = alumni.filter(hasPhd).sort(byGraduation);
  const ms = alumni.filter((m) => !hasPhd(m)).sort(byGraduation);

  const groups: AlumniGroup[] = [];
  if (phd.length > 0) groups.push({ key: "phd", items: phd });
  if (ms.length > 0) groups.push({ key: "ms", items: ms });
  return groups;
}

/** 현재 구성원도 Alumni 도 아닌 상태 값 (빌드 경고용). */
export function unknownStatuses(list: Member[]): { who: string; status: string }[] {
  return list
    .filter((m) => !isCurrent(m) && !isAlumnus(m))
    .map((m) => ({ who: m.name_ko || m.name || "(이름 없음)", status: m.status }));
}
