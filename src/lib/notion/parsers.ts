/**
 * Notion 속성 추출 공통 함수.
 *
 * 페이지 컴포넌트는 이 함수들을 직접 쓰지 않는다. 속성명 → 내부 모델 변환은
 * schema 매핑 계층에서만 하고, 여기는 "Notion 응답 모양"만 다룬다.
 *
 * 모든 함수는 속성이 없거나 비어 있어도 오류를 내지 않는다 (빈 값으로 처리).
 */
import type { NotionPage } from "./client";

const raw = (page: NotionPage, name: string): any =>
  page.properties?.[name] ?? undefined;

const joinPlain = (arr: any): string =>
  Array.isArray(arr) ? arr.map((t) => t?.plain_text ?? "").join("").trim() : "";

/** title / rich_text → 평문. 그 외 타입이면 빈 문자열. */
export function text(page: NotionPage, name: string): string {
  const p = raw(page, name);
  if (!p) return "";
  if (p.type === "title") return joinPlain(p.title);
  if (p.type === "rich_text") return joinPlain(p.rich_text);
  return "";
}

export function num(page: NotionPage, name: string): number | null {
  const p = raw(page, name);
  return typeof p?.number === "number" ? p.number : null;
}

export function bool(page: NotionPage, name: string): boolean {
  return raw(page, name)?.checkbox === true;
}

/** select 와 status 를 모두 받는다. */
export function select(page: NotionPage, name: string): string | null {
  const p = raw(page, name);
  return p?.select?.name ?? p?.status?.name ?? null;
}

export function multiSelect(page: NotionPage, name: string): string[] {
  const p = raw(page, name);
  return Array.isArray(p?.multi_select)
    ? p.multi_select.map((o: any) => o?.name).filter(Boolean)
    : [];
}

/** 날짜 시작값 (YYYY-MM-DD 또는 ISO). 없으면 null. */
export function date(page: NotionPage, name: string): string | null {
  return raw(page, name)?.date?.start ?? null;
}

/** 날짜 종료값. 기간이 아니면 null. */
export function dateEnd(page: NotionPage, name: string): string | null {
  return raw(page, name)?.date?.end ?? null;
}

export function url(page: NotionPage, name: string): string | null {
  const v = raw(page, name)?.url;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function email(page: NotionPage, name: string): string | null {
  const v = raw(page, name)?.email;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export interface NotionFile {
  name: string;
  url: string;
  /** Notion 업로드 파일은 서명 URL이라 약 1시간 후 만료된다. external 링크는 영구. */
  expiring: boolean;
}

/**
 * files 속성 → 파일 목록.
 * 주의: type === "file" 인 항목의 URL 은 만료된다. 정적 HTML 에 그대로 박으면
 * 배포 후 얼마 지나 이미지가 깨진다 (빌드 시 내려받아 public/ 로 옮기는 처리가 필요).
 */
export function files(page: NotionPage, name: string): NotionFile[] {
  const p = raw(page, name);
  if (!Array.isArray(p?.files)) return [];
  return p.files
    .map((f: any) => {
      const link = f?.type === "external" ? f.external?.url : f?.file?.url;
      if (!link) return null;
      return {
        name: f?.name ?? "",
        url: link as string,
        expiring: f?.type !== "external",
      };
    })
    .filter(Boolean) as NotionFile[];
}

/** formula 결과를 원래 타입으로 돌려준다. date 는 start 문자열. */
export function formula(
  page: NotionPage,
  name: string,
): string | number | boolean | null {
  const f = raw(page, name)?.formula;
  if (!f) return null;
  if (f.type === "string") return f.string ?? null;
  if (f.type === "number") return typeof f.number === "number" ? f.number : null;
  if (f.type === "boolean") return f.boolean ?? null;
  if (f.type === "date") return f.date?.start ?? null;
  return null;
}

/** relation → 연결된 페이지 ID 목록. 화면에 그대로 쓰지 말고 대상 조회 후 변환한다. */
export function relationIds(page: NotionPage, name: string): string[] {
  const p = raw(page, name);
  return Array.isArray(p?.relation)
    ? p.relation.map((r: any) => r?.id).filter(Boolean)
    : [];
}

/** 속성 존재 여부 (스키마 검사기에서 사용). */
export function hasProp(page: NotionPage, name: string): boolean {
  return raw(page, name) !== undefined;
}

/** 속성의 Notion 타입 문자열 (스키마 검사기에서 사용). */
export function propType(page: NotionPage, name: string): string | null {
  return raw(page, name)?.type ?? null;
}
