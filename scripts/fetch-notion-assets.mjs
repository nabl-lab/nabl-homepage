/**
 * Notion 이미지 내려받기 — 빌드 전에 실행된다 (npm 의 prebuild 훅).
 *
 * 왜 필요한가: Notion 에 업로드한 파일의 URL 은 **약 1시간 뒤 만료되는 서명 URL**이다.
 * 정적 HTML 에 그대로 박으면 배포 몇 시간 뒤 이미지가 전부 깨진다.
 * 그래서 빌드 시점에 public/notion/ 으로 내려받고, 사이트는 로컬 경로를 쓴다.
 *
 * 규칙
 *  - NOTION_TOKEN 이 없으면 조용히 skip (빌드는 계속 진행)
 *  - 개별 파일 실패는 경고만 남기고 계속 → 사이트는 플레이스홀더로 폴백
 *  - resources 의 `File`(PDF·PPT 등 대용량)은 **내려받지 않는다** (External_url 로 노출)
 *  - 받은 파일과 manifest 는 .gitignore 로 저장소에서 제외
 */
import fs from "node:fs/promises";
import path from "node:path";

const VERSION = "2026-03-11";
const BASE = "https://api.notion.com/v1";
const OUT_DIR = "public/notion";
const TOKEN = process.env.NOTION_TOKEN?.trim();

// 속성명은 src/lib/notion/schema-*.ts 와 일치해야 한다.
// resources 는 Thumbnail 만 받고 File 은 제외한다.
const TARGETS = [
  { name: "members", env: "NOTION_MEMBERS_DATA_SOURCE_ID", prop: "프로필 사진" },
  { name: "research", env: "NOTION_RESEARCH_DATA_SOURCE_ID", prop: "Image" },
  { name: "news", env: "NOTION_NEWS_DATA_SOURCE_ID", prop: "Cover" },
  { name: "resources", env: "NOTION_RESOURCES_DATA_SOURCE_ID", prop: "Thumbnail" },
];

if (!TOKEN) {
  console.log("[assets] NOTION_TOKEN 없음 → 이미지 내려받기 skip (플레이스홀더 사용)");
  process.exit(0);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Notion-Version": VERSION,
  "Content-Type": "application/json",
};

async function queryRows(dsId) {
  const rows = [];
  let cursor = null;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${BASE}/data_sources/${dsId}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    rows.push(...json.results);
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);
  return rows;
}

/** files 속성의 첫 파일 URL. 없으면 null. */
function firstFileUrl(page, prop) {
  const p = page.properties?.[prop];
  const f = Array.isArray(p?.files) ? p.files[0] : null;
  if (!f) return null;
  return f.type === "external" ? (f.external?.url ?? null) : (f.file?.url ?? null);
}

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

const manifest = {};
let ok = 0;
let failed = 0;
let skipped = 0;

for (const target of TARGETS) {
  const dsId = process.env[target.env]?.trim();
  if (!dsId) {
    console.log(`[assets] ${target.name}: ${target.env} 없음 → skip`);
    continue;
  }

  let rows;
  try {
    rows = await queryRows(dsId);
  } catch (e) {
    // DB 하나를 못 읽어도 전체 빌드를 막지 않는다.
    console.warn(`[assets] 경고 ${target.name}: 조회 실패 (${e.message}) → skip`);
    continue;
  }

  await fs.mkdir(path.join(OUT_DIR, target.name), { recursive: true });

  for (const row of rows) {
    const url = firstFileUrl(row, target.prop);
    if (!url) {
      skipped++;
      continue;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const mime = res.headers.get("content-type")?.split(";")[0] ?? "";
      const ext =
        EXT_BY_TYPE[mime] ?? (path.extname(new URL(url).pathname) || ".jpg");
      const rel = `${target.name}/${row.id}${ext}`;
      await fs.writeFile(
        path.join(OUT_DIR, rel),
        Buffer.from(await res.arrayBuffer()),
      );
      manifest[row.id] = `/notion/${rel}`;
      ok++;
    } catch (e) {
      // 파일 하나 때문에 빌드를 죽이지 않는다.
      console.warn(
        `[assets] 경고 ${target.name}: 내려받기 실패 (${e.message}) → 플레이스홀더 사용`,
      );
      failed++;
    }
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(
  path.join(OUT_DIR, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);

console.log(
  `[assets] 완료 — 내려받음 ${ok}건 / 실패 ${failed}건 / 파일 없음 ${skipped}건`,
);
