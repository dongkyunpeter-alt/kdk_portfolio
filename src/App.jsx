import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { copyText, scrollPageToTop } from './utils/uiActions.mjs';
import { useReducedMotion } from './hooks/useReducedMotion.js';

const EMAIL='dongkyunpeter@gmail.com';
const GMAIL=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}`;

gsap.registerPlugin(ScrollTrigger,MorphSVGPlugin);

const FOOTER_LINE_DOWN='M0 1C200 1 340 52 500 52S800 1 1000 1';
const FOOTER_LINE_CENTER='M0 1C200 1 340 1 500 1S800 1 1000 1';

function useSmoothScroll(enabled,scrollSmoother){
  const reducedMotion=useReducedMotion();
  useEffect(()=>{
    if(!enabled||!scrollSmoother||reducedMotion)return;
    const smoother=scrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:.3,effects:true,normalizeScroll:true});
    const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    return()=>{cancelAnimationFrame(frame);smoother.kill()};
  },[enabled,scrollSmoother,reducedMotion]);
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
  const reducedMotion=useReducedMotion();
  const logoRef=useRef(null);
  const [menuOpen,setMenuOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const logo=logoRef.current,outline=logo?.querySelector('.common-logo-outline'),fill=logo?.querySelector('.common-logo-fill');
    if(!logo||!outline||!fill)return;
    if(reducedMotion){gsap.set(outline,{opacity:0});gsap.set(fill,{opacity:1});return}
    const timeline=gsap.timeline();
    timeline.set(outline,{opacity:1,strokeDasharray:'180 180',strokeDashoffset:180})
      .set(fill,{opacity:0},0)
      .to(outline,{strokeDashoffset:0,duration:1.45,ease:'power2.inOut'},.15)
      .to(fill,{opacity:1,duration:.38,ease:'power1.out'},'-=.08')
      .to(outline,{opacity:0,duration:.32,ease:'power1.out'},'<');
    return()=>timeline.revert();
  },[reducedMotion]);
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
      // 새로고침은 섹션 링크로 새로 진입하는 경우와 구분합니다.
      if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
      scrollTo({top:0,behavior:'instant'});
    }
    const align=(initial=false)=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        if(location.hash==='#profile')centerProfileCard();
        else if(initial&&location.hash==='#projects'){
          // 다른 페이지에서 온 해시는 React가 섹션을 만든 뒤에 맞춥니다.
          document.getElementById('projects')?.scrollIntoView({block:'start',behavior:'instant'});
        }
      });
    };
    document.fonts.ready.then(()=>{
      if(cancelled)return;
      if(reloading)scrollTo({top:0,behavior:'instant'});
      else align(true);
    });
    const onHashChange=()=>align();
    addEventListener('hashchange',onHashChange);
    return()=>{cancelled=true;cancelAnimationFrame(frame);removeEventListener('hashchange',onHashChange);history.scrollRestoration=previousRestoration};
  },[isHome]);
  return <header className={`site-header common-header${scrolled?' is-scrolled':''}`}><div className="wrap common-header-inner"><a ref={logoRef} className="logo common-logo" href={isHome?'#top':'index.html'} aria-label="강동균 포트폴리오 메인으로 이동"><svg viewBox="0 0 64 32" aria-hidden="true"><text className="common-logo-outline" x="1" y="27">KDK</text><text className="common-logo-fill" x="1" y="27">KDK</text></svg></a><nav className={`nav common-nav${menuOpen?' open':''}`} id="nav" aria-label="주요 메뉴"><a href={`${home}#profile`} onClick={openProfile}>Profile</a><a href={`${home}#projects`} onClick={close}>Projects</a><a href="#contact" onClick={close}>Contact</a></nav><div className="header-actions common-actions"><a className="pill" href={GMAIL} target="_blank" rel="noreferrer"><span className="magnetic-label">Email ↗</span></a><a className="pill dark" href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noreferrer"><span className="magnetic-label">GitHub ↗</span></a></div><button className="menu menu-button common-menu" id="menu" type="button" aria-controls="nav" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}><span data-menu-label>{menuOpen?'Close':'Menu'}</span> ☰</button></div></header>;
}

