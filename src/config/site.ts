/**
 * 사이트 기본 정보 — 한 곳에서만 관리한다.
 * 사이트 이름·설명은 문구이므로 여기 두지 않고 ui 사전(`site.name` / `site.description`)을 쓴다.
 *
 * ## 도메인은 환경변수 SITE_URL 로 바꾼다
 *
 * canonical, Open Graph(og:url), hreflang, sitemap, robots.txt 가 모두 이 값을 쓴다.
 * 학교 서브도메인이 정해지면 **Netlify 환경변수 SITE_URL 만** 바꾸면 되고 코드는
 * 건드리지 않는다. 비워 두면 아래 DEFAULT_SITE_URL(현재 Netlify 주소)로 동작한다.
 *
 * 읽는 경로가 `process.env` 하나뿐인 이유:
 * 이 파일은 **두 맥락에서 평가된다** — astro.config.mjs 가 import 할 때(Node)와
 * src 코드가 import 할 때(Vite). `.env` 파일은 Vite 쪽에만 주입되고 astro.config.mjs
 * 에는 닿지 않는다. 그래서 `.env` 에 SITE_URL 을 적으면 `site:`(설정)와 canonical(페이지)이
 * 서로 다른 주소를 쓰는 사고가 난다. 두 맥락에서 똑같이 보이는 `process.env` 만 읽어
 * 그 어긋남을 막는다.
 *
 *   로컬에서 임시로 바꿔 보기:  SITE_URL=https://example.org npm run build
 *   배포에서 바꾸기:            Netlify 환경변수 SITE_URL
 *
 * SITE_URL 은 비밀값이 아니라 공개 주소다. 그래서 기본값을 코드에 두어도 되고,
 * 설정을 깜빡해도 빌드가 깨지지 않는다 (NOTION_TOKEN 과 성격이 다르다).
 */
import type { Locale } from "../i18n/ui";

/** SITE_URL 이 없을 때 쓰는 현재 배포 주소. 프로토콜 포함, 끝 슬래시 없음. */
const DEFAULT_SITE_URL = "https://nabl-homepage.netlify.app";

/** 끝 슬래시를 떼어 낸다. new URL() 로 경로를 붙일 때 `//` 가 생기지 않게. */
function normalizeUrl(raw: string | undefined): string {
  const v = (raw ?? "").trim().replace(/\/+$/, "");
  return v || DEFAULT_SITE_URL;
}

export const SITE = {
  /**
   * 배포 도메인. 프로토콜 포함, 끝 슬래시 없음.
   * 값을 직접 고치지 말고 환경변수 SITE_URL 을 쓴다 (위 설명 참고).
   */
  url: normalizeUrl(
    typeof process !== "undefined" ? process.env?.SITE_URL : undefined,
  ),

  /**
   * 카톡·슬랙·페이스북 공유 미리보기용 대표 이미지 경로.
   * 예: public/images/og-default.png 를 넣고 "/images/og-default.png" 로 지정하면
   * OG/Twitter 이미지 태그가 자동으로 붙는다. 비워두면 이미지 태그를 넣지 않는다.
   * 권장 규격: 1200×630 이하, PNG/JPG.
   */
  ogImage: "",
} as const;

/** Open Graph 규격의 로케일 코드. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
};
