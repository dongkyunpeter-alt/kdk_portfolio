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
            <a href="${home}#projects">Projects</a>
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
      <footer class="footer common-footer">
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
})();
