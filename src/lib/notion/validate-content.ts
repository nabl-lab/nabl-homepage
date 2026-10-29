/**
 * 페이지 문구(Site Content) 점검 — 경고만 남기고 빌드를 멈추지 않는다.
 *
 * 컬렉션별 내용 점검은 validate-rows.ts, Slug 범용 검증은 validate.ts.
 */
/**
 * 페이지 문구에서 **없으면 화면이 통째로 비는 Key** 를 점검한다. 경고만 남긴다.
 *
 * `about.intro` 가 비면 /about 의 소개 영역이 사라진다. 예전에는 src/data/about.json
 * 이 그 자리를 채웠지만 이제 Notion 이 유일한 출처라, 비어 있으면 알려 줘야 한다.
 * 히어로 한 줄 소개·홈 소개는 ui 사전 문구로 폴백하므로 여기 넣지 않는다.
 *
 * 새로 "비면 안 되는 Key" 가 생기면 아래 배열에 한 줄만 더하면 된다.
 */
const REQUIRED_CONTENT_KEYS = [
  // effect 는 조사까지 포함한 완성된 구절로 적는다 (문장에 그대로 끼워 넣는다).
  { key: "about.intro", effect: "/about 의 연구실 소개 영역이 화면에 나오지 않습니다" },
];

export function checkSiteContentKeys(entries: { key: string }[]): void {
  for (const { key, effect } of REQUIRED_CONTENT_KEYS) {
    if (entries.some((e) => e.key === key)) continue;
    console.warn(
      `[warn] site content: Key "${key}" 가 없습니다 → ${effect}. ` +
        `Notion 「페이지 문구」 DB 에서 그 Key 행을 추가하고 Publish 를 켜 주세요.`,
    );
  }
}
