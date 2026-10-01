/**
 * Notion 행 → 사이트 모델 변환 진입점.
 *
 * **페이지·컴포넌트는 이 파일을 직접 보지 않는다.** 데이터는 src/lib/content.ts 로만
 * 들어온다. 여기는 query.ts 가 매퍼를 한 번에 가져오기 위한 모음이다.
 *
 * 줄 수 상한 때문에 schema-*.ts 와 같은 축으로 나눠 두고 여기서 한데 모아 내보낸다:
 *  - map-people.ts : members, PI Profile
 *  - map-work.ts   : research, projects, publications, patents, awards
 *  - map-news.ts   : news, resources
 */
export * from "./map-people";
export * from "./map-work";
export * from "./map-news";