function Footer(){
  const reducedMotion=useReducedMotion();
  const footerRef=useRef(null); const lineRef=useRef(null);
  const [copyStatus,setCopyStatus]=useState('idle');
  const copyTimer=useRef(0),copyBusy=useRef(false),copyRequest=useRef(0);
  useEffect(()=>()=>{clearTimeout(copyTimer.current);copyRequest.current+=1},[]);
  const copy=async()=>{
    if(copyBusy.current)return;
    copyBusy.current=true;
    const request=++copyRequest.current;
    clearTimeout(copyTimer.current);
    setCopyStatus('pending');
    const success=await copyText(EMAIL);
    if(request!==copyRequest.current)return;
    copyBusy.current=false;
    setCopyStatus(success?'success':'error');
    copyTimer.current=setTimeout(()=>setCopyStatus('idle'),success?1600:5000);
  };
  useEffect(()=>{
    const footer=footerRef.current,path=lineRef.current;
    if(!footer||!path)return;
    if(reducedMotion){gsap.set(path,{morphSVG:FOOTER_LINE_CENTER});return}
    const context=gsap.context(()=>{
      ScrollTrigger.create({
        trigger:footer,
        start:'top bottom',
        onEnter:self=>{
          const variation=gsap.utils.clamp(0,.7,Math.abs(self.getVelocity())/10000);
          gsap.fromTo(path,{morphSVG:FOOTER_LINE_DOWN},{duration:1.85,morphSVG:FOOTER_LINE_CENTER,ease:`elastic.out(${1.4+variation*.6}, ${.42-variation*.14})`,overwrite:true});
        },
      });
    },footer);
    return()=>{context.revert();gsap.killTweensOf(path);path.setAttribute('d',FOOTER_LINE_CENTER)};
  },[reducedMotion]);
  return <footer ref={footerRef} className="footer common-footer" id="contact"><svg className="footer-bounce-line" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true"><path ref={lineRef} d={FOOTER_LINE_CENTER}/></svg><div className="wrap"><div className="common-footer-grid"><div><h2>다음 화면을 함께<br/>디자인할 준비가 되어 있습니다.</h2></div><div className="common-footer-contact"><h3>CONTACT</h3><div className="common-contact-list"><div className="common-contact-item common-email-row"><a href={GMAIL} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z"/><path d="m4 7 8 6 8-6"/></svg><span>{EMAIL}</span></a><button className="common-copy-email" type="button" aria-label="이메일 주소 복사" aria-describedby="email-copy-status" disabled={copyStatus==='pending'} onClick={copy}><span className="common-copy-label">{copyStatus==='success'?'복사됨':copyStatus==='error'?'복사 실패':copyStatus==='pending'?'복사 중':'복사'}</span></button><span id="email-copy-status" role="status" className="email-copy-status" data-state={copyStatus}>{copyStatus==='error'?'복사하지 못했습니다. 이메일 주소를 직접 선택해 복사해 주세요.':copyStatus==='success'?'이메일 주소가 복사되었습니다.':''}</span></div><div className="common-contact-item"><a href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true" className="github-icon"><path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.2c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.74-1.55-2.58-.3-5.3-1.29-5.3-5.74 0-1.27.45-2.3 1.2-3.12-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.2 1.2A11.1 11.1 0 0 1 12 6.04c.98 0 1.98.13 2.9.39 2.22-1.5 3.2-1.2 3.2-1.2.63 1.6.23 2.79.11 3.08.74.81 1.2 1.85 1.2 3.12 0 4.46-2.73 5.44-5.32 5.73.42.36.79 1.07.79 2.15v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg><span>GitHub ↗</span></a></div></div></div></div><div className="common-copyright"><span>© 2026 Kang Donggyun. All rights reserved.</span><span>Web Publishing · Responsive UI · Design System</span></div></div></footer>;
}

function ScrollProgress(){
  const progressRef=useRef(null);
  useEffect(()=>{let frame=0;const update=()=>{frame=0;const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?Math.min(1,Math.max(0,scrollY/max)):0;progressRef.current?.style.setProperty('--scroll-progress',progress)};const requestUpdate=()=>{if(!frame)frame=requestAnimationFrame(update)};update();addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);return()=>{removeEventListener('scroll',requestUpdate);removeEventListener('resize',requestUpdate);if(frame)cancelAnimationFrame(frame)}},[]);
  return <div ref={progressRef} className="project-scroll-progress" aria-hidden="true"><span /></div>;
}

