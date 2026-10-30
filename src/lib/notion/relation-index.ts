/**
 * relation 해석용 인덱스 구축 — DB 별로 **한 번만** 돌며 id→요약 맵을 만든다.
 *
 * relation 속성은 page id 배열만 주므로, 매퍼가 id 를 이름·제목으로 바꾸려면 이 맵이
 * 필요하다. 구성원·논문 수만큼 Notion 을 재조회하지 않기 위해 여기서 한 번에 만든다.
 *
 * 맵에 담는 범위는 `notion/types.ts` 의 RelationIndex 주석이 정의한다.
 * 요약하면: **`research` 만 미공개 행까지 담고, 나머지는 공개 항목만** 담는다.
 */
import type { NotionPage } from "./client";
import { type RelationIndex, type TitleRef, emptyIndex } from "./types";
import { P_MEMBERS } from "./schema-people";
import { P_PROJECTS, P_PUBLICATIONS, P_RESEARCH } from "./schema-work";
import { text, bool, select, num } from "./parsers";

/** Publish 체크된 행만 남긴다. 설정이 없어 null 인 경우 빈 배열로 본다. */
export const published = (rows: NotionPage[] | null, prop: string): NotionPage[] =>
  (rows ?? []).filter((r) => bool(r, prop));

const titleRef = (
  r: NotionPage,
  titleProp: string,
  titleKoProp: string,
  slugProp: string,
): TitleRef => ({
  id: r.id,
  slug: slugProp ? text(r, slugProp) : "",
  title: text(r, titleProp),
  title_ko: text(r, titleKoProp),
});

export interface IndexSource {
  members: NotionPage[] | null;
  projects: NotionPage[] | null;
  publications: NotionPage[] | null;
  research: NotionPage[] | null;
}

export function buildRelationIndex(src: IndexSource): RelationIndex {
  const index = emptyIndex();

  for (const r of published(src.members, P_MEMBERS.publish)) {
    const nameKo = text(r, P_MEMBERS.nameKo);
    if (!nameKo) continue; // 이름 없는 행은 사이트에 나오지 않으므로 인덱스에도 넣지 않는다
    index.members.set(r.id, {
      id: r.id,
      slug: text(r, P_MEMBERS.slug),
      name: text(r, P_MEMBERS.nameEn),
      name_ko: nameKo,
    });
  }

  for (const r of published(src.projects, P_PROJECTS.publish))
    index.projects.set(r.id, titleRef(r, P_PROJECTS.title, P_PROJECTS.titleKo, P_PROJECTS.slug));

  for (const r of published(src.publications, P_PUBLICATIONS.publish))
    index.publications.set(r.id, titleRef(r, P_PUBLICATIONS.title, P_PUBLICATIONS.titleKo, ""));

  // 연구 분야만 예외로 **전 행**을 담는다. 공개 전에도 구성원 페이지에 이름을 보여
  // 줘야 하기 때문이다. publish 를 함께 넣어 링크 여부는 화면이 판단한다.
  for (const r of src.research ?? [])
    index.research.set(r.id, {
      id: r.id,
      slug: text(r, P_RESEARCH.slug),
      title: text(r, P_RESEARCH.title),
      title_ko: text(r, P_RESEARCH.titleKo),
      category: select(r, P_RESEARCH.category) ?? "",
      code: select(r, P_RESEARCH.code) ?? "",
      publish: bool(r, P_RESEARCH.publish),
      order: num(r, P_RESEARCH.order) ?? undefined,
      keywords: text(r, P_RESEARCH.keywords)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    });

  return index;
}
