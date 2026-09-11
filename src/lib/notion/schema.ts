/**
 * Notion 속성명 매핑 진입점.
 *
 * **페이지·컴포넌트는 이 파일을 직접 보지 않는다.** Notion 속성명이 바뀌면
 * 여기(아래 두 파일)만 고치면 되도록 모아둔 곳이다.
 * Notion 쪽 속성명을 바꾸는 대신 이 표를 고친다.
 *
 * 줄 수 상한 때문에 역할별로 나눠 두고 여기서 한데 모아 내보낸다:
 *  - schema-people.ts : members, PI Profile
 *  - schema-work.ts   : research, projects, publications, patents, awards, news, resources
 */
export * from "./schema-people";
export * from "./schema-work";
