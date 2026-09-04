# CLAUDE.md — 이 프로젝트를 AI로 이어받는 사람을 위한 규칙서

이 문서는 NABL 연구실 홈페이지를 유지보수하는 사람이 **가장 먼저 읽어야 할 규칙서**입니다.
AI 도구(Claude Code 등)로 작업할 때도 이 규칙을 지키도록 하세요.
모든 대화·코드 주석·문서는 **한국어**로 작성합니다.

---

## 1. 프로젝트 개요

- 대학교 연구실(NABL) 소개 홈페이지.
- **정적 사이트**입니다. 서버에서 도는 코드가 없고, 빌드하면 순수 HTML/CSS/JS 파일만
  나옵니다. 커스텀 백엔드나 자체 로그인 기능은 만들지 않습니다.
- 기술 스택:
  - **Astro** — 페이지를 만드는 정적 사이트 생성기 (SSG)
  - **Tailwind CSS** — 클래스로 스타일을 입히는 CSS 도구 (v4, 공식 통합)
  - **Netlify** — 배포. GitHub 저장소와 연결되어 push 하면 자동 빌드·배포됩니다.
- 콘텐츠 데이터(구성원·논문·소식)는 지금은 `src/data/` 의 더미 JSON이지만,
  나중에 **Google Sheets(CSV 게시)** 와 **Notion API** 에서 빌드 시점에 가져올 예정입니다.

---

## 2. 폴더 구조

```
nabl-homepage/
├── public/              정적 파일 그대로 복사됨 (favicon 등)
├── src/
│   ├── pages/           페이지. [lang] 폴더 아래에 둔다 (11번 항목 참고)
│   ├── layouts/         여러 페이지가 공유하는 공통 뼈대 (base-layout: <head> 메타·SEO)
│   ├── components/      재사용하는 화면 조각 (home/ 등 하위 폴더로 묶음)
│   ├── config/
│   │   └── site.ts      도메인·OG 이미지 경로 (12번 항목). 도메인 바뀌면 여기만 수정
│   ├── i18n/            다국어. ui.ts(문구 사전) + utils.ts(라우팅) + nav.ts(메뉴 구조)
│   ├── lib/             로직 모듈
│   │   ├── content.ts         콘텐츠 데이터를 읽는 유일한 통로 (4번 항목 참고)
│   │   ├── content-types.ts   콘텐츠 데이터의 형식(타입) 정의
│   │   ├── content-helpers.ts 정렬·그룹핑·언어 폴백 헬퍼 (content.ts 가 re-export)
│   │   └── pi.ts              PI 페이지용 파생 데이터 (content.ts 에서만 데이터를 받음)
│   ├── data/            콘텐츠 더미 데이터 (JSON). 자세한 설명은 src/data/README.md
│   └── styles/
│       └── global.css   Tailwind 불러오기 + 색상·폰트 토큰(@theme)
├── astro.config.mjs     Astro 설정         ← 5번 항목: 함부로 건드리지 말 것
├── netlify.toml         배포 설정          ← 5번 항목: 함부로 건드리지 말 것
├── tsconfig.json        TypeScript 설정    ← 5번 항목: 함부로 건드리지 말 것
├── package.json         의존성·명령        ← 5번 항목: 함부로 건드리지 말 것
├── .nvmrc              Node 버전 고정       ← 5번 항목: 함부로 건드리지 말 것
├── .env.example        필요한 환경변수 목록 (값은 비어 있음)
└── .env               로컬 비밀 값 (git에 안 올라감. 직접 만들어 사용)
```

---

## 3. 실행 명령

프로젝트 루트에서 터미널로 실행합니다.

| 명령 | 하는 일 |
| --- | --- |
| `npm install` | 의존성 설치 (처음 한 번, 또는 package.json이 바뀌었을 때) |
| `npm run dev` | 로컬 개발 서버 실행 → 브라우저에서 `http://localhost:4321` |
| `npm run build` | 배포용 정적 파일을 `dist/` 폴더에 생성 |
| `npm run preview` | 빌드 결과물을 로컬에서 미리보기 |
| `npx astro check` | 타입·문법 검사 |

---

## 4. 콘텐츠는 코드가 아니라 데이터 소스에서 고친다 (가장 중요)

구성원 목록, 논문 목록, 소식, 그 밖의 본문 텍스트 같은 **콘텐츠**는
`.astro` 파일을 열어 고치는 것이 아닙니다.

- **지금:** `src/data/members.json`, `src/data/publications.json`,
  `src/data/news.json` 을 편집합니다. (형식은 `src/data/README.md` 참고)
