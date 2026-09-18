// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// 배포 도메인은 src/config/site.ts 한 곳에서 관리한다 (canonical·OG 태그와 동일 출처).
import { SITE } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  // 절대 URL 생성에 필요 (canonical, sitemap). 값은 src/config/site.ts 에서 가져온다.
  site: SITE.url,

  // 구 경로 → 새 경로. Publications 를 Research 하위로 옮기면서 남긴 안전망이다.
  // 정적 빌드에서는 meta refresh 리디렉션 HTML 이 생성된다.
  // rest 파라미터는 0개 세그먼트도 매칭하므로 한 줄로 기본 경로와 분류 경로를 모두 덮는다.
  redirects: {
    '/[lang]/achievements/publications/[...category]':
      '/[lang]/research/publications/[...category]',
  },

  // 다국어 라우팅: /en/... , /ko/... 두 언어로 페이지를 생성한다.
  // prefixDefaultLocale: true → 기본 언어(en)도 /en/ 접두사를 붙이고,
  // 루트(/) 접속은 /en/ 으로 리디렉션된다.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  // sitemap 에 언어 대체(hreflang) 정보를 포함시킨다.
  // 루트(/)는 /en/ 으로 보내는 리디렉션 페이지이므로 sitemap 에서 제외한다.
  integrations: [
    sitemap({
      // 루트(/)와 구 경로 리디렉션 페이지는 sitemap 에서 뺀다 (둘 다 noindex 리디렉션).
      filter: (page) =>
        page !== `${SITE.url}/` &&
        !page.includes("/achievements/publications"),
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
