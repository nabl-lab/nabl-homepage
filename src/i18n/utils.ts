/**
 * i18n 라우팅 유틸리티.
 *
 * - 지원 언어와 기본 언어를 한곳에서 정의한다.
 * - 모든 `[lang]` 페이지는 `localePaths` 로 정적 경로를 생성한다.
 * - UI 문구는 `ui.ts` 사전을 통해서만 가져온다 (`useTranslations`).
 */
import { ui, DEFAULT_LOCALE, type Locale, type UiKey } from "./ui";

export { DEFAULT_LOCALE };
export type { Locale, UiKey };

/** 지원하는 로케일 목록. 순서는 언어 전환 버튼 노출 순서이기도 하다. */
export const LOCALES: Locale[] = ["en", "ko"];

/** `[lang]` 동적 경로용 getStaticPaths. 각 언어마다 한 번씩 페이지를 생성한다. */
export function localePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

/** 현재 로케일에 맞는 번역 함수 t 를 돌려준다. 키가 없으면 기본 언어로 폴백. */
export function useTranslations(lang: Locale) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** `/about` 같은 경로 앞에 현재 언어 접두사를 붙인다. 빈 문자열이면 언어 홈(`/ko/`). */
export function withLocale(lang: Locale, path = ""): string {
  const clean = path && !path.startsWith("/") ? `/${path}` : path;
  return `/${lang}${clean || "/"}`;
}

/**
 * 현재 경로에서 언어 접두사만 target 으로 바꾼 경로를 돌려준다.
 * 언어 전환 버튼이 "같은 페이지의 다른 언어 버전" 으로 이동하는 데 쓴다.
 * 예) switchLocalePath("/ko/members/alumni", "en") → "/en/members/alumni"
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const replaced = pathname.replace(/^\/(en|ko)(?=\/|$)/, `/${target}`);
  return replaced === pathname ? `/${target}/` : replaced;
}

/** 경로 문자열에서 현재 로케일을 읽는다. 못 찾으면 기본 언어. */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  return (LOCALES as string[]).includes(seg) ? (seg as Locale) : DEFAULT_LOCALE;
}
