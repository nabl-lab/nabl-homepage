/**
 * 언어별 URL 규칙 단위 테스트 — 영어 = 접두어 없음, 한국어 = /ko/.
 *
 * 실행: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  langParam,
  localePaths,
  pageLocale,
  withLocale,
  stripLocale,
  switchLocalePath,
  localeFromPath,
} from "../src/i18n/paths.ts";

test("영어는 접두어 없이, 한국어는 /ko 를 붙인다", () => {
  assert.equal(withLocale("en"), "/");
  assert.equal(withLocale("ko"), "/ko/");
  assert.equal(withLocale("en", "/members"), "/members");
  assert.equal(withLocale("ko", "/members"), "/ko/members");
  assert.equal(withLocale("en", "about#areas"), "/about#areas");
});

test("[...lang] 경로 값: 영어는 비우고 한국어만 ko", () => {
  assert.equal(langParam("en"), undefined);
  assert.equal(langParam("ko"), "ko");
  assert.deepEqual(localePaths(), [{ params: { lang: undefined } }, { params: { lang: "ko" } }]);
  assert.equal(pageLocale(undefined), "en");
  assert.equal(pageLocale("ko"), "ko");
});

test("언어 전환은 같은 페이지의 다른 언어 버전으로 (홈으로 튕기지 않음)", () => {
  assert.equal(switchLocalePath("/ko/members/alumni/", "en"), "/members/alumni/");
  assert.equal(switchLocalePath("/members/alumni/", "ko"), "/ko/members/alumni/");
  assert.equal(switchLocalePath("/", "ko"), "/ko/");
  assert.equal(switchLocalePath("/ko/", "en"), "/");
  assert.equal(switchLocalePath("/ko", "en"), "/");
  // 예전 /en/ 주소에서도 올바르게 바뀐다
  assert.equal(switchLocalePath("/en/members/", "ko"), "/ko/members/");
});

test("접두어 떼기·현재 언어 읽기", () => {
  assert.equal(stripLocale("/ko/about/"), "/about/");
  assert.equal(stripLocale("/about/"), "/about/");
  assert.equal(stripLocale("/ko"), "/");
  // /korea 같은 경로는 한국어 접두어가 아니다
  assert.equal(stripLocale("/korea/"), "/korea/");
  assert.equal(localeFromPath("/ko/news/"), "ko");
  assert.equal(localeFromPath("/news/"), "en");
  assert.equal(localeFromPath("/korea/"), "en");
});
