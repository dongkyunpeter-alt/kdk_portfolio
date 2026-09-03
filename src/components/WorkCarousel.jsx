import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { motionPreference } from '../utils/motionPreference.mjs';

const items=[
  ['https://icerence.github.io/kiwik-project/','assets/images/hero.webp',960,540,'풀무원 메인페이지','풀무원 메인','5개 풀페이지 섹션과 Dot Navigation 인터랙션을 공동 구현했습니다.'],
  ['https://icerence.github.io/kiwik-project/food.html','assets/images/food-hero.webp',800,450,'지속가능 식생활 페이지','지속가능 식생활','바른 식생활 원칙을 사용자가 따라 읽을 수 있는 이야기 흐름으로 구성했습니다.'],
  ['https://icerence.github.io/kiwik-project/food2.html','assets/images/food2-hero.webp',800,450,'지속가능식품 페이지','지속가능식품','식물성 지향과 동물복지 체계를 비교 가능한 정보 구조로 시각화했습니다.'],
  ['https://icerence.github.io/kiwik-project/food3.html','assets/images/food3-hero.webp',800,450,'바른먹거리 원칙 페이지','바른먹거리 원칙','원칙과 이력 추적 정보를 중요도와 읽는 순서에 따라 단계적으로 정리했습니다.'],
  ['https://icerence.github.io/kiwik-project/food4.html','assets/images/food4-hero.webp',800,450,'바른먹거리 캠페인 페이지','바른먹거리 캠페인','대상별 교육 프로그램과 활동 내용을 빠르게 비교할 수 있는 카드로 구성했습니다.'],
  ['https://icerence.github.io/kiwik-project/food5.html','assets/images/food5-hero.webp',800,450,'식품안전·품질정책 페이지','식품안전·품질정책','전문적인 안전관리 절차를 사용자가 이해할 수 있는 정보 위계로 정리했습니다.'],
];
const repeated=[...items,...items,...items];