function useMagneticButtons(){
  const reducedMotion=useReducedMotion();
  useEffect(()=>{
    const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
    if(!finePointer.matches||reducedMotion)return;

    const buttons=[...document.querySelectorAll('.pill,.project-card-actions a')];
    const cleanups=buttons.map(button=>{
      const label=button.querySelector('.magnetic-label');
      let bounds=null;
      const moveX=gsap.quickTo(button,'x',{duration:.38,ease:'power3.out'});
      const moveY=gsap.quickTo(button,'y',{duration:.38,ease:'power3.out'});
      const moveLabelX=label?gsap.quickTo(label,'x',{duration:.42,ease:'power3.out'}):null;
      const moveLabelY=label?gsap.quickTo(label,'y',{duration:.42,ease:'power3.out'}):null;
      const measure=()=>{bounds=button.getBoundingClientRect()};
      const move=event=>{
        if(!bounds)measure();
        const centerX=bounds.left+bounds.width/2;
        const centerY=bounds.top+bounds.height/2;
        const deltaX=event.clientX-centerX;
        const deltaY=event.clientY-centerY;
        // 낮은 버튼도 위·아래 가장자리에서 충분히 반응하도록 높이로 정규화합니다.
        const verticalRatio=gsap.utils.clamp(-1,1,deltaY/Math.max(1,bounds.height/2));
        moveX(gsap.utils.clamp(-15,15,deltaX*.27));
        moveY(verticalRatio*15);
        moveLabelX?.(gsap.utils.clamp(-12,12,deltaX*.21));
        moveLabelY?.(verticalRatio*8);
      };
      const reset=()=>{
        bounds=null;
        // quickTo가 관리하는 tween을 별도 tween으로 덮어쓰지 않아야
        // 포인터가 다시 진입했을 때도 같은 인스턴스를 계속 재사용할 수 있습니다.
        moveX(0);
        moveY(0);
        moveLabelX?.(0);
        moveLabelY?.(0);
      };

      button.classList.add('magnetic-ready');
      button.addEventListener('pointerenter',measure);
      button.addEventListener('pointermove',move);
      button.addEventListener('pointerleave',reset);
      button.addEventListener('blur',reset);

      return()=>{
        button.removeEventListener('pointerenter',measure);
        button.removeEventListener('pointermove',move);
        button.removeEventListener('pointerleave',reset);
        button.removeEventListener('blur',reset);
        button.classList.remove('magnetic-ready');
        gsap.killTweensOf(button);
        gsap.set(button,{clearProps:'x,y'});
        if(label){gsap.killTweensOf(label);gsap.set(label,{clearProps:'x,y'})}
      };
    });

    return()=>cleanups.forEach(cleanup=>cleanup());
  },[reducedMotion]);
}

function usePageEffects(isHome){useEffect(()=>{document.title=isHome?'강동균 — Web Portfolio':'풀무원 웹 리뉴얼 — 강동균 포트폴리오';document.documentElement.classList.add('motion-ready');const nodes=[...document.querySelectorAll(isHome?'.home-reveal':'.reveal,.section-title,.intro h2,.process-head h2,.closing h2')];nodes.forEach(node=>{if(node.matches('.section-title,.intro h2,.process-head h2,.closing h2'))node.classList.add('text-reveal')});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(isHome)entry.target.setAttribute('data-revealed','true');else entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect()},[isHome])}

export default function App({Page,isHome,scrollSmoother}){const [showTop,setShowTop]=useState(false);useSmoothScroll(!isHome,scrollSmoother);usePageEffects(isHome);useMagneticButtons();useEffect(()=>{if(isHome)return;const handler=()=>setShowTop(scrollY>420);addEventListener('scroll',handler,{passive:true});return()=>removeEventListener('scroll',handler)},[isHome]);return <><a className="skip" href="#main">본문으로 건너뛰기</a><Header isHome={isHome}/><ScrollProgress/><div id="smooth-wrapper"><div id="smooth-content"><Page/><Footer isHome={isHome}/></div></div>{!isHome&&<button id="back-to-top" className={`back-to-top${showTop?' show':''}`} type="button" aria-label="맨 위로 이동" onClick={()=>scrollPageToTop({smoother:scrollSmoother?.get(),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,scrollTo:options=>window.scrollTo(options)})}>↑</button>}</>}
