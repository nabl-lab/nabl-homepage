// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
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

  vite: {
    plugins: [tailwindcss()]
  }
});
