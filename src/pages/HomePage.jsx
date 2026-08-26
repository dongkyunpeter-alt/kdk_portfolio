import { useEffect, useMemo, useRef, useState } from 'react';
import { portfolioProjects } from '../data/projects.js';
import { createParkWorld, moveInPark, safeParkPosition } from '../game/parkPhysics.mjs';

const STATE_KEY='kdk-project-bones-v2';
const initialGame=()=>{try{return {...{collected:[],unlockedProjects:[],x:24,y:150},...JSON.parse(localStorage.getItem(STATE_KEY)||'{}')}}catch{return {collected:[],unlockedProjects:[],x:24,y:150}}};

function GitHubIcon(){
  return <svg className="project-button-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.123-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.628-5.479 5.925.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
}

function ProjectGrid({game,setGame}){
  const wallet=Math.max(0,game.collected.length-game.unlockedProjects.length);
  const unlock=slug=>{if(!wallet||game.unlockedProjects.includes(slug))return;setGame(value=>({...value,unlockedProjects:[...value.unlockedProjects,slug]}));};
  return <div className="project-grid" id="project-grid">{portfolioProjects.map(project=>{
    const locked=project.requiresUnlock&&!game.unlockedProjects.includes(project.slug);
    const published=project.status==='published';
    return <article key={project.slug} className={`project-card home-reveal${locked?' is-locked':''}`} data-status={project.status} data-slug={project.slug}>
      <div className="project-media">{project.thumbnail?<img src={project.thumbnail} alt={`${project.title} 프로젝트 미리보기`} width="800" height="450"/>:<div className="project-placeholder">PROJECT SLOT</div>}</div>
      <div className="project-body">
        <span className="project-category">{project.category}</span><h3>{project.title}</h3>
        <dl className="project-facts">
          <div><dt>작업기간</dt><dd>{published?project.period:'추가 예정'}</dd></div>
          <div><dt>담당 업무</dt><dd className="project-role">{published?project.description:'추가 예정'}</dd></div>
          <div><dt>사용 기술</dt><dd>{project.technologies||'추가 예정'}</dd></div>
          <div><dt>기여도</dt><dd className="project-contributions">{project.contributions?.map(({page,percent})=><span key={page}>{page}<strong>{percent}%</strong></span>)||'추가 예정'}</dd></div>
        </dl>
        {published?<p className="project-portfolio-note">자세한 작업 내용과 과정은 포트폴리오에서 확인해 주세요.</p>:<div className="project-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
      </div>
      {locked?<button className="project-lock" type="button" data-unlock={project.slug} disabled={!wallet} onClick={()=>unlock(project.slug)}>{wallet?'🦴 1개로 해금':'🦴 뼈가 필요해요'}</button>:!published?<span className="project-lock">COMING SOON</span>:<a className="project-link" href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} 사이트 보기 (새 탭)`}/>}
      <div className="project-card-actions" aria-label={`${project.title} 관련 링크`}>
        {[['포트폴리오',project.portfolio,false],['깃허브',project.github,true],['사이트',project.href,true]].map(([label,href,external])=>locked||!href?<button key={label} type="button" disabled>{label==='깃허브'&&<GitHubIcon/>}{label}</button>:<a key={label} href={href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} aria-label={`${project.title} ${label}${external?' (새 탭)':''}`}>{label==='깃허브'&&<GitHubIcon/>}{label}{external?' ↗':' →'}</a>)}
      </div>
    </article>;
  })}</div>;
}

function CursorMongi(){
  const followerRef=useRef(null); const target=useRef({x:innerWidth/2,y:innerHeight/2}); const current=useRef({...target.current}); const appeared=useRef(false); const raf=useRef(0); const timers=useRef([]); const [visible,setVisible]=useState(false); const [state,setState]=useState('walk');
  useEffect(()=>{if(!matchMedia('(pointer:fine)').matches)return;const animate=()=>{const node=followerRef.current;if(!node)return;current.current.x+=(target.current.x-current.current.x)*.48;current.current.y+=(target.current.y-current.current.y)*.48;const flip=target.current.x<current.current.x?-1:1;node.style.transform=`translate3d(${current.current.x}px,${current.current.y}px,0) scaleX(${flip})`;raf.current=Math.abs(target.current.x-current.current.x)+Math.abs(target.current.y-current.current.y)>.35?requestAnimationFrame(animate):0};const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[]};const move=event=>{if(event.pointerType!=='mouse')return;target.current={x:Math.max(4,Math.min(innerWidth-78,event.clientX+4)),y:Math.max(4,Math.min(innerHeight-78,event.clientY+6))};if(!appeared.current){appeared.current=true;current.current={...target.current}}setVisible(true);setState('walk');clearTimers();timers.current=[setTimeout(()=>setState('stand'),140),setTimeout(()=>setState('sit'),1500),setTimeout(()=>setState('sleep'),5000)];if(!raf.current)raf.current=requestAnimationFrame(animate)};addEventListener('pointermove',move,{passive:true});return()=>{removeEventListener('pointermove',move);clearTimers();cancelAnimationFrame(raf.current)}},[]);
  return <div ref={followerRef} className={`cursor-mongi${visible?' show':''}`} data-state={state} aria-hidden="true"/>;
}

function BoneGame({game,setGame,introReady}){
  const arenaRef=useRef(null); const mungiRef=useRef(null); const boneRefs=useRef([]); const controls=useRef({}); const [motion,setMotion]=useState('stand'); const [direction,setDirection]=useState('front'); const [message,setMessage]=useState(''); const complete=game.collected.length===3; const wallet=Math.max(0,game.collected.length-game.unlockedProjects.length); const positions=[[18,23],[52,78],[81,39]];
  useEffect(()=>{localStorage.setItem(STATE_KEY,JSON.stringify(game));},[game]);
  useEffect(()=>{
    // 화면 회전·크기 변경 후에도 몽이가 맵 바깥에 남지 않도록 보정합니다.
    const arena=arenaRef.current;
    const clamp=()=>{const dog=mungiRef.current;if(!arena||!dog)return;const world=createParkWorld(arena.clientWidth,arena.clientHeight,dog.offsetWidth);setGame(value=>{const {x,y}=safeParkPosition(value,world);return x===value.x&&y===value.y?value:{...value,x,y}})};
    const observer=new ResizeObserver(clamp);if(arena)observer.observe(arena);clamp();return()=>observer.disconnect();
  },[setGame]);
  useEffect(()=>{
    const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
    // 입력 출처를 구분해 같은 방향의 키와 화면 버튼이 서로를 해제하지 않게 합니다.
    const inputs=new Map();
    let frame=0,last=0,timers=[];
    const clearIdle=()=>{timers.forEach(clearTimeout);timers=[]};
    const stopFrame=()=>{cancelAnimationFrame(frame);frame=0};
    const idle=()=>{
      clearIdle();setMotion('stand');
      if(complete||document.hidden||inputs.size)return;
      timers=[setTimeout(()=>setMotion('sit'),1100),setTimeout(()=>setMotion('sleep'),4300)];
    };
    const translate=(dx,dy)=>{
      const arena=arenaRef.current,dog=mungiRef.current;
      if(!arena||!dog)return;
      const world=createParkWorld(arena.clientWidth,arena.clientHeight,dog.offsetWidth);
      setGame(value=>({...value,...moveInPark(value,dx,dy,world)}));
    };
    const face=dir=>setDirection(dir==='up'?'back':dir==='down'?'front':dir);
    const loop=time=>{
      frame=0;
      if(complete||!inputs.size)return;
      const scale=Math.min((time-last)/16.67,2);last=time;
      const directions=new Set(inputs.values());
      const dx=Number(directions.has('right'))-Number(directions.has('left'));
      const dy=Number(directions.has('down'))-Number(directions.has('up'));
      if(dx||dy){const length=Math.hypot(dx,dy);translate(dx/length*5.4*scale,dy/length*5.4*scale);face(dy<0?'up':dy>0?'down':dx<0?'left':'right');setMotion('walk')}
      else setMotion('stand');
      frame=requestAnimationFrame(loop);
    };
    const press=(source,dir)=>{
      if(complete||document.hidden)return;
      clearIdle();inputs.set(source,dir);face(dir);setMotion('walk');
      if(!frame){last=performance.now();frame=requestAnimationFrame(loop)}
    };
    const release=source=>{
      if(!inputs.delete(source))return;
      if(!inputs.size){stopFrame();idle()}
    };
    const resetInput=()=>{inputs.clear();stopFrame();idle()};
    const step=dir=>{
      if(complete)return;
      clearIdle();face(dir);const delta={up:[0,-32],down:[0,32],left:[-32,0],right:[32,0]}[dir];
      translate(...delta);idle();
    };
    const down=e=>{const dir=keys[e.code];if(!dir||complete||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;e.preventDefault();press(`key:${e.code}`,dir)};
    const up=e=>release(`key:${e.code}`);
    controls.current={press,release,reset:resetInput,step};
    resetInput();
    addEventListener('keydown',down);addEventListener('keyup',up);
    addEventListener('blur',resetInput);document.addEventListener('visibilitychange',resetInput);
    return()=>{
      clearIdle();stopFrame();inputs.clear();controls.current={};
      removeEventListener('keydown',down);removeEventListener('keyup',up);
      removeEventListener('blur',resetInput);document.removeEventListener('visibilitychange',resetInput);
    };
  },[complete,setGame]);
  useEffect(()=>{if(complete||!mungiRef.current)return;const dog=mungiRef.current.getBoundingClientRect();boneRefs.current.forEach((bone,index)=>{if(!bone||game.collected.includes(index))return;const target=bone.getBoundingClientRect();const overlaps=dog.left<target.right&&dog.right>target.left&&dog.top<target.bottom&&dog.bottom>target.top;if(!overlaps)return;setGame(value=>value.collected.includes(index)?value:{...value,collected:[...value.collected,index]});setMessage('뼈다귀 획득! '+Math.min(game.collected.length+1,3)+'/3')});},[game.x,game.y,game.collected,complete,setGame]);
  const quick=()=>{controls.current.reset?.();setGame(value=>({...value,collected:[0,1,2]}));setMessage('뼈 3개를 받았습니다. 프로젝트를 선택하세요.')};
  const reset=()=>{controls.current.reset?.();localStorage.removeItem(STATE_KEY);const arena=arenaRef.current,dog=mungiRef.current;const spawn=safeParkPosition({x:24,y:150},createParkWorld(arena?.clientWidth||400,arena?.clientHeight||320,dog?.offsetWidth||82));setGame({collected:[],unlockedProjects:[],...spawn});setMotion('stand');setDirection('front');setMessage('')};
  const move=dir=>{arenaRef.current?.focus({preventScroll:true});controls.current.step?.(dir)};
  const stopPad=dir=>controls.current.release?.(`pad:${dir}`);
  const startPad=(dir,event)=>{if(complete)return;event.preventDefault();event.currentTarget.setPointerCapture?.(event.pointerId);arenaRef.current?.focus({preventScroll:true});controls.current.press?.(`pad:${dir}`,dir)};
  return <><div className={`game-drop-stage${introReady?' is-ready':''}`}><section className="game-shell arcade-shell" aria-labelledby="game-title">
    <div className="game-head arcade-hud"><div className="game-mission"><small>MISSION</small><h2 id="game-title">뼈다귀 3개를 모아 프로젝트를 해금하세요!</h2></div><div className="game-counter"><span aria-hidden="true">🦴</span><output id="bone-count" aria-live="polite"><strong>{game.collected.length} / 3</strong><small>{wallet}개 보유</small></output></div><div className="game-meta"><span className="status-label">STATUS</span><span className="status-lights" aria-hidden="true">{[0,1,2].map(index=><i key={index} className={game.collected.length>index?'is-on':''}/>)}</span><div className="game-actions"><button id="game-reset" type="button" onClick={reset}>다시 시작 ↻</button></div></div></div>
    <div className="mobile-game-guide"><span>1. 몽이를 움직여 뼈를 찾으세요.</span><span>2. 뼈 1개로 프로젝트 1개를 열 수 있어요.</span></div>
    <div className="arcade-screen"><div className="game-arena park-map" id="game-arena" ref={arenaRef} tabIndex="0" role="application" aria-label={complete?'미니게임 완료. 뼈다귀로 프로젝트를 해금할 수 있습니다.':'WASD 또는 방향키로 몽이를 움직여 뼈다귀 세 개를 모으는 게임'}>
      {/* 선택한 1번 시안은 배경으로, 캐릭터와 뼈는 독립된 게임 요소로 유지합니다. */}
      <span className="game-zone">WASD로 조작</span>
      <div className="mungi" id="mungi" ref={mungiRef} data-direction={direction} data-motion={motion} role="img" aria-label="몽이 캐릭터" style={{left:game.x,top:game.y,visibility:complete?'hidden':'visible'}}/>
      {positions.map(([left,top],index)=>!game.collected.includes(index)&&<button key={index} className="bone" ref={node=>{boneRefs.current[index]=node}} type="button" aria-label={`${index+1}번째 뼈다귀`} style={{left:`calc(${left}% - 21px)`,top:`calc(${top}% - 21px)`}} onClick={()=>setGame(v=>({...v,collected:[...new Set([...v.collected,index])]}))}>🦴</button>)}
      <output className={`game-message${message?' show':''}`} id="game-message" aria-live="polite">{message}</output>
    </div></div>
    <div className="arcade-controls"><span className="speaker" aria-hidden="true"/><div><div className="dpad" aria-label="몽이 이동 버튼">{[['up','↑','위로'],['left','←','왼쪽으로'],['down','↓','아래로'],['right','→','오른쪽으로']].map(([dir,label,aria])=><button key={dir} type="button" data-move={dir} aria-label={aria} disabled={complete} onPointerDown={event=>startPad(dir,event)} onPointerUp={()=>stopPad(dir)} onPointerCancel={()=>stopPad(dir)} onLostPointerCapture={()=>stopPad(dir)} onClick={event=>{if(event.detail===0)move(dir)}}>{label}</button>)}</div></div><div className="auto-pickup"><button id="quick-unlock" type="button" aria-label="게임 건너뛰기" disabled={complete} onClick={quick}>SKIP</button></div><span className="speaker" aria-hidden="true"/></div>
  </section><span className="landing-dust dust-left" aria-hidden="true"/><span className="landing-dust dust-right" aria-hidden="true"/></div>{complete&&<CursorMongi/>}</>;
}

export default function HomePage(){const [game,setGame]=useState(initialGame);const [heroVisible,setHeroVisible]=useState(false);const [profileVisible,setProfileVisible]=useState(false);const profileRef=useRef(null);useEffect(()=>{let cancelled=false;const show=async()=>{await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!cancelled)setHeroVisible(true)}))};show();return()=>{cancelled=true}},[]);useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setProfileVisible(entry.isIntersecting),{threshold:0});if(profileRef.current)observer.observe(profileRef.current);return()=>observer.disconnect()},[]);return <main id="main"><section className="hero wrap" id="top"><div className="hero-grid"><div className={`motion-ready${heroVisible?' is-visible':''}`}><p className="eyebrow">〈 WEB PUBLISHER · PORTFOLIO 〉</p><h1 className="display"><span className="display-kicker">균형 잡힌 인재</span><span className="display-name-line"><span className="display-name">강동균</span><span className="display-suffix">입니다.</span></span></h1><p className="hero-desc">디자인을 이해하고,<br />사용하기 편한 웹 화면으로 구현합니다.</p><div className="hero-actions"><a className="pill dark" href="#projects">프로젝트 보기</a><a className="pill" href={`mailto:${'dongkyunpeter@gmail.com'}`}>이메일 보내기</a></div></div><BoneGame game={game} setGame={setGame} introReady={heroVisible}/></div></section><section ref={profileRef} className={`profile${profileVisible?' is-visible':''}`} id="profile"><div className="wrap profile-card home-reveal"><div className="profile-portrait" aria-hidden="true"></div><div className="profile-copy"><p className="eyebrow">〈 ABOUT ME 〉</p><h2 className="profile-name">강동균</h2><ul className="profile-list"><li><strong>BIRTH</strong><span><time dateTime="2003-01-03">2003.01.03</time></span></li><li><strong>LOCATION</strong><span>서울특별시 노원구</span></li><li><strong>EDUCATION</strong><span>서울 청원고등학교 졸업</span></li><li><strong>CERTIFICATIONS</strong><span>컴퓨터활용능력 2급 · 자동차운전면허 1종 보통</span></li><li><strong>TOOLS</strong><span>HTML5 · CSS3 · JavaScript · Tailwind CSS · GSAP · Swiper · Figma · AI CLI Tools</span></li></ul><div className="profile-contact"><a className="pill dark" href="mailto:dongkyunpeter@gmail.com">이메일 보내기</a><a className="pill" href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noreferrer">GitHub ↗</a></div></div></div></section><section className="projects" id="projects"><div className="wrap"><div className="section-head home-reveal"><div><p className="eyebrow">〈 SELECTED PROJECTS 〉</p><h2>Projects</h2></div></div><ProjectGrid game={game} setGame={setGame}/></div></section></main>}
