import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import HomePage from './pages/HomePage.jsx';
import PulmuonePage from './pages/PulmuonePage.jsx';

const EMAIL='dongkyunpeter@gmail.com';
const GMAIL=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}`;

gsap.registerPlugin(ScrollTrigger,ScrollSmoother);

function useSmoothScroll(enabled){
  useEffect(()=>{
    if(!enabled||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const smoother=ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:.3,effects:true,normalizeScroll:true});
    requestAnimationFrame(()=>ScrollTrigger.refresh());
    return()=>{smoother.kill();ScrollTrigger.getAll().forEach(trigger=>trigger.kill())};
  },[enabled]);
}

function centerProfileCard(){
  const card=document.querySelector('#profile .profile-card');
  if(!card)return;
  const headerHeight=document.querySelector('.common-header')?.offsetHeight||0;
  // 등장 애니메이션의 transform을 제외한 실제 레이아웃 위치를 사용합니다.
  let top=0;
  for(let node=card;node;node=node.offsetParent)top+=node.offsetTop;
  const availableHeight=innerHeight-headerHeight;
  const gap=Math.max(16,(availableHeight-card.offsetHeight)/2);
  scrollTo({top:Math.max(0,top-headerHeight-gap),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}

function Header({isHome}){
  const [menuOpen,setMenuOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const onScroll=()=>setScrolled(scrollY>90);const onKey=event=>{if(event.key==='Escape'){setMenuOpen(false)}};addEventListener('scroll',onScroll,{passive:true});addEventListener('keydown',onKey);return()=>{removeEventListener('scroll',onScroll);removeEventListener('keydown',onKey)}},[]);
  const home=isHome?'':'index.html'; const close=()=>{setMenuOpen(false)};
  const openProfile=event=>{
    close();
    if(!isHome||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
    requestAnimationFrame(centerProfileCard);
  };
  useEffect(()=>{
    if(!isHome)return;
    let cancelled=false,frame=0;
    const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
    const previousRestoration=history.scrollRestoration;
    history.scrollRestoration='manual';
    if(reloading){
      if(location.hash==='#profile')history.replaceState(history.state,'',location.pathname+location.search);
      scrollTo({top:0,behavior:'instant'});
    }
    const align=()=>{if(location.hash==='#profile')frame=requestAnimationFrame(centerProfileCard)};
    document.fonts.ready.then(()=>{if(cancelled)return;if(reloading)scrollTo({top:0,behavior:'instant'});else align()});
    addEventListener('hashchange',align);
    return()=>{cancelled=true;cancelAnimationFrame(frame);removeEventListener('hashchange',align);history.scrollRestoration=previousRestoration};
  },[isHome]);
  return <header className={`site-header common-header${scrolled?' is-scrolled':''}`}><div className="wrap common-header-inner"><a className="logo common-logo" href={isHome?'#top':'index.html'} aria-label="강동균 포트폴리오 메인으로 이동">KDK</a><nav className={`nav common-nav${menuOpen?' open':''}`} id="nav" aria-label="주요 메뉴"><a href={`${home}#profile`} onClick={openProfile}>Profile</a><a href={`${home}#projects`} onClick={close}>Projects</a><a href="#contact" onClick={close}>Contact</a></nav><div className="header-actions common-actions"><a className="pill" href={GMAIL} target="_blank" rel="noreferrer">Email ↗</a><a className="pill dark" href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noreferrer">GitHub ↗</a></div><button className="menu menu-button common-menu" id="menu" type="button" aria-controls="nav" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}><span data-menu-label>{menuOpen?'Close':'Menu'}</span> ☰</button></div></header>;
}

function Footer(){
  const [copied,setCopied]=useState(false); const copy=async()=>{try{await navigator.clipboard.writeText(EMAIL)}catch{}setCopied(true);setTimeout(()=>setCopied(false),1600)};
  return <footer className="footer common-footer" id="contact"><div className="wrap"><div className="common-footer-grid"><div><h2>다음 화면을 함께<br/>구현할 준비가 되어 있습니다.</h2></div><div className="common-footer-contact"><h3>CONTACT</h3><div className="common-contact-list"><div className="common-contact-item common-email-row"><a href={GMAIL} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z"/><path d="m4 7 8 6 8-6"/></svg><span>{EMAIL}</span></a><button className="common-copy-email" type="button" aria-label="이메일 주소 복사" onClick={copy}>{copied?'복사됨':'복사'}</button></div><div className="common-contact-item"><a href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true" className="github-icon"><path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.2c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.74-1.55-2.58-.3-5.3-1.29-5.3-5.74 0-1.27.45-2.3 1.2-3.12-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.2 1.2A11.1 11.1 0 0 1 12 6.04c.98 0 1.98.13 2.9.39 2.22-1.5 3.2-1.2 3.2-1.2.63 1.6.23 2.79.11 3.08.74.81 1.2 1.85 1.2 3.12 0 4.46-2.73 5.44-5.32 5.73.42.36.79 1.07.79 2.15v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg><span>GitHub ↗</span></a></div></div></div></div><div className="common-copyright"><span>© 2026 Kang Donggyun. All rights reserved.</span><span>Web Publishing · Responsive UI · Design System</span></div></div></footer>;
}

function ScrollProgress(){
  const progressRef=useRef(null);
  useEffect(()=>{let frame=0;const update=()=>{frame=0;const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?Math.min(1,Math.max(0,scrollY/max)):0;progressRef.current?.style.setProperty('--scroll-progress',progress)};const requestUpdate=()=>{if(!frame)frame=requestAnimationFrame(update)};update();addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);return()=>{removeEventListener('scroll',requestUpdate);removeEventListener('resize',requestUpdate);if(frame)cancelAnimationFrame(frame)}},[]);
  return <div ref={progressRef} className="project-scroll-progress" aria-hidden="true"><span /></div>;
}

function usePageEffects(isHome){useEffect(()=>{document.title=isHome?'강동균 — Web Portfolio':'풀무원 웹 리뉴얼 — 강동균 포트폴리오';document.documentElement.classList.add('motion-ready');const nodes=[...document.querySelectorAll(isHome?'.home-reveal':'.reveal,.section-title,.intro h2,.process-head h2,.closing h2')];nodes.forEach(node=>{if(node.matches('.section-title,.intro h2,.process-head h2,.closing h2'))node.classList.add('text-reveal')});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(isHome)entry.target.setAttribute('data-revealed','true');else entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect()},[isHome])}

export default function App(){const isHome=!location.pathname.endsWith('/pulmuone.html');const [showTop,setShowTop]=useState(false);useSmoothScroll(!isHome);usePageEffects(isHome);useEffect(()=>{if(isHome)return;const handler=()=>setShowTop(scrollY>420);addEventListener('scroll',handler,{passive:true});return()=>removeEventListener('scroll',handler)},[isHome]);return <><a className="skip" href="#main">본문으로 건너뛰기</a><Header isHome={isHome}/><ScrollProgress/><div id="smooth-wrapper"><div id="smooth-content">{isHome?<HomePage/>:<PulmuonePage/>}<Footer isHome={isHome}/></div></div>{!isHome&&<button id="back-to-top" className={`back-to-top${showTop?' show':''}`} type="button" aria-label="맨 위로 이동" onClick={()=>ScrollSmoother.get()?.scrollTo(0,true)}>↑</button>}</>}
