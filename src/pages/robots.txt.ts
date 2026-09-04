// robots.txt 를 빌드 시 생성한다. Sitemap URL 은 src/config/site.ts 의 도메인을 따른다.
import type { APIRoute } from "astro";
import { SITE } from "../config/site";

const body = [
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${new URL("sitemap-index.xml", SITE.url).href}`,
  "",
].join("\n");

export const GET: APIRoute = () =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
