/**
 * PI(책임교수) 페이지 전용 타입 — 학력·경력·대외활동 항목.
 *
 * 직위·연구실·연구 관심사·외부 링크는 **구성원 DB 속성**으로 옮겼다
 * (예전 pi-profile.json). Member 타입을 보라.
 *
 * content-types.ts 에서 분리했다 (역할이 다르고, content-types.ts 가 줄 수 상한에 닿았다).
 * `content-types.ts` 가 그대로 re-export 하므로 가져다 쓰는 쪽 경로는 바뀌지 않는다.
 */

/**
 * PI 페이지의 학력·경력·대외활동 항목 (세 배열 공용).
 * Notion 의 PI Profile DB 한 행과 1:1 대응한다 (Section 으로 세 갈래를 구분).
 * endYear: 진행 중이면 null. order: 있으면 시작연도보다 우선(작을수록 위).
 */
export interface PiEntry {
  text: string;
  text_ko: string;
  organization: string;
  startYear: number;
  endYear: number | null;
  order?: number;
}

