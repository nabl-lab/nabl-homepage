/**
 * Notion 행 → 사이트 내부 모델 변환.
 *
 * 속성명은 전부 schema.ts 에서만 가져온다 (여기에 문자열 리터럴을 쓰지 않는다).
 * 공통 규칙: **title 이 비어 있는 행은 조용히 건너뛴다** (오류로 처리하지 않는다).
 */
import type { NotionPage } from "./client";
import type { Member, PiEntry } from "../content-types";
import { P_MEMBERS, P_PI_PROFILE } from "./schema";
import { text, num, bool, select, date, email } from "./parsers";
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
 * - `연구 주제`는 Notion 에 영문 속성이 없어 researchTopic 은 항상 빈 문자열이다(ko 로 폴백).
 * - 사진: Notion 서명 URL 은 약 1시간 뒤 만료되므로 여기서 넣지 않는다.
 *   자산 다운로드 단계에서 로컬 경로를 채운다. 그전까지는 플레이스홀더가 나온다.
 */
export function mapMember(page: NotionPage): Member | null {
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