- **나중에 Google Sheets / Notion 연동이 붙은 뒤:** 콘텐츠는 **그 시트나 Notion에서만**
  수정합니다. 코드는 건드리지 않습니다.
- 코드에서 콘텐츠 데이터를 읽을 때는 **항상 `src/lib/content.ts` 를 통해서만** 가져옵니다.
  페이지가 `src/data/*.json` 을 직접 import 하지 않도록 합니다.
- 데이터 출처를 Sheets/Notion으로 바꿀 때는 **`src/lib/content.ts` 한 파일만** 고치면
  되도록 설계되어 있습니다. 이 구조를 깨지 마세요.

---

## 5. 함부로 건드리면 안 되는 것

아래 파일·설정은 사이트가 빌드되고 배포되는 방식을 결정합니다.
변경이 필요해 보이면 **AI에게 알아서 고치라고 맡기지 말고, 코드를 다룰 수 있는 사람에게
검토를 요청**하세요.

- `astro.config.mjs` (Astro / Tailwind 설정)
- `netlify.toml` (빌드 명령, 출력 경로, Node 버전)
- `tsconfig.json` (TypeScript 설정)
- `package.json` 의 `dependencies` / `scripts` (의존성 추가·삭제·버전 변경)
- `.nvmrc` (Node 버전)
- `.env` 및 모든 비밀 값 / 계정 고유 값

---

## 6. 계정 고유 정보를 코드에 넣지 않는다

이 사이트는 **개인 계정에서 시작하지만 나중에 연구실 공용 계정으로 넘어갑니다.**
그래서 특정 계정에만 딸린 값이 코드나 설정 파일에 박히면 안 됩니다.

- 개인 이메일, 개인 API 토큰, 개인 사이트 ID, 개인 대시보드 URL 등을
  `.astro` / `.ts` / `.mjs` / `.toml` 파일에 **직접 쓰지 마세요.**
- 그런 값은 전부:
  - 로컬: `.env` 파일 (git에 올라가지 않음)
  - 배포: Netlify 대시보드 → Site settings → Environment variables
- 새로 필요한 환경변수가 생기면 `.env.example` 에 **키 이름과 한국어 설명만** 추가합니다
  (값은 비워 둠).

---

## 7. 파일 줄 수 상한

| 대상 | 상한 |
| --- | --- |
| `src/pages/` 의 `.astro` 페이지 | 200줄 |
| `src/components/` 의 컴포넌트 | 120줄 |
| `.ts` / `.js` 스크립트 | 150줄 |
| `src/data/` 아래 데이터 파일 | **상한 없음 (예외)** |

---

## 8. 분리 원칙 — 줄 수가 아니라 역할로 나눈다

- 파일을 나누는 기준은 **줄 수가 아니라 "하는 일(역할)"** 입니다.
- 위의 줄 수 상한은 **"한 파일에 역할이 너무 많이 섞였다"는 신호**일 뿐입니다.
- 줄 수를 맞추려고 의미 없이 파일을 쪼개는 **기계적 분할은 하지 마세요.**
  (예: 한 컴포넌트를 억지로 반으로 잘라 `part-a`, `part-b` 로 만드는 짓)
- 상한을 넘길 수밖에 없는 상황이라면, **임의로 넘기지 말고 사람(관리자)에게 먼저
  물어보세요.** "이 파일이 왜 길어졌는지, 나눌 수 있는지, 넘겨도 되는지"를 함께 판단합니다.

---

## 9. 의존성은 최소로

- 라이브러리를 추가하기 전에 **정말 필요한지** 다시 생각하세요.
  의존성이 적을수록 나중에 인수인계와 유지보수가 쉽습니다.
- 현재 의존성: `astro`, `tailwindcss`, `@tailwindcss/vite`, `@astrojs/sitemap`.
  (`@astrojs/sitemap` 은 빌드 시 sitemap.xml 만 만드는 공식 통합입니다.)
- 새 라이브러리 추가는 5번 항목(`package.json` 변경)에 해당합니다. 사람에게 확인하세요.

---

## 10. 작성 규칙

- **언어:** 대화, 코드 주석, 문서 모두 한국어.
- **파일명·폴더명:** 영문 소문자 + 하이픈 (`base-layout.astro`, `src/lib/`).
  공백·대문자·한글 파일명 금지.
- **커밋 메시지:** 한국어로, 무엇을 왜 바꿨는지 짧게.

---

## 11. 다국어(i18n) 규칙

이 사이트는 **영어(en) / 한국어(ko)** 두 언어로 만들어집니다. 새 페이지를 만들 때
아래 규칙을 지키지 않으면 언어 전환이나 폴백이 깨집니다.

