/**
 * 빌드 시 내려받은 Notion 이미지의 로컬 경로 조회.
 *
 * `scripts/fetch-notion-assets.mjs` 가 prebuild 단계에서 이미지를 public/notion/ 으로
 * 내려받고 manifest.json(page id → 로컬 경로)을 남긴다. 매퍼는 그 경로만 쓴다.
 * (Notion 서명 URL 은 약 1시간 뒤 만료되므로 HTML 에 직접 넣지 않는다)
 *
 * manifest 가 없으면 빈 맵으로 동작한다 → 사진 자리는 플레이스홀더가 나온다.
 */
import fs from "node:fs";

const MANIFEST_PATH = "public/notion/manifest.json";

let manifest: Record<string, string> = {};
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
} catch {
  // 토큰 없이 빌드했거나 아직 내려받지 않은 상태 — 정상이다.
}

/** 해당 Notion 페이지의 이미지 로컬 경로. 없으면 undefined. */
export function assetPath(pageId: string): string | undefined {
  return manifest[pageId];
}
