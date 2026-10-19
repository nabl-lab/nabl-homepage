# src/data — 콘텐츠 데이터 폴더

이 폴더의 JSON 파일들은 **임시 더미 데이터**입니다. 실존 인물·논문·소식이 아닙니다.

## 필수 필드 — 비면 그 항목이 빠집니다

필수 필드가 빈 항목은 `src/lib/required-fields.ts` 가 걸러 내고 빌드 로그에
`[skip] …` 경고를 남깁니다. **항목 하나가 비어도 빌드 전체는 성공합니다**
(규칙과 이유는 `CLAUDE.md` 15번).

| 타입 | 필수 필드 |
| --- | --- |
| `news.json` | `slug`, `date` |
| `resources` | `title`, `slug` |
| `patents.json` · `awards.json` · `achievements-etc.json` | `title`, `date` |
| `members.json` | `name` 또는 `name_ko` (`position`·`slug` 는 비어도 됨) |
| `publications.json` · `research.json` 의 `areas`/`projects` | `title` |


## 더미 데이터 작성 규칙: 실존 정보 금지 (중요)

- **실존 인물의 이름이나 연락처를 넣지 않습니다.** 구성원·졸업생·수상자·저자·발명자
  이름, 이메일, 전화번호 등은 전부 **명백히 가짜인 값**으로 씁니다.
  - 이름 예시: `Gildong Hong / 홍길동`, `Cheolsu Kim / 김철수`, `Test Researcher A`
  - 이메일 예시: `gildong.hong@example.edu` (`example.edu` / `example.com` 등 예시용 도메인)
- 이유: 실제 사람의 정보가 더미 데이터로 커밋되면 안 됩니다. 실제 구성원 정보는
  나중에 Google Sheets / Notion 에서만 관리합니다.
- 나중에 인수인계 받는 사람이 테스트 데이터를 추가·수정할 때도 이 원칙을 지킵니다.
- 학회·기관·소속 이름처럼 사람이 특정되지 않는 값은 그럴듯하게 채워도 됩니다
  (레이아웃 확인용).

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
| `researchDescription` / `researchDescription_ko` | 2~3문장 연구 소개. 비면 `""` → 화면에 그 영역을 렌더하지 않음 |
| `researchAreas[]` | 연구 분야. `title`/`title_ko`, `slug`, `code`(N\|A\|B\|L), `category`(`Theme`\|`Scope`), `publish`. **`publish` 가 false 면 이름만 보여 주고 링크를 걸지 않음** |

구성원의 `researchTopic` · `researchDescription` 은 Notion 에 영문 속성이 없어
실제 운영에서는 `_ko` 쪽만 채워집니다 (`/en` 에서도 한국어 원문이 나옵니다).
목록 카드에서는 연구 소개가 3줄에서 말줄임되고, 상세 페이지에서는 전체가 나옵니다.

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
| `year` | 발표 연도 (숫자). 값이 없으면 `null` → "연도 미상" 그룹 |
| `publishedDate` | 게재일 (`YYYY-MM-DD`, 없으면 `null`). **연도는 이 값이 `year` 보다 우선** |
| `category` | `international` \| `domestic` \| `conference` |
| `link` | 논문 링크 URL |
| `personalGrant` | 내부용 (`true`/`false`). **화면에 표시하지 않음** |
| `fundingProjectIds` | 사사 과제 id 배열. **화면에 표시하지 않음** |

연도 그룹 규칙은 `src/lib/publications.ts` 에 있습니다. 같은 연도 안에서는
`publishedDate` 최신순이고, 날짜가 없는 항목은 그 연도의 뒤로 밀립니다.

### patents.json — 특허

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `title` / `title_ko` | 특허 제목 |
| `number` | 화면에 찍는 번호 (등록번호가 있으면 등록번호, 없으면 출원번호) |
| `date` | 연도 그룹용 날짜 (`YYYY-MM-DD`) |
| `status` | Notion `Status` 값 그대로. **표시용일 뿐 등록/출원 구분에는 쓰지 않음** |
| `registrationNumber` | 등록번호. 없으면 `""` |
| `registrationDate` | 등록일 (`YYYY-MM-DD`). 없으면 `null` |
| `country` | 출원 국가 (`KR` / `US` / `EP` / `PCT` …). 목록의 국가 배지에 쓰임 |
| `inventors` | 발명자 (문자열) |

분류 규칙 (`src/lib/patents.ts`)

1. `status` 가 `Expired` → **홈페이지에 표시하지 않음** (공개 설정과 무관)
2. `registrationNumber` 나 `registrationDate` 가 하나라도 있으면 → **등록**
3. 그 외 → **출원**

2·3번은 `status` 철자에 의존하지 않습니다. 1번만 예외적으로 `status` 값을 봅니다.

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
| `areas[]` | 연구 분야. `id`, `title`/`title_ko`, `summary`/`summary_ko`(= Notion `Description`), `slug`, `category`(`Scope`\|`Theme`), `code`, `keywords[]`, `order`, `featured`, `publish`, `members[]`, `projects[]` |

연구 분야는 `category` 로 쓰임이 갈립니다 — `Scope` 는 `/research` 상단 소개 문구,
`Theme` 는 카드. 상세 페이지는 **`publish` 가 true 이고 `Theme` 이고 `slug` 가 있을 때만**
생깁니다 (규칙은 `src/lib/research.ts`).
| `projects[]` | 연구 과제 (아래 표 참고) |

#### projects[] 의 필드

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `title` / `title_ko` | 과제명. `title_ko` 가 비면 한글 페이지에서도 `title` 을 씁니다 |
| `startDate` / `endDate` | `YYYY-MM-DD`. 없으면 `null`. **`period` 문자열은 쓰지 않습니다** — 기간은 화면에서 만듭니다 |
| `status` | `Ongoing` \| `Completed` \| `Planned` |
| `funder` / `funder_ko` | 지원 기관. 한쪽이 비면 다른 쪽을 씁니다 |
| `description` / `description_ko` | 과제 설명. 비면 설명 영역을 렌더하지 않습니다 |
| `slug` | 비어 있을 수 있습니다. 코드가 임의로 만들지 않습니다 |
| `featured` | 대표 과제 표시. 지금은 쓰는 화면이 없습니다 |
| `grantNumber` · `publicationIds` | **화면에 표시하지 않음** |

목록은 연도로 묶지 않고 한 줄로 이어집니다. 진행 중인 과제가 맨 위에 오고 배지가
붙으며, 그 안에서는 시작일 내림차순입니다. 정렬·기간 표시 규칙은
`src/lib/projects.ts` 에 있고 `npm test` 가 지킵니다.

### achievements-etc.json — 기타 성과 (초청강연·저서·언론 등)

| 필드 | 설명 |
| --- | --- |
| `id` | 식별자 |
| `kind` / `kind_ko` | 종류 (예: Invited Talk / 초청 강연) |
| `title` / `title_ko` | 제목 |
| `venue` / `venue_ko` | 장소·매체 |
| `date` | 날짜 (`YYYY-MM-DD`) — 연도별 그룹에 쓰임 |

### about.json / pi-profile.json — 소개 · PI 프로필 (객체 하나)

필드 구조는 `src/lib/content-types.ts` 의 `About` / `PiProfile` 타입을 참고하세요.

## 규칙

- 이 폴더의 데이터 파일에는 파일 줄 수 상한 규칙을 적용하지 않습니다.
- 데이터를 코드에서 읽을 때는 항상 `src/lib/content.ts` 를 통해서만 가져옵니다.