export default function WorkCarousel(){
  const reducedMotion=useReducedMotion();
  const cardsRef=useRef(null); const trackRef=useRef(null); const drag=useRef(null); const [virtualIndex,setVirtualIndex]=useState(items.length); const [offset,setOffset]=useState(0); const [animate,setAnimate]=useState(false); const [dragging,setDragging]=useState(false); const logical=((virtualIndex%items.length)+items.length)%items.length;
  const indexRef=useRef(items.length),moving=useRef(false),settleTimer=useRef(0),releaseFrame=useRef(0);
  const center=index=>{const card=trackRef.current?.children[index];const viewport=cardsRef.current;if(!card||!viewport)return;setOffset(Math.round(viewport.clientWidth/2-(card.offsetLeft+card.offsetWidth/2)))};
  useLayoutEffect(()=>{center(virtualIndex);const resize=()=>center(virtualIndex);addEventListener('resize',resize);return()=>removeEventListener('resize',resize)},[virtualIndex]);
  const settle=()=>{
    if(!moving.current)return;
    clearTimeout(settleTimer.current);
    cancelAnimationFrame(releaseFrame.current);
    const index=indexRef.current;
    const normalized=items.length+((index%items.length)+items.length)%items.length;
    setAnimate(false);
    indexRef.current=normalized;
    setVirtualIndex(normalized);
    // 복제 카드에서 원본으로 옮긴 프레임이 그려진 뒤 다음 입력을 받습니다.
    releaseFrame.current=requestAnimationFrame(()=>{
      releaseFrame.current=requestAnimationFrame(()=>{moving.current=false});
    });
  };
  const goTo=index=>{
    if(motionPreference.getSnapshot()){
      clearTimeout(settleTimer.current);
      cancelAnimationFrame(releaseFrame.current);
      moving.current=false;
      indexRef.current=items.length+((index%items.length)+items.length)%items.length;
      setAnimate(false);
      setVirtualIndex(indexRef.current);
      return;
    }
    if(moving.current||index===indexRef.current)return;
    moving.current=true;
    indexRef.current=Math.max(0,Math.min(repeated.length-1,index));
    setAnimate(true);
    setVirtualIndex(indexRef.current);
    // 탭 전환·리사이즈 등으로 transitionend가 빠져도 입력 잠금이 남지 않습니다.
    clearTimeout(settleTimer.current);
    settleTimer.current=setTimeout(settle,650);
  };
  const move=delta=>goTo(indexRef.current+delta);
  useEffect(()=>{
    if(!reducedMotion)return;
    drag.current=null;
    setDragging(false);
    goTo(indexRef.current);
    center(indexRef.current);
  },[reducedMotion]);
  useEffect(()=>{
    const viewport=cardsRef.current;
    const wheel=event=>{
      if(!event.shiftKey)return;
      const delta=event.deltaY||event.deltaX;
      if(!delta)return;
      event.preventDefault();
      move(delta>0?1:-1);
    };
    viewport.addEventListener('wheel',wheel,{passive:false});
    return()=>{
      viewport.removeEventListener('wheel',wheel);
      clearTimeout(settleTimer.current);
      cancelAnimationFrame(releaseFrame.current);
    };
  },[]);
  const start=event=>{if(moving.current||(event.pointerType==='mouse'&&event.button!==0))return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,offset};setDragging(false)};
  const change=event=>{if(!drag.current||drag.current.id!==event.pointerId)return;const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;if(!dragging&&Math.max(Math.abs(dx),Math.abs(dy))<7)return;if(Math.abs(dy)>Math.abs(dx)){drag.current=null;return}event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);setAnimate(false);!motionPreference.getSnapshot()&&setOffset(Math.round(drag.current.offset+dx))};
  const end=event=>{if(!drag.current)return;const dx=event.clientX-drag.current.x;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);setDragging(false);if(event.type!=='pointercancel'&&Math.abs(dx)>60)move(dx<0?1:-1);else{setAnimate(true);center(indexRef.current)}};
  return <section className="work-strip" id="work" aria-labelledby="work-title"><div className="work-head wrap"><p className="eyebrow">〈 Implemented Pages 〉</p><h2 id="work-title">직접 구현한 화면들</h2></div><div ref={cardsRef} className={`cards${dragging?' dragging':''}`} id="work-cards" tabIndex="0" role="region" aria-label="구현 프로젝트 6개" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}}} onPointerDown={start} onPointerMove={change} onPointerUp={end} onPointerCancel={end}><div ref={trackRef} className="cards-track" id="work-track" style={{transform:`translate3d(${offset}px,0,0)`,transition:animate&&!reducedMotion?'transform .48s cubic-bezier(.22,1,.36,1)':'none'}} onTransitionEnd={event=>{if(event.target===event.currentTarget&&event.propertyName==='transform')settle()}}>{repeated.map((item,index)=><article className={`project-card${index===virtualIndex?' is-active':''}`} data-project-index={index%items.length} aria-hidden={index<items.length||index>=items.length*2} key={`${item[5]}-${index}`}><a href={item[0]} tabIndex={index<items.length||index>=items.length*2?-1:undefined} target="_blank" rel="noreferrer" onDragStart={event=>event.preventDefault()}><img src={item[1]} loading="lazy" decoding="async" width={item[2]} height={item[3]} alt={item[4]}/></a><div className="project-info"><div className="card-meta"><div><h2>{item[5]}</h2><p>{item[6]}</p></div><span className="arrow">↗</span></div></div></article>)}</div></div><div className="carousel-nav" role="group" aria-label="프로젝트 캐러셀 탐색"><button className="carousel-button" id="work-prev" type="button" aria-label="이전 프로젝트" onClick={()=>move(-1)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m11 6-6 6 6 6M5 12h14" /></svg></button><button className="carousel-button" id="work-next" type="button" aria-label="다음 프로젝트" onClick={()=>move(1)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m13 6 6 6-6 6M5 12h14" /></svg></button></div><div className="carousel-dots" id="work-dots" role="group" aria-label="프로젝트 바로가기">{items.map((item,index)=><button key={item[5]} type="button" className="carousel-dot" aria-label={`${index+1}번 프로젝트 보기`} aria-current={index===logical} onClick={()=>goTo(items.length+index)}/>)}</div></section>
}
