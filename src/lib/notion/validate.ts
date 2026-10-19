/**
 * 빌드 단계 데이터 검증 — 경고만 남기고 빌드를 멈추지는 않는다.
 *
 * 잘못된 Slug 하나 때문에 사이트 전체가 배포되지 않는 상황을 막되,
 * 빌드 로그에서는 분명히 보이게 한다. (운영자가 Notion 에서 고칠 수 있도록)
 */

/** 소문자·숫자·하이픈만. 앞뒤/연속 하이픈 불가. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface SlugEntry {
  slug: string;
  /** 로그에 사람이 알아볼 수 있게 찍을 이름 */
  label: string;
}

/**
 * Slug 형식·중복·누락을 검사해 빌드 로그에 경고한다.
 *
 * 빈 Slug 는 "상세 페이지를 만들지 않는다"는 정상 상태이므로 건수만 알린다.
 * 형식 위반과 중복은 경고로 올린다.
 */
export function checkSlugs(label: string, entries: SlugEntry[]): void {
  const filled = entries.filter((e) => e.slug.trim() !== "");
  const empty = entries.length - filled.length;

  const invalid = filled.filter((e) => !SLUG_PATTERN.test(e.slug));

  const seen = new Map<string, string[]>();
  for (const e of filled) {
    const list = seen.get(e.slug) ?? [];
    list.push(e.label);
    seen.set(e.slug, list);
  }
  const dupes = [...seen.entries()].filter(([, names]) => names.length > 1);

  if (empty > 0) {
    console.log(
      `[notion] ${label}: Slug 없는 항목 ${empty}건 → 상세 페이지를 만들지 않습니다 (목록에는 표시됨)`,
    );
  }
  for (const e of invalid) {
    console.warn(
      `[notion] 경고 ${label}: Slug 형식 위반 "${e.slug}" (${e.label}) — 소문자·숫자·하이픈만 사용하세요`,
    );
  }
  for (const [slug, names] of dupes) {
    console.warn(
      `[notion] 경고 ${label}: Slug 중복 "${slug}" — ${names.join(", ")} (상세 페이지가 하나만 생성됩니다)`,
    );
  }
}

/**
 * 상세 페이지를 만들 수 있는 항목만 추린다.
 * Slug 가 비었거나 이미 쓰인 항목은 제외한다 (정적 경로 충돌 방지).
 */
export function withUniqueSlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const s = item.slug.trim();
    if (!s || seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}

/**
 * 연구 과제의 Start_date 누락을 알린다.
 *
 * Start_date 가 비면 정렬 기준이 없어 목록 맨 아래로 밀리고 기간 줄도 나오지 않는다.
 * 운영자가 Notion 에서 채울 수 있도록 건수를 빌드 로그에 남긴다.
 * (빌드를 멈추지는 않는다)
 */
export function checkProjectDates(
  projects: { startDate: string | null; title: string; title_ko: string }[],
): void {
  const missing = projects.filter((p) => !p.startDate);
  if (missing.length === 0) return;
  console.log(
    `[notion] projects: Start_date 없는 과제 ${missing.length}건 → 목록 맨 아래로 밀리고 기간이 표시되지 않습니다. ` +
      `Notion 에서 Start_date 를 채워 주세요.`,
  );
  for (const p of missing.slice(0, 10)) {
    console.log(`           - ${p.title_ko || p.title}`);
  }
  if (missing.length > 10) console.log(`           … 외 ${missing.length - 10}건`);
}

/** 구성원에게 붙어야 하는 Research 분류. 다른 값(Scope)이면 경고한다. */
const THEME_CATEGORY = "Theme";
/**
 * 구성원의 연구 분야 관계를 점검한다. **전부 경고이고 빌드를 멈추지 않는다.**
 *
 *  - 공개 구성원인데 관계가 비어 있음 → 운영자가 Notion 에서 연결해야 한다
 *  - 관계가 `Category=Scope` 행을 가리킴 → 구성원에게는 Theme 행만 붙여야 한다
 *  - 관계 대상 행에 Slug 가 없음 → 상세 링크를 만들 수 없다 (이름만 표시된다)
 *
 * 미공개(`Publish` 미체크) 행이 붙어 있는 것은 **정상**이라 경고하지 않는다
 * (공개 전에도 이름은 보여 주고 링크만 걸지 않는다).
 */
export function checkMemberResearchAreas(
  members: {
    name: string;
    name_ko: string;
    researchAreas: {
      title: string;
      title_ko: string;
      slug: string;
      category: string;
    }[];
  }[],
): void {
  const empty: string[] = [];
  const noSlug: string[] = [];
  const scope: string[] = [];

  for (const m of members) {
    const who = m.name_ko || m.name || "(이름 없음)";
    if (m.researchAreas.length === 0) {
      empty.push(who);
      continue;
    }
    for (const a of m.researchAreas) {
      const label = a.title_ko || a.title || "(제목 없음)";
      if (!a.slug.trim()) noSlug.push(`${who} → ${label}`);
      // category 가 빈 값인 경우(전환기 다중선택 폴백)는 판단하지 않는다.
      if (a.category && a.category !== THEME_CATEGORY) scope.push(`${who} → ${label}`);
    }
  }

  if (empty.length > 0) {
    console.warn(
      `[warn] members: 연구 분야가 연결되지 않은 공개 구성원 ${empty.length}명 ` +
        `→ ${empty.join(", ")}. Notion 의 \`연구 분야 (Research)\` 에 연결해 주세요.`,
    );
  }
  for (const s of scope) {
    console.warn(
      `[warn] members: ${s} — Category 가 ${THEME_CATEGORY} 가 아닌 행(Scope)이 연결됐습니다. ` +
        `구성원에게는 Theme 행만 연결해 주세요.`,
    );
  }
  for (const s of noSlug) {
    console.warn(
      `[warn] members: ${s} — 연결된 연구 분야에 Slug 가 없어 상세 링크를 만들 수 없습니다 ` +
        `(이름만 표시됩니다).`,
    );
  }
}
