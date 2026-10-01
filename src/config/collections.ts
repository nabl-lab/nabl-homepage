/**
 * 콘텐츠 종류(= Notion 데이터베이스)의 **방문자용 이름** — 한 곳에서만 관리한다.
 *
 * 여기 적는 라벨은 **사이트 방문자에게 보여 줄 이름**이다. Notion 쪽 DB 이름
 * ("이모지 + 한글 (English)" 형식)과 **일부러 다를 수 있다.** 화면에서는 메뉴 흐름상
 * 더 자연스러운 말이 필요하기 때문이다. 아래 표의 주석에 다른 곳을 표시해 두었다.
 * Notion DB 이름을 바꿔도 코드는 영향받지 않으므로, 이 표만 고치면 된다.
 *
 * key 는 src/config/notion.ts 의 NotionCollection 과 같은 값을 쓴다 (어휘를 하나로 유지).
 *
 * 주의: 여기 있는 건 **DB(콘텐츠 종류) 이름**이다. Notion 속성(열) 이름은
 * src/lib/notion/schema-*.ts 담당이고 서로 무관하다.
 *
 * 이모지: 각 항목의 emoji 는 Notion DB 아이콘과 맞춘 참고용이고
 * **홈페이지에는 표시하지 않는다** (아래 스위치가 둘 다 false).
 */
import type { Locale } from "../i18n/ui";
import type { NotionCollection } from "./notion";

/**
 * 이모지 표시 스위치 — **현재 둘 다 꺼져 있다. 홈페이지에는 이모지가 나오지 않는다.**
 *
 * 켜고 싶으면 여기만 true 로 바꾸면 된다. 아래 emoji 필드는 그대로 남아 있다.
 */

/** 헤더 메뉴(데스크톱·모바일·드롭다운)에 이모지를 붙일지. */
export const SHOW_EMOJI_NAV = false;

/** 제목류 — 브라우저 탭 제목(`<title>`), 페이지 제목(`<h1>`), 섹션 제목 — 에 이모지를 붙일지. */
export const SHOW_EMOJI_HEADING = false;

/** 라벨을 쓰는 자리. 자리에 따라 이모지 표시 여부가 다르다. */
export type LabelPlace = "nav" | "heading";

export interface CollectionLabel {
  key: NotionCollection;
  /**
   * Notion DB 아이콘과 맞춘 **참고용** 값. 홈페이지에는 표시하지 않는다.
   * (위의 SHOW_EMOJI_NAV / SHOW_EMOJI_HEADING 가 둘 다 false 이기 때문)
   * Notion 쪽 DB 를 찾을 때 눈으로 대조하는 데 쓰고, 지우지 않고 남겨 둔다.
   */
  emoji: string;
  label_ko: string;
  label_en: string;
}

export const COLLECTIONS: Record<NotionCollection, CollectionLabel> = {
  members: {
    key: "members",
    emoji: "👤",
    label_ko: "연구원",
    label_en: "Members",
  },
  publications: {
    key: "publications",
    emoji: "📄",
    label_ko: "논문",
    label_en: "Publications",
  },
  patents: {
    key: "patents",
    emoji: "🧾",
    label_ko: "특허",
    label_en: "Patents",
  },
  awards: { key: "awards", emoji: "🏆", label_ko: "수상", label_en: "Awards" },
  research: {
    // Notion DB 이름은 "연구 분야 (Research)" 지만, 영문 상위 메뉴가 이미 "Research"
    // 라서 그대로 쓰면 메뉴에 Research 가 두 번 나온다. 그래서 "Research Areas".
    key: "research",
    emoji: "🧪",
    label_ko: "연구 분야",
    label_en: "Research Areas",
  },
  projects: {
    key: "projects",
    emoji: "💼",
    label_ko: "연구 과제",
    label_en: "Projects",
  },
  news: { key: "news", emoji: "📰", label_ko: "소식", label_en: "News" },
  resources: {
    key: "resources",
    emoji: "📂",
    label_ko: "공개 자료",
    label_en: "Resources",
  },
  piProfile: {
    // Notion DB 이름은 "지도교수 이력 (PI Profile)" 이다. 그건 DB가 담는 *이력 항목*을
    // 가리키는 말이라 메뉴 이름으로는 어색해서, 방문자에게는 사람을 가리키는 말로 보여 준다.
    key: "piProfile",
    emoji: "👨‍🏫",
    label_ko: "지도교수",
    label_en: "Principal Investigator",
  },
};

/**
 * 콘텐츠 종류의 화면 라벨.
 *
 * @param place "nav" = 헤더 메뉴, "heading" = 제목류(기본값).
 *              이모지 표시는 위의 SHOW_EMOJI_NAV / SHOW_EMOJI_HEADING 가 결정한다.
 *              지금은 둘 다 false 라서 어느 쪽이든 이름만 돌려준다.
 */
export function collectionLabel(
  key: NotionCollection,
  lang: Locale,
  place: LabelPlace = "heading",
): string {
  const c = COLLECTIONS[key];
  const name = lang === "ko" ? c.label_ko : c.label_en;
  const withEmoji = place === "nav" ? SHOW_EMOJI_NAV : SHOW_EMOJI_HEADING;
  return withEmoji && c.emoji ? `${c.emoji} ${name}` : name;
}
