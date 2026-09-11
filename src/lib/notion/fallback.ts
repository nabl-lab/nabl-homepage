/**
 * Notion / JSON 데이터 출처 결정과 실패 규칙.
 *
 * 규칙 (확정):
 *  - 토큰 또는 Data Source ID 가 없다  → JSON 더미로 폴백 (비밀값 없이 개발 가능)
 *  - HTTP 오류 / 타임아웃 / 필수 속성 누락 → throw → **빌드 실패**
 *    (정적 사이트라 빌드가 실패하면 Netlify 가 직전 정상 배포를 계속 서빙한다)
 *  - 200 응답에 results: []  → **정상**. 빈 배열을 그대로 쓴다.
 *    0건은 버그가 아니라 "아직 입력하지 않은 상태"다. 더미로 되돌리지 않는다.
 */

/**
 * Notion 결과와 JSON 더미 중 무엇을 쓸지 고른다.
 *
 * @param label       빌드 로그용 이름
 * @param fromNotion  Notion 결과. null/undefined = 설정 없음 → JSON 사용.
 *                    빈 배열([])은 정상이므로 그대로 쓴다.
 * @param jsonData    폴백용 JSON 더미
 */
export function pick<T>(
  label: string,
  fromNotion: T[] | null | undefined,
  jsonData: T[],
): T[] {
  if (fromNotion == null) {
    console.log(
      `[notion] ${label}: 미설정 → JSON 더미 사용 (${jsonData.length}건)`,
    );
    return jsonData;
  }
  console.log(`[notion] ${label}: Notion ${fromNotion.length}건`);
  return fromNotion;
}
