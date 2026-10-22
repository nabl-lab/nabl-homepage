/**
 * 제목이 비어 **매퍼가 버린 행**을 컬렉션별로 찾아 경고한다.
 *
 * 매퍼는 제목이 비면 null 을 돌려 그 행을 건너뛴다. 사이트가 깨지지 않게 하려는
 * 규칙이지만(CLAUDE.md 15번) 로그가 없으면 운영자는 왜 항목이 안 보이는지 알 수 없다.
 * 그래서 건너뛴 사실을 여기서 한곳에 모아 남긴다.
 *
 * ## 새 DB 를 붙일 때 (예: 개인 연구 Personal Research)
 * 아래 SPECS 에 한 줄 추가하고, query.ts 의 checkAllTitleless 인자에 행 배열만 넘기면
 * 끝이다. 경고 문구·판정 로직은 건드릴 필요가 없다.
 *
 * 각 spec 의 titleProps 는 **매퍼의 null 조건과 똑같이** 맞춰야 한다. 그러지 않으면
 * "빠졌다고 경고했는데 화면에는 있는" 거짓 경고가 난다.
 *
 * import 에 `.ts` 를 붙인 이유는 src/lib/projects.ts 주석 참고 (node --test 직접 실행).
 */
import type { NotionPage } from "./client";
import { text, date, bool } from "./parsers.ts";
import { P_MEMBERS, P_PI_PROFILE } from "./schema-people.ts";
import { P_RESEARCH, P_PROJECTS, P_PUBLICATIONS, P_PATENTS, P_AWARDS } from "./schema-work.ts";
import { P_NEWS, P_RESOURCES } from "./schema-news.ts";
import { checkTitlelessRows } from "./validate.ts";

export interface TitlelessSpec {
  /** 로그에 찍을 컬렉션 이름 */
  label: string;
  /** 공개 여부 체크박스 속성명. 공개되지 않은 행은 어차피 안 나오므로 점검하지 않는다. */
  publish: string;
  /** 이 중 **하나라도** 채워져 있으면 통과. 매퍼의 null 조건과 같게 둔다. */
  titleProps: readonly string[];
  /** 로그에 적을 "빠진 필드" 이름 (Notion 속성명 그대로 보여 준다) */
  fieldLabel: string;
  /** 어느 행인지 가리킬 단서용 속성 (있으면 쓴다) */
  slug?: string;
  date?: string;
}

/**
 * 컬렉션별 설정.
 *
 * Members 만 결이 다르다 — 공개 칸이 `Publish` 가 아니라 `홈페이지 공개` 이고,
 * title 속성이 `이름` 이다. 매퍼도 `이름` 하나만 보므로(영문명이 있어도 버린다)
 * titleProps 에 `영문명` 을 넣지 않는다.
 */
export const SPECS = {
  members: {
    label: "Members",
    publish: P_MEMBERS.publish,
    titleProps: [P_MEMBERS.nameKo],
    fieldLabel: P_MEMBERS.nameKo,
    slug: P_MEMBERS.slug,
  },
  piProfile: {
    label: "PI Profile",
    publish: P_PI_PROFILE.publish,
    titleProps: [P_PI_PROFILE.content, P_PI_PROFILE.contentKo],
    fieldLabel: `${P_PI_PROFILE.content} / ${P_PI_PROFILE.contentKo}`,
  },
  research: {
    label: "Research",
    publish: P_RESEARCH.publish,
    titleProps: [P_RESEARCH.title, P_RESEARCH.titleKo],
    fieldLabel: `${P_RESEARCH.title} / ${P_RESEARCH.titleKo}`,
    slug: P_RESEARCH.slug,
  },
  projects: {
    label: "Projects",
    publish: P_PROJECTS.publish,
    titleProps: [P_PROJECTS.title, P_PROJECTS.titleKo],
    fieldLabel: `${P_PROJECTS.title} / ${P_PROJECTS.titleKo}`,
    slug: P_PROJECTS.slug,
    date: P_PROJECTS.startDate,
  },
  publications: {
    label: "Publications",
    publish: P_PUBLICATIONS.publish,
    titleProps: [P_PUBLICATIONS.title, P_PUBLICATIONS.titleKo],
    fieldLabel: `${P_PUBLICATIONS.title} / ${P_PUBLICATIONS.titleKo}`,
    date: P_PUBLICATIONS.publishedDate,
  },
  patents: {
    label: "Patents",
    publish: P_PATENTS.publish,
    titleProps: [P_PATENTS.title, P_PATENTS.titleKo],
    fieldLabel: `${P_PATENTS.title} / ${P_PATENTS.titleKo}`,
    date: P_PATENTS.filingDate,
  },
  awards: {
    label: "Awards",
    publish: P_AWARDS.publish,
    titleProps: [P_AWARDS.title, P_AWARDS.titleKo],
    fieldLabel: `${P_AWARDS.title} / ${P_AWARDS.titleKo}`,
    date: P_AWARDS.date,
  },
  news: {
    label: "News",
    publish: P_NEWS.publish,
    titleProps: [P_NEWS.title, P_NEWS.titleKo],
    fieldLabel: `${P_NEWS.title} / ${P_NEWS.titleKo}`,
    slug: P_NEWS.slug,
    date: P_NEWS.date,
  },
  resources: {
    label: "Resources",
    publish: P_RESOURCES.publish,
    titleProps: [P_RESOURCES.title, P_RESOURCES.titleKo],
    fieldLabel: `${P_RESOURCES.title} / ${P_RESOURCES.titleKo}`,
    slug: P_RESOURCES.slug,
  },
} as const satisfies Record<string, TitlelessSpec>;

export type CollectionKey = keyof typeof SPECS;

/** 제목이 비어 버려질 행들의 "식별 단서". 제목이 없으니 Slug·날짜·page id 로 가리킨다. */
export function titlelessHints(
  rows: NotionPage[] | null,
  spec: TitlelessSpec,
): string[] {
  return (rows ?? [])
    .filter((r) => bool(r, spec.publish))
    .filter((r) => spec.titleProps.every((prop) => !text(r, prop)))
    .map((r) => {
      const slug = spec.slug ? text(r, spec.slug) : "";
      const day = spec.date ? date(r, spec.date) : null;
      return (
        [slug && `Slug="${slug}"`, day && `${spec.date}=${day}`]
          .filter(Boolean)
          .join(" ") || `page id=${r.id}`
      );
    });
}

/** 컬렉션별 원본 행 묶음. 키는 SPECS 와 같다. */
export type RowsByCollection = Partial<Record<CollectionKey, NotionPage[] | null>>;

/**
 * 모든 컬렉션을 한 번에 점검한다. 넘기지 않은 컬렉션은 건너뛴다
 * (해당 DB 가 설정되지 않아 rows 가 null 인 경우도 조용히 지나간다).
 */
export function checkAllTitleless(rowsByCollection: RowsByCollection): void {
  for (const key of Object.keys(SPECS) as CollectionKey[]) {
    const rows = rowsByCollection[key];
    if (rows === undefined) continue;
    const spec = SPECS[key];
    checkTitlelessRows(spec.label, titlelessHints(rows, spec), spec.fieldLabel);
  }
}
