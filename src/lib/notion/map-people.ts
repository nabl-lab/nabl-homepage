/**
 * Notion 행 → 사이트 모델 변환 — **사람** (members, PI Profile).
 * 속성명은 schema-people.ts 에서만 가져온다 (여기에 문자열 리터럴을 쓰지 않는다).
 *
 * 공통 규칙: **title 이 비어 있는 행은 null 을 돌려 조용히 건너뛴다** (오류 아님).
 * 같은 축의 다른 파일: map-work.ts(연구·성과), map-news.ts(소식·자료).
 * 호출부는 배럴 `map.ts` 에서 가져온다.
 */
import type { NotionPage } from "./client";
import type { Member, MemberResearchArea, PiEntry } from "../content-types";
import { type RelationIndex, resolveRefs } from "./types";
import { P_MEMBERS, P_PI_PROFILE } from "./schema";
import { RESEARCH_CATEGORY } from "./schema-work";
import { text, num, bool, select, date, email, multiSelect, relationIds } from "./parsers";
import { assetPath } from "./assets";

/** members: `홈페이지 공개` 체크된 행만 사이트에 노출한다. */
export function isMemberPublished(page: NotionPage): boolean {
  return bool(page, P_MEMBERS.publish);
}

/**
 * members 행 → Member.
 *
 * - 이름(title, 한국어)이 비면 null → 호출부에서 건너뛴다.
 * - `영문명`이 비어 있으면 name 이 빈 문자열이 되고, localizedText 가 name_ko 로 폴백한다.
 * - `연구 주제`·`연구 설명`은 Notion 에 영문 속성이 없어 영문 필드는 항상 빈 문자열이다
 *   (localizedText 가 ko 로 폴백한다).
 * - `연구 분야`는 relation 이다. Research DB 를 한 번 읽어 만든 인덱스와 조인하며,
 *   구성원 수만큼 재조회하지 않는다.
 * - 사진: Notion 서명 URL 은 약 1시간 뒤 만료되므로 여기서 넣지 않는다.
 *   자산 다운로드 단계에서 로컬 경로를 채운다. 그전까지는 플레이스홀더가 나온다.
 */
/**
 * 구성원의 연구 분야 — relation 을 Research 인덱스와 조인한다.
 *
 * **Category=Theme 행만** 쓴다. 인덱스에 없는 id(삭제된 행)나 Theme 아닌 행은
 * 조용히 건너뛴다 — 데이터 한 칸 때문에 빌드가 깨지지 않게 한다(CLAUDE.md 15번).
 * Scope 행이 연결돼 있으면 화면에서는 빠지지만 빌드 로그에 경고가 남는다
 * (notion/validate-rows.ts 의 checkMemberResearchAreas).
 *
 * 인덱스에는 미공개 행도 들어 있다. 공개 전에도 이름은 보여 줘야 하기 때문이다
 * (링크를 걸지 말지는 `publish` 로 화면이 판단한다).
 */
function researchAreasOf(page: NotionPage, index: RelationIndex): MemberResearchArea[] {
  return resolveRefs(relationIds(page, P_MEMBERS.relResearchAreas), index.research)
    .filter((r) => r.category === RESEARCH_CATEGORY.theme)
    .map((r) => ({
      title: r.title,
      title_ko: r.title_ko,
      slug: r.slug,
      code: r.code,
      category: r.category,
      publish: r.publish,
    }));
}

/**
 * `학위 이력` — rich_text 조각의 plain_text 를 이어 붙인 뒤 줄바꿈으로 끊는다.
 * 빈 줄은 버린다. 서식·링크는 평문으로 떨어진다 (text() 가 plain_text 만 본다).
 */
function degreeHistoryOf(page: NotionPage): string[] {
  return text(page, P_MEMBERS.degreeHistory)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function mapMember(page: NotionPage, index: RelationIndex): Member | null {
  const nameKo = text(page, P_MEMBERS.nameKo);
  if (!nameKo) return null;

  return {
    id: page.id,
    slug: text(page, P_MEMBERS.slug),
    name: text(page, P_MEMBERS.nameEn),
    name_ko: nameKo,
    position: select(page, P_MEMBERS.position) ?? "",
    status: select(page, P_MEMBERS.status) ?? "",
    order: num(page, P_MEMBERS.order) ?? undefined,
    joinedDate: date(page, P_MEMBERS.joined) ?? "",
    leftDate: date(page, P_MEMBERS.left) ?? "",
    email: email(page, P_MEMBERS.email) ?? "",
    researchTopic: "",
    researchTopic_ko: text(page, P_MEMBERS.topicKo),
    // `연구 설명`도 영문 속성이 없어 ko 만 채운다. 속성이 없거나 비면 빈 문자열.
    // text() 가 rich_text 조각의 plain_text 만 이어 붙이므로 굵게·링크 서식은 버려진다.
    researchDescription: "",
    researchDescription_ko: text(page, P_MEMBERS.researchDescriptionKo),
    researchAreas: researchAreasOf(page, index),
    degrees: multiSelect(page, P_MEMBERS.degrees),
    degreeHistory: degreeHistoryOf(page),
    graduatedYear: num(page, P_MEMBERS.graduatedYear),
    // 빌드 시 내려받은 로컬 경로. 없으면 undefined → 플레이스홀더.
    photo: assetPath(page.id),
  };
}

/** PI Profile: 공개된 행만 */
export function isPiEntryPublished(page: NotionPage): boolean {
  return bool(page, P_PI_PROFILE.publish);
}

/** PI Profile 행이 속한 구획 (Education | Career | Service) */
export function piSectionOf(page: NotionPage): string {
  return select(page, P_PI_PROFILE.section) ?? "";
}

/**
 * PI Profile 행 → PiEntry (학력·경력·대외활동 공용).
 * 사이트 모델에 organization 이 한 개뿐이라 영문이 비면 한국어를 쓴다.
 */
export function mapPiEntry(page: NotionPage): PiEntry | null {
  const content = text(page, P_PI_PROFILE.content);
  const contentKo = text(page, P_PI_PROFILE.contentKo);
  if (!content && !contentKo) return null;

  const org = text(page, P_PI_PROFILE.organization);
  return {
    text: content,
    text_ko: contentKo,
    organization: org || text(page, P_PI_PROFILE.organizationKo),
    startYear: num(page, P_PI_PROFILE.startYear) ?? 0,
    endYear: num(page, P_PI_PROFILE.endYear),
    order: num(page, P_PI_PROFILE.order) ?? undefined,
  };
}
