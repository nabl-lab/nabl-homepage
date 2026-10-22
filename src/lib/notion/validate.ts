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
 * 제목이 비어 **매퍼가 버린** 행을 알린다. 경고이고 빌드를 멈추지 않는다.
 *
 * 매퍼는 title 이 양쪽 언어 모두 비면 null 을 돌려 그 행을 건너뛴다. 사이트가 깨지지
 * 않게 하려는 규칙이지만, 그동안 **로그가 전혀 남지 않아** 운영자는 왜 항목이 안 보이는지
 * 알 수 없었다. 그래서 건너뛴 사실을 여기서 남긴다.
 *
 * @param hints      어느 행인지 알아볼 단서 (Slug·날짜·page id). 제목이 없으니 이름을 쓸 수 없다.
 * @param fieldLabel 빠진 속성 이름. 컬렉션마다 다르다 (Members 는 `이름`, PI Profile 은 Content…).
 */
export function checkTitlelessRows(
  label: string,
  hints: string[],
  fieldLabel: string,
): void {
  if (hints.length === 0) return;
  console.warn(
    `[skip] ${label}: ${fieldLabel} 이(가) 비어 제외된 항목 ${hints.length}건 ` +
      `→ ${hints.join(", ")}. Notion 에서 채워 주세요.`,
  );
}
