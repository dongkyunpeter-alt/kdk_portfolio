// SHARP_MODULE로 이미 설치된 sharp 경로를 지정할 수도 있습니다.
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const { statSync } = require('node:fs');

const sources = [
  'assets/images/profile-kang-donggyun.png',
  'assets/mongi-park-map-v1.png',
  'assets/mongi-directional-sprite-v2-transparent.png',
];

async function main() {
  for (const source of sources) {
    const destination = source.replace(/\.png$/, '.webp');
    await sharp(source).webp({ lossless: true, effort: 6 }).toFile(destination);
    const before = await sharp(source).ensureAlpha().raw().toBuffer();
    const after = await sharp(destination).ensureAlpha().raw().toBuffer();
    // 투명 픽셀의 보이지 않는 RGB는 WebP가 정리할 수 있어 알파와 보이는 색을 검사합니다.
    if (before.length !== after.length) throw new Error(`${source}: dimensions changed`);
    for (let i = 0; i < before.length; i += 4) {
      if (before[i + 3] !== after[i + 3] ||
          (before[i + 3] > 0 && !before.subarray(i, i + 3).equals(after.subarray(i, i + 3)))) {
        throw new Error(`${source}: visible pixels changed`);
      }
    }
    console.log(`${source}: ${statSync(source).size} -> ${statSync(destination).size} bytes (lossless verified)`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
