// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// 배포 도메인은 src/config/site.ts 한 곳에서 관리한다 (canonical·OG 태그와 동일 출처).
// 값은 환경변수 SITE_URL 이고, 없으면 site.ts 의 기본값을 쓴다.
import { SITE } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  // 절대 URL 생성에 필요 (canonical, sitemap). 값은 src/config/site.ts 에서 가져온다
  // → 환경변수 SITE_URL. 페이지의 canonical 과 반드시 같은 출처를 쓴다.
  site: SITE.url,

  // 구 경로 → 새 경로. Publications 를 Research 하위로 옮기면서 남긴 안전망이다.
  // 정적 빌드에서는 meta refresh 리디렉션 HTML 이 생성된다.
  // rest 파라미터는 0개 세그먼트도 매칭하므로 한 줄로 기본 경로와 분류 경로를 모두 덮는다.
  redirects: {
    '/[...lang]/achievements/publications/[...filters]':
      '/[...lang]/research/publications/[...filters]',
  },

  // 다국어 라우팅: 영어(기본 언어)는 접두사 없이 루트(/, /members/ …),
  // 한국어는 /ko/... 로 페이지를 생성한다. 페이지 폴더는 src/pages/[...lang]/ 이고
  // URL 규칙은 src/i18n/paths.ts 한 곳에 있다.
  // 예전 /en/... 주소는 public/_redirects 가 접두사 없는 주소로 301 이동시킨다.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // sitemap 에 언어 대체(hreflang) 정보를 포함시킨다.
  // 루트(/)는 영어 홈이므로 sitemap 에 들어간다.
  integrations: [
    sitemap({
      // 구 경로 리디렉션 페이지는 sitemap 에서 뺀다 (noindex 리디렉션).
      filter: (page) => !page.includes("/achievements/publications"),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ko: 'ko' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },
});
