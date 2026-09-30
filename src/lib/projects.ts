/**
 * 연구 과제 목록의 화면용 그룹화.
 *
 * 과제가 100건을 넘어가면 한 줄로 죽 늘어놓기만 해서는 읽기 어렵다.
 * 페이지 나누기(pagination) 대신 연도로 묶어 한 화면에서 훑을 수 있게 한다.
 *
 * 그룹 규칙
 *  1) Status 가 "Ongoing" 이거나 End_date 가 비어 있으면 → 맨 위 "진행 중" 그룹
 *  2) 나머지는 Start_date 의 연도로 묶고, 최신 연도부터 내림차순
 *  3) Start_date 가 비어 있으면 연도를 알 수 없으므로 진행 중 그룹으로 올린다
 *     (건수는 빌드 로그에 경고로 남는다 — notion/validate.ts 의 checkProjectDates)
 */
import type { ResearchProject } from "./content-types";
import { PROJECT_STATUS } from "./notion/schema-work";

export interface ProjectGroup {
  /** 진행 중 그룹이면 true. 화면 라벨은 호출부가 ui 사전에서 꺼낸다. */
  ongoing: boolean;
  /** 완료 그룹의 시작 연도. 진행 중 그룹은 null. */
  year: number | null;
  items: ResearchProject[];
}

/** 이 과제를 "진행 중" 으로 볼지. */
function isOngoing(p: ResearchProject): boolean {
  return p.status === PROJECT_STATUS.ongoing || !p.endDate || !p.startDate;
}

/** 시작 연도. 없으면 null. */
function startYear(p: ResearchProject): number | null {
  const y = Number(p.startDate?.slice(0, 4));
  return Number.isFinite(y) && y > 0 ? y : null;
}

/** 같은 그룹 안에서의 정렬: 시작일 내림차순, 없으면 맨 뒤. */
function byStartDesc(a: ResearchProject, b: ResearchProject): number {
  return (b.startDate ?? "").localeCompare(a.startDate ?? "");
}

/** 과제를 "진행 중" + 연도별 그룹으로 묶는다. 0건이면 빈 배열. */
export function groupProjects(list: ResearchProject[]): ProjectGroup[] {
  const ongoing: ResearchProject[] = [];
  const byYear = new Map<number, ResearchProject[]>();

  for (const p of list) {
    if (isOngoing(p)) {
      ongoing.push(p);
      continue;
    }
    const year = startYear(p)!;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }

  const groups: ProjectGroup[] = [];
  if (ongoing.length > 0) {
    groups.push({ ongoing: true, year: null, items: ongoing.sort(byStartDesc) });
  }
  for (const [year, items] of [...byYear.entries()].sort((a, b) => b[0] - a[0])) {
    groups.push({ ongoing: false, year, items: items.sort(byStartDesc) });
  }
  return groups;
}
