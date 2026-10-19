/**
 * 컬렉션별 내용 점검 — **전부 경고이고 빌드를 멈추지 않는다.**
 *
 * 불완전한 외부 데이터가 빌드를 깨뜨리면 안 된다는 원칙(CLAUDE.md 15번)의 "경고" 쪽.
 * 항목을 걸러 내는 쪽은 required-fields.ts, Slug 범용 검증은 validate.ts.
 */
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

/**
 * 연구 분야 행 점검. **전부 경고이고 빌드를 멈추지 않는다.**
 *
 *  - 공개됐는데 Slug 없음 → 상세 페이지를 만들 수 없다 (요구사항상 치명적)
 *  - 공개됐는데 Description·Description_ko 둘 다 없음 → 상세 페이지 본문이 빈다
 *  - Slug 중복 → 둘 중 하나만 상세 페이지가 생긴다 (정적 경로 충돌 방지로 걸러진다)
 *  - Slug 가 예약어와 겹침 → `/research/publications` 경로와 부딪친다.
 *    예전에 News 의 빈 Slug 가 목록 경로와 충돌해 빌드를 죽인 적이 있어 넣었다.
 *
 * 미공개 행은 상세 페이지를 만들지 않으므로 점검하지 않는다.
 */
const RESERVED_RESEARCH_SLUGS = ["publications"];

export function checkResearchAreas(
  areas: {
    slug: string;
    title: string;
    title_ko: string;
    summary: string;
    summary_ko: string;
    category: string;
    publish: boolean;
  }[],
): void {
  const label = (a: { title: string; title_ko: string }) => a.title_ko || a.title || "(제목 없음)";
  const seen = new Map<string, number>();

  for (const a of areas) {
    if (!a.publish) continue;
    if (!a.slug.trim()) {
      console.warn(
        `[warn] research '${label(a)}': 공개됐는데 Slug 가 없어 상세 페이지를 만들 수 없습니다.`,
      );
    } else {
      const s = a.slug.trim();
      seen.set(s, (seen.get(s) ?? 0) + 1);
      if (RESERVED_RESEARCH_SLUGS.includes(s)) {
        console.warn(
          `[warn] research '${label(a)}': Slug "${s}" 는 이미 쓰이는 경로와 겹칩니다. ` +
            `다른 값으로 바꿔 주세요.`,
        );
      }
    }
    if (!a.summary.trim() && !a.summary_ko.trim()) {
      console.warn(
        `[warn] research '${label(a)}': 공개됐는데 Description 이 양쪽 언어 모두 비어 ` +
          `상세 페이지 본문이 빕니다.`,
      );
    }
  }

  for (const [slug, n] of seen) {
    if (n > 1) {
      console.warn(
        `[warn] research: Slug "${slug}" 가 ${n}건 겹칩니다 → 하나만 상세 페이지가 생깁니다.`,
      );
    }
  }
}
