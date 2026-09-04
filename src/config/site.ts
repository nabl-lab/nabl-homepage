/**
 * 사이트 기본 정보 — 한 곳에서만 관리한다.
 * 학교 도메인이 정해지면 `url` 만 바꾸면 canonical·OG·sitemap·robots 가 모두 따라간다.
 * 사이트 이름·설명은 문구이므로 여기 두지 않고 ui 사전(`site.name` / `site.description`)을 쓴다.
 */
import type { Locale } from "../i18n/ui";

export const SITE = {
  /** 배포 도메인. 프로토콜 포함, 끝 슬래시 없음. */
  url: "https://nabl.example.ac.kr",

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
