/**
 * i18n 키 누락 검사 — 빌드 전에 실행된다 (npm 의 prebuild 훅).
 *
 * 누락된 키는 화면에 **빈칸**으로 조용히 렌더되므로 경고가 아니라 실패로 처리한다.
 *
 * 검사 항목
 *  1) 코드에서 쓰는 키가 en / ko 사전에 모두 있는지
 *  2) en 과 ko 의 키 집합이 서로 일치하는지
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const DICTS = {
  en: ["src/i18n/en-common.ts", "src/i18n/en-pages.ts"],
  ko: ["src/i18n/ko-common.ts", "src/i18n/ko-pages.ts"],
};

/** `"key": ...` 형태의 키를 긁어온다 (TS 로더 없이 동작하도록 정규식 사용). */
function keysOf(files) {
  const map = new Map(); // key → 정의된 파일
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/^\s*"([^"]+)":/gm)) map.set(m[1], file);
  }
  return map;
}

/** src 전체에서 t("키") 와 nav.ts 의 key: "키" 사용을 수집한다. */
function usedKeys(dir, found = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      usedKeys(p, found);
      continue;
    }
    if (!/\.(astro|ts)$/.test(entry.name)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const m of text.matchAll(/\bt\(\s*"([^"]+)"\s*\)/g)) {
      if (!found.has(m[1])) found.set(m[1], []);
      found.get(m[1]).push(p);
    }
    for (const m of text.matchAll(/key:\s*"([^"]+)"/g)) {
      if (!found.has(m[1])) found.set(m[1], []);
      found.get(m[1]).push(p);
    }
  }
  return found;
}

const en = keysOf(DICTS.en);
const ko = keysOf(DICTS.ko);
const used = usedKeys(SRC);
const errors = [];

// 1) 사용하는데 사전에 없는 키
for (const [key, files] of used) {
  const missingIn = [];
  if (!en.has(key)) missingIn.push("en (en-common.ts / en-pages.ts)");
  if (!ko.has(key)) missingIn.push("ko (ko-common.ts / ko-pages.ts)");
  if (missingIn.length) {
    errors.push(
      `키 "${key}" 가 ${missingIn.join(" 와 ")} 에 없습니다.\n` +
        `      사용 위치: ${[...new Set(files)].join(", ")}`,
    );
  }
}

// 2) 한쪽 언어에만 있는 키
for (const [key, file] of en) {
  if (!ko.has(key)) errors.push(`키 "${key}" 가 ko 사전에 없습니다. (en: ${file})`);
}
for (const [key, file] of ko) {
  if (!en.has(key)) errors.push(`키 "${key}" 가 en 사전에 없습니다. (ko: ${file})`);
}

if (errors.length) {
  console.error("\n[i18n] 키 검사 실패 — 빌드를 중단합니다.\n");
  for (const e of errors) console.error("  x " + e);
  console.error(
    "\n  해결: 위 키를 en/ko 양쪽 사전에 같은 이름으로 추가하세요." +
      "\n  (Notion 선택지 라벨은 사전이 아니라 src/i18n/options.ts 담당입니다)\n",
  );
  process.exit(1);
}

console.log(
  `[i18n] 키 검사 통과 — 사용 ${used.size}개 / 사전 ${en.size}개 (en·ko 일치)`,
);
