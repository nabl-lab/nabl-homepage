/**
 * UI 문구 사전의 진입점.
 *
 * 실제 문구는 언어별·역할별 파일에 나눠 있고 여기서 합친다.
 * 새 문구가 필요하면 en / ko 양쪽 같은 파일에 **같은 키**로 추가한다.
 *   - en-common.ts / ko-common.ts : 사이트 정체성·메뉴·접근성·공통 라벨·푸터
 *   - en-pages.ts  / ko-pages.ts  : 페이지별 문구
 *   - options.ts                  : Notion 선택지(select/status) 값 라벨
 *     (페이지 문구와 섞지 않는다. Notion 선택지가 바뀌면 그 파일만 본다)
 */
import enCommon from "./en-common";
import enPages from "./en-pages";
import koCommon from "./ko-common";
import koPages from "./ko-pages";

export const DEFAULT_LOCALE = "en" as const;
export type Locale = "en" | "ko";

const en = { ...enCommon, ...enPages };
const ko = { ...koCommon, ...koPages };

/** ui 사전에서 쓸 수 있는 키 (en 기준). ko 에 빠진 키가 있으면 아래 ui 선언에서 타입 에러. */
export type UiKey = keyof typeof en;

export const ui: Record<Locale, Record<UiKey, string>> = { en, ko };
