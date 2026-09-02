/**
 * UI 문구 사전의 진입점.
 *
 * 실제 문구는 언어별 파일(`en.ts`, `ko.ts`)에 있다. 이 파일은 그 둘을 묶고,
 * 키 집합이 두 언어에서 일치하도록 타입으로 강제한다.
 * 새 문구가 필요하면 `en.ts` 와 `ko.ts` 에 **같은 키**로 추가한다.
 */
import en from "./en";
import ko from "./ko";

export const DEFAULT_LOCALE = "en" as const;
export type Locale = "en" | "ko";

/** ui 사전에서 쓸 수 있는 키 (en 기준). ko 에 빠진 키가 있으면 아래 ui 선언에서 타입 에러. */
export type UiKey = keyof typeof en;

export const ui: Record<Locale, Record<UiKey, string>> = { en, ko };

/**
 * data 의 position 값 → ui 문구 키 매핑.
 * 여기 없는 직책(나중에 추가될 수 있음)은 호출부에서 원문을 그대로 쓴다.
 */
export const POSITION_LABEL_KEY: Record<string, UiKey> = {
  "Principal Investigator": "position.pi",
  "Research Professor": "position.researchProfessor",
  "Ph.D. Course": "position.phd",
  "M.S.-Ph.D. Integrated": "position.msphd",
  "M.S. Course": "position.ms",
  "Undergraduate Researcher": "position.undergrad",
};
