# src/data — 콘텐츠 데이터 폴더

이 폴더의 JSON 파일들은 **임시 더미 데이터**입니다. 실존 인물·논문·소식이 아닙니다.

## 목적

- 지금은 사이트를 개발하는 동안 화면에 채워 넣을 예시 데이터입니다.
- 나중에는 **Google Sheets(CSV 게시)** 와 **Notion API** 에서 빌드 시점에
  실제 콘텐츠를 가져와 이 자리를 대체할 예정입니다.
- 그때부터 콘텐츠 수정은 이 파일이 아니라 **Google Sheets / Notion 에서** 합니다.

## 다국어 필드 규칙 (중요)

- 영문 값은 **기본 필드명**(`title`, `summary` …), 한글 값은 **`_ko` 접미사**
  (`title_ko`, `summary_ko` …) 를 씁니다.
- 코드는 `src/lib/content.ts` 의 `localizedText()` 로 언어를 고릅니다.
  현재 언어 값이 없으면 반대 언어 값으로 폴백하고, 둘 다 비어 있으면 그 항목을
  화면에서 건너뜁니다. **번역이 없어도 사이트가 깨지지 않습니다.**
- 즉, 한쪽 언어만 채워도 됩니다 (예: 뉴스는 `title_ko` 만, 논문 제목은 `title` 만).

## 파일별 스키마 (필드 이름은 실제 연동 시 조정될 수 있음)

### members.json — 구성원

| 필드 | 설명 |
| --- | --- |
| `id` | 영문 소문자 + 하이픈 식별자 |
| `name` / `name_ko` | 이름 (영문 / 국문) |
| `position` | 직책. `content.ts` 의 `POSITION_ORDER` 값과 맞춥니다 |
| `order` | (선택) 같은 직책 안에서 이 숫자가 있으면 입실일보다 우선해 정렬 |
| `joinedDate` | 입실일 (`YYYY-MM-DD`) |
| `email` | 이메일 |
| `researchTopic` / `researchTopic_ko` | 연구 주제 (영문 / 국문) |

### alumni.json — 졸업생

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `name` / `name_ko` | 이름 |
| `degree` | 학위 (`Ph.D.`, `M.S.` 등) |
| `graduatedYear` | 졸업 연도 (숫자) |
| `afterAffiliation` / `afterAffiliation_ko` | 졸업 후 소속 |

### publications.json — 논문

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `title` / `title_ko` | 논문 제목 |
| `authors` | 저자 (문자열) |
| `venue` / `venue_ko` | 학회 / 저널 이름 |
| `year` | 발표 연도 (숫자) |
| `category` | `international` \| `domestic` \| `conference` |
| `link` | 논문 링크 URL |

### patents.json — 특허

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `title` / `title_ko` | 특허 제목 |
| `number` | 출원/등록 번호 |
| `date` | 날짜 (`YYYY-MM-DD`) |
| `status` | `registered`(등록) \| `applied`(출원) |
| `inventors` | 발명자 (문자열) |

### awards.json — 수상

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `title` / `title_ko` | 상 이름 |
| `recipient` / `recipient_ko` | 수상자 |
| `organization` / `organization_ko` | 수여 기관 |
| `date` | 날짜 (`YYYY-MM-DD`) |
| `year` | 연도 (숫자, 연도별 그룹용) |

### news.json — 소식

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `slug` | URL 조각 (`/news/{slug}`) |
| `date` | 날짜 (`YYYY-MM-DD`) |
| `title` / `title_ko` | 소식 제목 |
| `body` / `body_ko` | 본문 |

### research.json — 연구 (객체 하나)

| 필드 | 설명 |
| --- | --- |
| `scope` / `scope_ko` | 연구 범위 소개 문단 |
| `areas[]` | 연구 분야. `id`, `title`/`title_ko`, `summary`/`summary_ko`, `themes[]`/`themes_ko[]` |
| `projects[]` | 프로젝트. `id`, `title`/`title_ko`, `period`, `funder`/`funder_ko` |

## 규칙

- 이 폴더의 데이터 파일에는 파일 줄 수 상한 규칙을 적용하지 않습니다.
- 데이터를 코드에서 읽을 때는 항상 `src/lib/content.ts` 를 통해서만 가져옵니다.
