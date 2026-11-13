/**
 * 언어별 URL 규칙 — **경로를 만드는 규칙은 이 파일 하나에만 둔다.**
 *
 *   영어(기본 언어) = 접두어 없음   /  /members/  /research/publications/
 *   한국어          = /ko/ 접두어   /ko/  /ko/members/  /ko/research/publications/
 *
 * 페이지 폴더는 `src/pages/[...lang]/` 이다. rest 파라미터라서 값이 비면(undefined)
 * 루트에 생성된다 — 영어는 lang 이 비고, 한국어만 lang="ko" 를 받는다 (langParam).
 * 예전 `/en/...` 주소는 public/_redirects 가 접두어 없는 주소로 301 이동시킨다.
 *
 * 이 파일은 다른 모듈을 import 하지 않는다 — npm test 가 그대로 불러와 검사한다
 * (tests/i18n-paths.test.ts).
 */

export type Locale = "en" | "ko";

/** 기본 언어. URL 에 접두어가 붙지 않는다. */
export const DEFAULT_LOCALE = "en" as const;

/** 지원하는 로케일 목록. 순서는 언어 전환 버튼 노출 순서이기도 하다. */
export const LOCALES: Locale[] = ["en", "ko"];

/** `[...lang]` 에 넣을 값. 기본 언어는 undefined → 접두어 없는 경로가 된다. */
export function langParam(lang: Locale): string | undefined {
  return lang === DEFAULT_LOCALE ? undefined : lang;
}

/** `[...lang]` 페이지용 getStaticPaths. 각 언어마다 한 번씩 페이지를 생성한다. */
export function localePaths() {
  return LOCALES.map((lang) => ({ params: { lang: langParam(lang) } }));
}

/** 페이지의 `Astro.params.lang` → 로케일. 비어 있으면 기본 언어. */
export function pageLocale(param: string | undefined): Locale {
  return (LOCALES as string[]).includes(param ?? "") ? (param as Locale) : DEFAULT_LOCALE;
}

/** `/about` 같은 경로를 그 언어의 주소로. 빈 문자열이면 언어 홈 (`/` 또는 `/ko/`). */
export function withLocale(lang: Locale, path = ""): string {
  const clean = path && !path.startsWith("/") ? `/${path}` : path;
  const prefix = lang === DEFAULT_LOCALE ? "" : `/${lang}`;
  return `${prefix}${clean || "/"}`;
}

/** 경로 앞의 언어 접두어를 떼어 낸다. 예전 `/en/…` 주소도 같이 처리한다. */
export function stripLocale(pathname: string): string {
  const rest = pathname.replace(/^\/(en|ko)(?=\/|$)/, "");
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/**
 * 현재 경로의 다른 언어 버전. 언어 전환 버튼과 hreflang 이 쓴다 (홈으로 튕기지 않는다).
 * 예) switchLocalePath("/ko/members/alumni", "en") → "/members/alumni"
 *     switchLocalePath("/members/alumni", "ko")    → "/ko/members/alumni"
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  return withLocale(target, stripLocale(pathname));
}

/** 경로에서 현재 로케일을 읽는다. `/ko` 로 시작하면 한국어, 그 밖은 기본 언어. */
export function localeFromPath(pathname: string): Locale {
  return /^\/ko(?=\/|$)/.test(pathname) ? "ko" : DEFAULT_LOCALE;
}
