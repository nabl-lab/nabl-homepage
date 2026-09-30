/**
 * 헤더 네비게이션 정의 — **메뉴 구조는 이 파일 하나에서만 관리한다.**
 *
 * 메뉴를 추가·삭제·재배치하려면 아래 `NAV` 배열만 고치면 된다.
 * 문구는 여기 두지 않는다. Notion 콘텐츠 종류는 `collection`(→ config/collections.ts),
 * 그 밖의 항목은 `key`(→ ui.ts 사전)를 참조한다.
 * 헤더 컴포넌트(site-nav.astro / site-nav-mobile.astro)는 이 데이터를 읽어 렌더링만 한다.
 */
import { withLocale, type Locale } from "./utils";
import type { UiKey } from "./ui";
import { collectionLabel } from "../config/collections";
import type { NotionCollection } from "../config/notion";

export interface NavNode {
  /** 표시 문구의 ui 키. collection 을 주면 생략한다. */
  key?: UiKey;
  /** Notion 콘텐츠 종류. 주면 collections.ts 의 라벨을 쓴다 (key 보다 우선). */
  collection?: NotionCollection;
  /** 언어 접두사 없는 경로. `#앵커` 포함 가능. withLocale 로 /en·/ko 를 붙인다. */
  path: string;
  /** 활성 판정을 정확 일치로 (기본은 접두 일치). */
  exact?: boolean;
  /** 하위 메뉴 (없으면 단일 링크). */
  children?: NavNode[];
}

export const NAV: NavNode[] = [
  { key: "nav.home", path: "" },
  { key: "nav.about", path: "/about" },
  {
    collection: "members",
    path: "/members",
    children: [
      { collection: "piProfile", path: "/members/pi" },
      { key: "members.currentTitle", path: "/members", exact: true },
      { key: "alumni.title", path: "/members/alumni" },
    ],
  },
  {
    key: "nav.research",
    path: "/research",
    children: [
      { key: "nav.research.scope", path: "/research" },
      { collection: "research", path: "/research#themes" },
      { collection: "projects", path: "/research#projects" },
      { collection: "publications", path: "/research/publications" },
    ],
  },
  {
    key: "nav.achievements",
    path: "/achievements/patents",
    children: [
      { collection: "patents", path: "/achievements/patents" },
      { collection: "awards", path: "/achievements/awards" },
      { key: "nav.achievements.etc", path: "/achievements/etc" },
    ],
  },
  { collection: "news", path: "/news" },
  { key: "nav.contact", path: "/contact" },
];

/**
 * 메뉴 항목의 화면 라벨. collection 이 있으면 Notion DB 이름(collections.ts),
 * 없으면 ui 사전 키를 쓴다.
 */
export function navLabel(
  node: NavNode,
  lang: Locale,
  t: (key: UiKey) => string,
): string {
  if (node.collection) return collectionLabel(node.collection, lang, "nav");
  return node.key ? t(node.key) : "";
}

/**
 * 현재 경로가 이 노드에 해당하는지. 하위 페이지에 있으면 상위 노드도 활성으로 본다.
 * 앵커(`#`) 링크는 서버에서 구분할 수 없으므로 개별 활성 표시를 하지 않는다(상위만).
 */
export function isNavActive(pathname: string, lang: Locale, node: NavNode): boolean {
  if (node.path.includes("#")) return false;
  const here = pathname.replace(/\/$/, "");
  const target = withLocale(lang, node.path).replace(/\/$/, "");
  if (node.exact || node.path === "") return here === target;
  return here === target || here.startsWith(target + "/");
}
