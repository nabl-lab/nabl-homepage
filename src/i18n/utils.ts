/**
 * i18n 라우팅 유틸리티.
 *
 * - 지원 언어와 기본 언어를 한곳에서 정의한다.
 * - 모든 `[...lang]` 페이지는 `localePaths` 로 정적 경로를 생성하고,
 *   `pageLocale(Astro.params.lang)` 으로 언어를 읽는다.
 * - URL 규칙(영어 = 접두어 없음, 한국어 = /ko/)은 paths.ts 한 곳에 있다.
 * - UI 문구는 `ui.ts` 사전을 통해서만 가져온다 (`useTranslations`).
 */
import { ui, DEFAULT_LOCALE, type Locale, type UiKey } from "./ui";

export { DEFAULT_LOCALE };
export type { Locale, UiKey };

export {
  LOCALES,
  langParam,
  localePaths,
  pageLocale,
  withLocale,
  stripLocale,
  switchLocalePath,
  localeFromPath,
} from "./paths";

// Notion 선택지 값 → 화면 라벨. 매핑에 없으면 원문을 그대로 쓴다.
export { optionLabel, type OptionSet } from "./options";

/** 현재 로케일에 맞는 번역 함수 t 를 돌려준다. 키가 없으면 기본 언어로 폴백. */
export function useTranslations(lang: Locale) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[DEFAULT_LOCALE][key];
  };
}
