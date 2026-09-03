import test from 'node:test';
import assert from 'node:assert/strict';
import { copyText, scrollPageToTop } from './src/utils/uiActions.mjs';

test('복사 성공일 때만 성공을 반환한다', async () => {
  let copied;
  assert.equal(await copyText('hello', { writeText: async text => { copied = text; } }), true);
  assert.equal(copied, 'hello');
});

test('복사 권한 거부와 API 미지원은 실패로 반환한다', async () => {
  assert.equal(await copyText('hello', { writeText: async () => { throw new Error('denied'); } }), false);
  assert.equal(await copyText('hello', null), false);
  assert.equal(await copyText('hello', {}), false);
});

test('스크롤 효과가 없고 모션 감소 설정이면 기본 스크롤로 즉시 맨 위로 이동한다', () => {
  let result;
  scrollPageToTop({ reducedMotion: true, scrollTo: options => { result = options; } });
  assert.deepEqual(result, { top: 0, behavior: 'instant' });
});

test('기본 스크롤과 ScrollSmoother 모두 설정에 맞게 동작한다', () => {
  let result;
  scrollPageToTop({ reducedMotion: false, scrollTo: options => { result = options; } });
  assert.deepEqual(result, { top: 0, behavior: 'smooth' });
  for (const reducedMotion of [false, true]) {
    scrollPageToTop({ reducedMotion, smoother: { scrollTo: (...args) => { result = args; } } });
    assert.deepEqual(result, [0, !reducedMotion]);
  }
});
