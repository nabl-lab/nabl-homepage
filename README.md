# NABL 연구실 홈페이지

Astro + Tailwind CSS 로 만든 정적 사이트. Netlify 로 배포합니다.

## 로컬에서 실행하기

```sh
npm install     # 처음 한 번 (의존성 설치)
npm run dev     # 개발 서버 실행
```

브라우저에서 `http://localhost:4321` 을 엽니다.

## 배포

- 이 저장소가 Netlify 사이트에 연결되어 있습니다.
- 기본 브랜치에 push 하면 Netlify 가 `netlify.toml` 설정대로 자동으로
  빌드(`npm run build`)하고 `dist/` 폴더를 배포합니다.
- 환경변수(나중에 Google Sheets / Notion 연동 시 필요)는 Netlify 대시보드의
  **Site settings → Environment variables** 에 등록합니다.
  필요한 키 목록은 [.env.example](.env.example) 을 참고하세요.

## 콘텐츠 수정

구성원·논문·소식 같은 내용은 `.astro` 코드가 아니라 **데이터에서** 고칩니다.
지금은 [src/data/](src/data/) 의 JSON 파일, 나중에는 Google Sheets / Notion 입니다.

## 유지보수 규칙

작업 전에 [CLAUDE.md](CLAUDE.md) 를 읽으세요. 폴더 구조, 실행 명령,
건드리면 안 되는 파일, 파일 분리 원칙 등이 정리되어 있습니다.
