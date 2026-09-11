/**
 * Notion REST API 클라이언트 — 읽기 전용.
 *
 * 의존성 없이 fetch 만 쓴다. 빌드 타임에만 호출되며 브라우저에서는 실행되지 않는다.
 * 조회는 database 가 아니라 data source 단위다: POST /v1/data_sources/{id}/query
 */
import {
  NOTION_API_BASE,
  NOTION_API_VERSION,
  NOTION_TOKEN,
  dataSourceId,
  type NotionCollection,
} from "../../config/notion";

/** Notion 페이지(= DB 한 행). properties 의 실제 키는 DB 스키마에 따라 다르다. */
export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  cover?: unknown;
  icon?: unknown;
  last_edited_time?: string;
}

interface QueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

const MAX_RETRIES = 2;
const PAGE_SIZE = 100;

/** 일시적 오류(429·5xx)만 재시도한다. */
function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function postQuery(
  id: string,
  cursor: string | null,
  label: string,
): Promise<QueryResponse> {
  const body: Record<string, unknown> = { page_size: PAGE_SIZE };
  if (cursor) body.start_cursor = cursor;

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${NOTION_API_BASE}/data_sources/${id}/query`, {
      method: "POST",
      headers: {
        // 토큰은 헤더로만 전달하고 어디에도 기록하지 않는다.
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return (await res.json()) as QueryResponse;

    if (isRetryable(res.status) && attempt < MAX_RETRIES) {
      await sleep(500 * 2 ** attempt);
      continue;
    }

    // 오류 메시지에 토큰과 전체 응답 원문은 넣지 않는다.
    let code = "";
    try {
      code = ((await res.json()) as { code?: string }).code ?? "";
    } catch {
      /* 본문 파싱 실패는 무시 */
    }
    throw new Error(
      `Notion 조회 실패 [${label}] HTTP ${res.status}${code ? ` (${code})` : ""}. ` +
        `토큰 권한과 해당 데이터베이스의 연결(Connections) 설정을 확인하세요.`,
    );
  }
}

/**
 * 한 데이터 소스의 모든 행을 가져온다 (페이지네이션 전부 순회).
 * 데이터 소스 ID가 설정돼 있지 않으면 null 을 돌려준다 → 호출부에서 JSON 폴백.
 *
 * 오류가 나면 throw 해서 빌드를 실패시킨다. 정적 사이트이므로 빌드가 실패하면
 * Netlify 는 직전 정상 배포를 계속 서빙한다 (= 사이트가 빈 화면이 되지 않는다).
 */
export async function queryAllRows(
  collection: NotionCollection,
): Promise<NotionPage[] | null> {
  if (!NOTION_TOKEN) return null;
  const id = dataSourceId(collection);
  if (!id) return null;

  const rows: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const page = await postQuery(id, cursor, collection);
    rows.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);

  return rows;
}
