/**
 * PWA/iOS 아이콘 생성 스크립트
 * 실행: node scripts/generate-icons.mjs
 * 필요 패키지: npm install sharp --save-dev
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iosSizes = [120, 180, 1024]; // iOS specific sizes

const svgPath = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');

  // PWA icons
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Created icon-${size}x${size}.png`);
  }

  // iOS icons
  console.log('\nGenerating iOS icons...');
  for (const size of iosSizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(outputDir, `ios-icon-${size}x${size}.png`));
    console.log(`Created ios-icon-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(join(outputDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Favicon
  await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toFile(join(outputDir, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');

  await sharp(svgPath)
    .resize(16, 16)
    .png()
    .toFile(join(outputDir, 'favicon-16x16.png'));
  console.log('Created favicon-16x16.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
