// 로고로 만드는 이미지 파일들을 한 번에 다시 만드는 일회성 스크립트.
//
//   public/og-image.png         1200×630 링크 미리보기(Open Graph). 흰 배경 가운데에
//                               전체 로고(public/brand/nabl-logo.svg)를 가로 약 60% 로.
//   public/favicon.ico          32×32 브라우저 탭 아이콘. 투명 배경.
//   public/apple-touch-icon.png 180×180 iOS 홈 화면 아이콘. 흰 배경.
//
// 아이콘 두 개는 마크(public/brand/nabl-logo-mark.svg)를 정사각형 가운데에 여백을 두고 놓는다.
// 로고 안에 "NABL" 글자와 부제가 path 로 들어 있어 글자를 따로 쓰지 않는다.
//
// 빌드 과정에 들어가지 않는다. 로고가 바뀌었을 때만 직접 다시 실행한다:
//   node scripts/make-og-image.mjs
// sharp 는 Astro 가 함께 설치하는 라이브러리라 package.json 에 따로 추가하지 않았다.
import fs from "node:fs/promises";
import sharp from "sharp";

const WHITE = "#ffffff";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** SVG 를 지정 폭으로 그린 PNG. density 를 높여 그린 뒤 줄여 가장자리가 흐려지지 않게 한다. */
async function rasterize(svgPath, width) {
  const svg = await fs.readFile(svgPath);
  const png = await sharp(svg, { density: 600 }).resize({ width }).png().toBuffer();
  const { height } = await sharp(png).metadata();
  return { png, width, height };
}

/** width×height 캔버스 가운데에 이미지를 놓은 PNG 버퍼. */
async function centered(width, height, background, logo) {
  return sharp({ create: { width, height, channels: 4, background } })
    .composite([
      {
        input: logo.png,
        left: Math.round((width - logo.width) / 2),
        top: Math.round((height - logo.height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** PNG 한 장을 담은 .ico 파일 (Windows Vista 이후·모든 현대 브라우저가 읽는 형식). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // 예약
  header.writeUInt16LE(1, 2); // 종류: 아이콘
  header.writeUInt16LE(1, 4); // 이미지 1장
  header.writeUInt8(size, 6); // 폭
  header.writeUInt8(size, 7); // 높이
  header.writeUInt8(0, 8); // 팔레트 없음
  header.writeUInt8(0, 9); // 예약
  header.writeUInt16LE(1, 10); // 색 평면
  header.writeUInt16LE(32, 12); // 픽셀당 비트
  header.writeUInt32LE(png.length, 14); // 이미지 크기
  header.writeUInt32LE(header.length, 18); // 이미지 시작 위치
  return Buffer.concat([header, png]);
}

// 1) 링크 미리보기
const og = await rasterize("public/brand/nabl-logo.svg", Math.round(1200 * 0.6));
const ogPng = await centered(1200, 630, WHITE, og);
await sharp(ogPng).flatten({ background: WHITE }).png({ compressionLevel: 9 }).toFile("public/og-image.png");

// 2) 아이콘 — 마크 폭을 캔버스의 84% 로 (양옆 8% 여백). 마크가 가로로 길어 위아래 여백은 저절로 크다.
const MARK_RATIO = 0.84;
const ico = await rasterize("public/brand/nabl-logo-mark.svg", Math.round(32 * MARK_RATIO));
await fs.writeFile("public/favicon.ico", pngToIco(await centered(32, 32, TRANSPARENT, ico), 32));

const touch = await rasterize("public/brand/nabl-logo-mark.svg", Math.round(180 * MARK_RATIO));
const touchPng = await centered(180, 180, WHITE, touch);
await sharp(touchPng).flatten({ background: WHITE }).png({ compressionLevel: 9 }).toFile("public/apple-touch-icon.png");

console.log("public/og-image.png 1200×630 · public/favicon.ico 32×32 · public/apple-touch-icon.png 180×180");
