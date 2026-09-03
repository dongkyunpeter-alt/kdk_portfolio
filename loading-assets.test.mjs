import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';

test('메인과 상세 HTML은 각각의 정적 번들을 사용한다', () => {
  const main=readFileSync('index.html','utf8');
  const detail=readFileSync('pulmuone.html','utf8');
  assert.match(main,/src="assets\/js\/react-app\.js"/);
  assert.match(detail,/src="assets\/js\/pulmuone-app\.js"/);
  assert.doesNotMatch(detail,/src="assets\/js\/react-app\.js"/);
});

test('프로필 preload와 실제 이미지가 동일한 WebP를 가리킨다', () => {
  const path='assets/images/profile-kang-donggyun.webp';
  assert.ok(existsSync(path));
  assert.ok(readFileSync('index.html','utf8').includes(`href="${path}"`));
  assert.ok(readFileSync('src/pages/HomePage.jsx','utf8').includes(`src="${path}"`));
});

test('프로필 원본과 최적화 이미지가 모두 보존된다', () => {
  for(const name of ['assets/images/profile-kang-donggyun','assets/mongi-park-map-v1','assets/mongi-directional-sprite-v2-transparent']) {
    assert.ok(existsSync(`${name}.png`));
    assert.ok(existsSync(`${name}.webp`));
  }
});

test('배포본 preload는 중복 경로 없이 존재하는 리소스를 가리킨다', {skip:!existsSync('dist/index.html')}, () => {
  const html=readFileSync('dist/index.html','utf8');
  const preload=html.match(/rel="preload"[^>]*href="([^"]+)/)?.[1];
  assert.equal(normalize(preload),normalize('assets/images/profile-kang-donggyun.webp'));
  for(const page of ['index','pulmuone']) {
    for(const [,url] of readFileSync(`dist/${page}.html`,'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(/^(https?:|data:|#)/.test(url))continue;
      assert.ok(existsSync(join('dist',url)),`Missing built resource: ${url}`);
    }
  }
});
