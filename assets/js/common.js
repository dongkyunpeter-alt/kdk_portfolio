(() => {
  const onHome = /(?:^|\/)index\.html$/.test(location.pathname) || location.pathname.endsWith('/');
  const home = onHome ? '' : 'index.html';
  const headerHost = document.querySelector('[data-common-header]');
  const footerHost = document.querySelector('[data-common-footer]');

  if (headerHost) {
    headerHost.outerHTML = `
      <header class="site-header common-header">
        <div class="wrap common-header-inner">
          <a class="logo common-logo" href="${home || '#top'}" aria-label="강동균 포트폴리오 메인으로 이동">KDK</a>
          <nav class="nav common-nav" id="nav" aria-label="주요 메뉴">
            <a href="${home}#profile">Profile</a>
            <div class="common-nav-group">
              <button class="common-nav-trigger" type="button" aria-expanded="false" aria-controls="project-subnav">Projects <span aria-hidden="true">▾</span></button>
              <div class="common-subnav" id="project-subnav">
                <a href="pulmuone.html"><strong>풀무원 웹 리뉴얼</strong><small>Team Project · Published</small></a>
                <span aria-disabled="true"><strong>다음 프로젝트</strong><small>Personal Project · Coming Soon</small></span>
                <span aria-disabled="true"><strong>프로젝트 추가 예정</strong><small>Web Project · Coming Soon</small></span>
              </div>
            </div>
            <a href="#contact">Contact</a>
          </nav>
          <div class="header-actions common-actions">
            <a class="pill" href="mailto:dongkyunpeter@gmail.com">Email</a>
            <a class="pill dark" href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
          <button class="menu menu-button common-menu" id="menu" type="button" aria-controls="nav" aria-expanded="false"><span data-menu-label>Menu</span> ☰</button>
        </div>
      </header>`;
  }

  if (footerHost) {
    footerHost.outerHTML = `
      <footer class="footer common-footer" id="contact">
        <div class="wrap">
          <div class="common-footer-grid">
            <div><h2>다음 화면을 함께<br>구현할 준비가 되어 있습니다.</h2><a class="pill dark" href="mailto:dongkyunpeter@gmail.com">Email 보내기</a></div>
            <div><h3>PORTFOLIO</h3><ul><li><a href="${home}#profile">Profile</a></li><li><a href="${home}#projects">Projects</a></li></ul></div>
            <div><h3>CONTACT</h3><p><a href="mailto:dongkyunpeter@gmail.com">dongkyunpeter@gmail.com</a><br><a href="https://github.com/dongkyunpeter-alt/kdk_portfolio" target="_blank" rel="noopener">GitHub ↗</a></p></div>
          </div>
          <div class="common-copyright"><span>© 2026 Kang Donggyun. All rights reserved.</span><span>Web Publishing · Responsive UI · Design System</span></div>
        </div>
      </footer>`;
  }

  const menu = document.querySelector('#menu');
  const nav = document.querySelector('#nav');
  const menuLabel = menu?.querySelector('[data-menu-label]');
  const projectTrigger = document.querySelector('.common-nav-trigger');
  const projectGroup = document.querySelector('.common-nav-group');
  const closeProjects = () => {
    projectGroup?.classList.remove('is-open');
    projectTrigger?.setAttribute('aria-expanded', 'false');
  };
  const closeMenu = () => {
    nav?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    if (menuLabel) menuLabel.textContent = 'Menu';
    closeProjects();
  };
  menu?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
    if (!open) closeProjects();
  }, true);
  projectTrigger?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    const open = projectGroup.classList.toggle('is-open');
    projectTrigger.setAttribute('aria-expanded', String(open));
  }, true);
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (projectGroup?.classList.contains('is-open')) {
      closeProjects();
      projectTrigger.focus();
    } else if (nav?.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  addEventListener('pointerdown', event => {
    if (!projectGroup?.contains(event.target)) closeProjects();
  });
})();
