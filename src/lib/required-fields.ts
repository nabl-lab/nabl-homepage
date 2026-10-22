/**
 * 외부 데이터(Notion)의 **불완전한 항목을 걸러 내는 곳.**
 *
 * 원칙: 항목 하나가 비어도 **빌드 전체는 성공해야 한다.** 그 항목만 건너뛰고
 * 빌드 로그에 경고를 남긴다 (CLAUDE.md 15번).
 *
 * 실제로 났던 사고: News 한 건의 빈 Slug 가 `/en/news/` 경로를 만들어 목록 페이지와
 * 충돌하고 빌드 전체가 "Missing parameter: lang" 으로 죽었다.
 *
 * content.ts 에서 부르는 이유 — Notion 매퍼에서 걸러 내면 `src/data/` JSON 폴백에는
 * 규칙이 안 걸려 두 출처가 어긋난다. 유일한 통로에서 한 번만 적용한다.
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type {
  Award,
  EtcItem,
  Member,
  NewsItem,
  Publication,
  Patent,
  ResearchArea,
  ResearchProject,
  Resource,
} from "./content-types";

/** 한 필드의 검사 규칙. `filled` 가 false 면 그 항목을 건너뛴다. */
interface Rule<T> {
  /** 로그에 찍을 필드 이름 (Notion 속성명과 같게 쓴다) */
  field: string;
  filled: (item: T) => boolean;
}

const text = (v: string | null | undefined): boolean => (v ?? "").trim() !== "";

/** "YYYY-MM-DD" 형태인지. 빈 값이나 깨진 값은 false. */
const isoDate = (v: string | null | undefined): boolean =>
  /^\d{4}-\d{2}-\d{2}/.test((v ?? "").trim());

/**
 * 규칙에 미달한 항목을 걸러 내고 빌드 로그에 경고를 남긴다.
 *
 * 로그 예: `[skip] News '테스트용 뉴스': slug 누락`
 */
function keepComplete<T>(
  label: string,
  items: T[],
  nameOf: (item: T) => string,
  rules: Rule<T>[],
): T[] {
  const kept: T[] = [];
  let skipped = 0;

  for (const item of items) {
    const missing = rules.filter((r) => !r.filled(item)).map((r) => r.field);
    if (missing.length === 0) {
      kept.push(item);
      continue;
    }
    skipped += 1;
    const name = nameOf(item).trim() || "(제목 없음)";
    console.warn(`[skip] ${label} '${name}': ${missing.join(", ")} 누락`);
  }

  if (skipped > 0) {
    console.warn(
      `[skip] ${label}: ${skipped}건을 건너뛰었습니다 (전체 ${items.length}건). ` +
        `Notion 에서 위 필드를 채우고 다시 빌드하세요.`,
    );
  }
  return kept;
}

/* ── 타입별 필수 필드 ─────────────────────────────────────────────
 * "없으면 화면이 깨지거나 그 항목을 읽을 방법이 없는 것" 만 필수로 둔다.
 * 비어도 화면이 멀쩡한 값(연구 주제, 설명, 지원 기관 …)은 필수가 아니다.
 * ────────────────────────────────────────────────────────────── */

/**
 * 소식 — title·slug·date 가 필수.
 *  - slug: 본문이 상세 페이지에만 있어 없으면 읽을 방법이 없고, 빈 slug 는 목록
 *          경로와 충돌해 빌드를 깨뜨린다 (위 사고)
 *  - date: 목록 정렬 기준이고, 없으면 화면에 "Invalid Date" 가 찍힌다
 */
export const completeNews = (items: NewsItem[]): NewsItem[] =>
  keepComplete("News", items, (n) => n.title_ko || n.title, [
    // Notion 경로에서는 매퍼가 제목 없는 행을 먼저 버린다(경고는 validate.ts 의
    // checkTitlelessRows). JSON 폴백에는 매퍼가 없어 이 규칙이 유일한 방어선이다.
    { field: "title", filled: (n) => text(n.title) || text(n.title_ko) },
    { field: "slug", filled: (n) => text(n.slug) },
    { field: "date", filled: (n) => isoDate(n.date) },
  ]);

/**
 * 구성원 — 이름만 필수.
 *
 * `직책·과정`(position)은 **일부러 필수로 두지 않는다.** 직책이 없는 구성원도
 * 목록에 그대로 보여 주기로 정했고(정렬에서 맨 뒤로 간다), 필수로 만들면 그 사람이
 * 사이트에서 사라진다. Slug 도 필수가 아니다 — 카드에 필요한 정보가 다 있고,
 * 상세 페이지만 만들지 않는다 (members/[slug].astro 의 withUniqueSlug).
 */
export const completeMembers = (items: Member[]): Member[] =>
  keepComplete("Members", items, (m) => m.name_ko || m.name, [
    { field: "이름", filled: (m) => text(m.name_ko) || text(m.name) },
  ]);

/** 논문 — 제목만. 연도는 없어도 "연도 미상" 그룹으로 정상 처리된다. */
export const completePublications = (items: Publication[]): Publication[] =>
  keepComplete("Publications", items, (p) => p.title || p.title_ko, [
    { field: "title", filled: (p) => text(p.title) || text(p.title_ko) },
  ]);

/** 특허 — 날짜가 없으면 연도 그룹이 `NaN` 이 된다. */
export const completePatents = (items: Patent[]): Patent[] =>
  keepComplete("Patents", items, (p) => p.title || p.title_ko, [
    { field: "title", filled: (p) => text(p.title) || text(p.title_ko) },
    { field: "date", filled: (p) => isoDate(p.date) },
  ]);

/** 수상 — 날짜가 없으면 연도 그룹이 `NaN` 이 된다. */
export const completeAwards = (items: Award[]): Award[] =>
  keepComplete("Awards", items, (a) => a.title || a.title_ko, [
    { field: "title", filled: (a) => text(a.title) || text(a.title_ko) },
    { field: "date", filled: (a) => isoDate(a.date) },
  ]);

/** 기타 성과 — 수상과 같은 이유. */
export const completeEtc = (items: EtcItem[]): EtcItem[] =>
  keepComplete("Etc", items, (e) => e.title || e.title_ko, [
    { field: "title", filled: (e) => text(e.title) || text(e.title_ko) },
    { field: "date", filled: (e) => isoDate(e.date) },
  ]);

/** 공개 자료 — 상세 페이지가 slug 로 만들어진다 (소식과 같은 충돌 위험). */
export const completeResources = (items: Resource[]): Resource[] =>
  keepComplete("Resources", items, (r) => r.title_ko || r.title, [
    { field: "title", filled: (r) => text(r.title) || text(r.title_ko) },
    { field: "slug", filled: (r) => text(r.slug) },
  ]);

/** 연구 분야 — 제목만. 상세 라우트가 없어 slug 는 필요 없다. */
export const completeResearch = (items: ResearchArea[]): ResearchArea[] =>
  keepComplete("Research", items, (r) => r.title_ko || r.title, [
    { field: "title", filled: (r) => text(r.title) || text(r.title_ko) },
  ]);

/** 연구 과제 — 제목만. 시작일이 없어도 목록 맨 아래로 밀리며 정상 처리된다. */
export const completeProjects = (items: ResearchProject[]): ResearchProject[] =>
  keepComplete("Projects", items, (p) => p.title_ko || p.title, [
    { field: "title", filled: (p) => text(p.title) || text(p.title_ko) },
  ]);