### URL 구조
- 모든 페이지는 `/en/…` 또는 `/ko/…` 로 접근합니다. 루트(`/`)는 `/en/` 으로 리디렉션됩니다.
- 새 페이지 파일은 반드시 **`src/pages/[lang]/` 아래**에 둡니다.
  `getStaticPaths` 는 직접 만들지 말고 `src/i18n/utils.ts` 의 `localePaths` 를 씁니다.
  ```
  export const getStaticPaths = localePaths;
  const lang = Astro.params.lang as Locale;
  ```

### UI 문구 (메뉴·버튼·라벨·섹션 제목)
- 반드시 `src/i18n/ui.ts` 사전에 **en 과 ko 를 둘 다** 추가하고, 컴포넌트에서는
  `useTranslations(lang)` 로 꺼내 씁니다. 화면 문구를 `.astro` 에 직접 쓰지 마세요.
  (실제 문구는 `src/i18n/en.ts` / `ko.ts` 에 있고 `ui.ts` 가 둘을 묶습니다.)

### 헤더 네비게이션 메뉴
- 메뉴 구조(상위 항목·하위 드롭다운·경로)는 **`src/i18n/nav.ts` 의 `NAV` 배열 한 곳**에서만
  정의합니다. 메뉴를 추가·삭제·재배치하려면 이 파일만 고칩니다.
- 헤더 컴포넌트(`site-nav.astro` = 데스크톱, `site-nav-mobile.astro` = 모바일)는 `NAV` 를
  읽어 렌더링만 합니다. 두 컴포넌트에 메뉴 항목을 직접 쓰지 마세요.
- 각 항목의 문구는 `nav.ts` 에 두지 않고 `en.ts`/`ko.ts` 의 키(`key`)로 참조합니다.
- 드롭다운은 **JS 없이** 동작합니다 (데스크톱: CSS `hover`/`focus-within`,
  모바일: 중첩 `<details>`). 이 방식을 깨지 마세요.

### 콘텐츠 텍스트 (구성원·논문·뉴스 등 데이터에서 오는 값)
- 반드시 `src/lib/content.ts` 의 **`localizedText(item, '필드명', lang)`** 로 가져옵니다.
  `item.title_ko` 처럼 언어 필드에 직접 접근하지 마세요.
- 폴백 규칙: 현재 언어 값이 있으면 그것, 없으면 반대 언어 값, **둘 다 비어 있으면
  `null`** 을 돌려줍니다. `null` 이면 그 항목은 화면에서 건너뜁니다.
  (실제 운영에서 뉴스는 한글로만, 논문 제목은 영문으로만 올 수 있기 때문입니다.)
- 데이터의 언어 필드 이름: **영문 = 기본 필드명**(`title`), **한글 = `_ko` 접미사**(`title_ko`).

### 언어 전환 버튼
- 헤더의 KO/EN 버튼은 `switchLocalePath` 로 **현재 경로의 다른 언어 버전**으로 이동합니다.
  홈으로 튕기면 안 됩니다. (`src/components/language-switcher.astro`)

### 구성원 정렬
- 직책 순서와 정렬은 `content.ts` 의 **`POSITION_ORDER` / `sortMembers`** 를 씁니다.
  목록에 없는 새 직책이 들어와도 에러 없이 맨 뒤에 배치됩니다.

---

## 12. SEO · 사이트 기본 정보

- **도메인·대표 이미지 경로는 `src/config/site.ts` 한 곳**에서만 관리합니다.
  학교 도메인이 정해지면 `SITE.url` 만 바꾸면 canonical·Open Graph·sitemap·robots 가
  모두 따라갑니다. (사이트 이름·설명은 문구이므로 `en.ts`/`ko.ts` 의 `site.*` 키)
- `<title>` / `meta description` / Open Graph / hreflang / canonical 은 전부
  **`src/layouts/base-layout.astro` 가 자동 생성**합니다. 새 페이지는 `<BaseLayout>` 에
  `title` 과 (가능하면) `description` 만 넘기면 됩니다. description 을 안 주면
  `site.description` 으로 폴백합니다. **`.astro` 에 메타 태그를 직접 쓰지 마세요.**
- 공유 미리보기 이미지: `public/images/og-default.png` 등을 넣고
  `site.ts` 의 `ogImage` 에 경로를 적으면 OG/Twitter 이미지 태그가 자동으로 붙습니다.
- `sitemap.xml` 은 `@astrojs/sitemap` 이 빌드 시 자동 생성합니다(언어 대체 링크 포함).
  `robots.txt` 는 `src/pages/robots.txt.ts` 가 생성합니다.
- 404 페이지는 `src/pages/404.astro` (언어별이 아니라 한 파일, 두 언어 병기).
