import test from 'node:test';
import assert from 'node:assert/strict';
import { createMotionPreference, REDUCED_MOTION_QUERY } from './src/utils/motionPreference.mjs';

test('기기 설정 초기값을 읽고 켜기·끄기 변경을 구독한다', () => {
  const listeners=new Set();
  const media={matches:true,addEventListener:(type,fn)=>listeners.add(fn),removeEventListener:(type,fn)=>listeners.delete(fn)};
  const preference=createMotionPreference(query=>{assert.equal(query,REDUCED_MOTION_QUERY);return media});
  assert.equal(preference.getSnapshot(),true);
  const values=[];
  const unsubscribe=preference.subscribe(()=>values.push(preference.getSnapshot()));
  for(const value of [false,true,false]){media.matches=value;listeners.forEach(fn=>fn())}
  assert.deepEqual(values,[false,true,false]);
  unsubscribe();
  assert.equal(listeners.size,0);
});

test('matchMedia가 없는 환경에서는 일반 모션을 기본값으로 한다', () => {
  const preference=createMotionPreference();
  assert.equal(preference.getSnapshot(),false);
  assert.doesNotThrow(()=>preference.subscribe(()=>{})());
});
