/**
 * PI(책임교수) 식별.
 *
 * 예전에는 수상 필터·대표 논문·정렬까지 여기 있었는데, 정렬은 lib/person.ts 로 옮기고
 * 수상·대표 논문 섹션은 PI 페이지에서 뺐다(시안의 섹션 구성에 없다).
 * 그래서 지금은 "누가 PI 인가" 하나만 남았다.
 */
import { members, PI_POSITION } from "./content";
import type { Member } from "./content";

/** PI 멤버. `직책·과정` 이 지도교수인 항목으로 식별한다. 없으면 null. */
export const pi: Member | null =
  members.find((m) => m.position === PI_POSITION) ?? null;
