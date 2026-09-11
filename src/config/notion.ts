/**
 * Notion 연동 설정 — 토큰과 데이터 소스 ID를 환경변수에서 읽는 유일한 지점.
 *
 * 값 자체는 절대 여기에 쓰지 않는다 (.env / Netlify 환경변수에만 둔다).
 * 이 파일은 "어떤 키를 읽는가"만 정의한다.
 *
 * PUBLIC_ 접두사가 없으므로 이 값들은 빌드 타임에만 존재하고
 * 브라우저 번들에는 포함되지 않는다.
 */

/** Notion API 버전. 올릴 때는 이 한 줄만 고친다. */
export const NOTION_API_VERSION = "2026-03-11";

export const NOTION_API_BASE = "https://api.notion.com/v1";

/** 사이트가 쓰는 Notion 데이터 소스의 논리명 */
export type NotionCollection =
  | "members"
  | "research"
  | "projects"
  | "publications"
  | "patents"
  | "awards"
  | "news"
  | "resources"
  | "piProfile";

// Astro 는 import.meta.env 로 .env 값을 노출한다. 임의 키는 타입이 느슨하므로 좁혀서 쓴다.
const env = import.meta.env as unknown as Record<string, string | undefined>;

/** 논리명 → 환경변수 키. 키 이름을 바꾸려면 .env.example 과 함께 수정한다. */
export const DATA_SOURCE_ENV_KEY: Record<NotionCollection, string> = {
  members: "NOTION_MEMBERS_DATA_SOURCE_ID",
  research: "NOTION_RESEARCH_DATA_SOURCE_ID",
  projects: "NOTION_PROJECTS_DATA_SOURCE_ID",
  publications: "NOTION_PUBLICATIONS_DATA_SOURCE_ID",
  patents: "NOTION_PATENTS_DATA_SOURCE_ID",
  awards: "NOTION_AWARDS_DATA_SOURCE_ID",
  news: "NOTION_NEWS_DATA_SOURCE_ID",
  resources: "NOTION_RESOURCES_DATA_SOURCE_ID",
  piProfile: "NOTION_PI_PROFILE_DATA_SOURCE_ID",
};

export const NOTION_TOKEN = env.NOTION_TOKEN?.trim() || undefined;

/**
 * 토큰이 없으면 Notion 연동을 끄고 src/data 의 JSON 으로 동작한다.
 * (비밀값 없이도 로컬 개발·빌드가 되도록)
 */
export const notionEnabled = Boolean(NOTION_TOKEN);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 데이터 소스 ID를 읽어 형식을 검증한다.
 * MCP 내부 표기인 `collection://` 접두사가 섞여 들어오는 실수를 걸러낸다.
 * 설정되지 않았으면 null (호출부에서 JSON 폴백 또는 경고 처리).
 */
export function dataSourceId(collection: NotionCollection): string | null {
  const key = DATA_SOURCE_ENV_KEY[collection];
  const raw = env[key]?.trim();
  if (!raw) return null;

  if (raw.startsWith("collection://")) {
    throw new Error(
      `${key}: "collection://" 접두사는 쓸 수 없습니다. 접두사 없는 UUID 만 넣으세요.`,
    );
  }
  // 하이픈 없는 32자 형태도 허용해 하이픈을 넣어준다.
  const normalized =
    raw.length === 32 && /^[0-9a-f]{32}$/i.test(raw)
      ? `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`
      : raw;

  if (!UUID_RE.test(normalized)) {
    throw new Error(`${key}: Data Source ID 형식이 올바르지 않습니다 (UUID 필요).`);
  }
  return normalized;
}
