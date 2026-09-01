/**
 * 콘텐츠 데이터 접근점 (single source of truth).
 *
 * 페이지·컴포넌트는 콘텐츠 데이터를 여기에서만 가져온다.
 * `src/data/*.json` 을 직접 import 하지 말 것.
 *
 * 지금은 `src/data/` 의 더미 JSON 을 그대로 내보낸다.
 * 나중에 Google Sheets(CSV) / Notion API 연동을 붙일 때는 **이 파일만** 고치면 된다.
 * (예: 빌드 시점에 fetch 해서 같은 형태의 배열로 가공해 export)
 * 페이지 코드는 그대로 두어도 된다.
 */

import membersData from "../data/members.json";
import publicationsData from "../data/publications.json";
import newsData from "../data/news.json";

/** 구성원 */
export interface Member {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  field: string;
  email: string;
  joinedYear: number;
}

/** 논문 */
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: string;
  link: string;
}

/** 소식 */
export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
}

export const members: Member[] = membersData;
export const publications: Publication[] = publicationsData;
export const news: NewsItem[] = newsData;
