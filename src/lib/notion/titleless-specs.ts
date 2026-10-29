/**
 * 제목 빈 행 검출의 **컬렉션별 설정표**. 판정 로직은 titleless.ts.
 *
 * 새 DB 를 붙이면 여기 한 줄만 더하면 된다.
 * `titleProps` 는 그 컬렉션 **매퍼의 null 조건과 똑같이** 맞춘다 — 어긋나면 거짓 경고가 난다.
 */
import type { TitlelessSpec } from "./titleless.ts";
import { P_MEMBERS, P_PI_PROFILE } from "./schema-people.ts";
import { P_RESEARCH, P_PROJECTS, P_PUBLICATIONS, P_PATENTS, P_AWARDS } from "./schema-work.ts";
import { P_NEWS, P_RESOURCES } from "./schema-news.ts";
import { P_SITE_CONTENT } from "./schema-content.ts";

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
  siteContent: {
    label: "Site Content",
    publish: P_SITE_CONTENT.publish,
    titleProps: [P_SITE_CONTENT.key],
    fieldLabel: P_SITE_CONTENT.key,
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
