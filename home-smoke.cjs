const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('http://127.0.0.1:4392/index.html');
  await page.evaluate(() => localStorage.removeItem('kdk-project-bones-v2'));
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  const mainFonts = await page.evaluate(() => [...new Set([...document.querySelectorAll('body, body *')].map(element => getComputedStyle(element).fontFamily))]);
  assert.ok(mainFonts.every(font => font.includes('IBM Plex Sans KR') || font.includes('IBM Plex Mono')));
  assert.equal(await page.locator('.project-card').count(), 3);
  await page.locator('.common-nav-trigger').click();
  assert.equal(await page.locator('.common-nav-trigger').getAttribute('aria-expanded'), 'true');
  await page.waitForTimeout(220);
  assert.equal(await page.locator('.common-subnav').evaluate(element => getComputedStyle(element).visibility), 'visible');
  assert.equal(await page.locator('.common-subnav a').first().getAttribute('href'), 'pulmuone.html');
  assert.equal(await page.locator('.project-card.is-locked').count(), 3);
  assert.equal(await page.locator('[data-status="coming-soon"]').count(), 2);
  assert.equal(await page.locator('.bone').count(), 3);
  await page.locator('#profile').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#profile').getAttribute('class'), 'profile is-visible');
  assert.equal(await page.locator('.profile-name').textContent(), '강동균');
  assert.equal(await page.locator('.acrostic-key').count(), 0);
  await page.locator('.common-footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#profile').getAttribute('class'), 'profile');
  await page.locator('#profile').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#profile').getAttribute('class'), 'profile is-visible');
  const mainChrome = await page.evaluate(() => ({
    header: document.querySelector('.common-header').textContent.replace(/\s+/g, ' ').trim(),
    footer: document.querySelector('.common-footer').textContent.replace(/\s+/g, ' ').trim()
  }));
  const startX = await page.locator('#mungi').evaluate(element => parseFloat(element.style.left));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(160);
  await page.keyboard.up('ArrowRight');
  const movedX = await page.locator('#mungi').evaluate(element => parseFloat(element.style.left));
  assert.ok(movedX > startX);
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('#mungi').getAttribute('data-motion'), 'sit');
  await page.waitForTimeout(3500);
  assert.equal(await page.locator('#mungi').getAttribute('data-motion'), 'sleep');

  await page.getByRole('button', { name: '게임 건너뛰기' }).click();
  assert.equal(await page.locator('.project-card.is-locked').count(), 3);
  assert.equal(await page.locator('.cursor-mongi').count(), 1);
  assert.equal(await page.locator('#mungi').evaluate(element => getComputedStyle(element).visibility), 'hidden');
  assert.match(await page.locator('#bone-count').textContent(), /3개 보유/);
  await page.locator('[data-slug="pulmuone"] [data-unlock]').click();
  assert.equal(await page.locator('.project-card.is-locked').count(), 2);
  assert.match(await page.locator('#bone-count').textContent(), /2개 보유/);
  assert.equal(await page.locator('[data-slug="pulmuone"] .project-link').getAttribute('href'), 'pulmuone.html');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobile = await page.evaluate(() => ({
    columns: getComputedStyle(document.querySelector('.project-grid')).gridTemplateColumns.split(' ').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gameWidth: document.querySelector('.game-shell').getBoundingClientRect().width
  }));
  assert.equal(mobile.columns, 1);
  assert.ok(mobile.overflow <= 0);
  assert.ok(mobile.gameWidth <= 350);

  await page.goto('http://127.0.0.1:4392/pulmuone.html');
  await page.evaluate(() => document.fonts.ready);
  const detailFonts = await page.evaluate(() => [...new Set([...document.querySelectorAll('body, body *')].map(element => getComputedStyle(element).fontFamily))]);
  assert.ok(detailFonts.every(font => font.includes('IBM Plex Sans KR') || font.includes('IBM Plex Mono')));
  assert.match(await page.title(), /풀무원 웹 리뉴얼/);
  assert.equal(await page.locator('.common-logo').getAttribute('href'), 'index.html');
  const detailChrome = await page.evaluate(() => ({
    header: document.querySelector('.common-header').textContent.replace(/\s+/g, ' ').trim(),
    footer: document.querySelector('.common-footer').textContent.replace(/\s+/g, ' ').trim()
  }));
  assert.equal(detailChrome.header, mainChrome.header);
  assert.equal(detailChrome.footer, mainChrome.footer);
  assert.equal(await page.locator('.game-section').count(), 0);
  assert.equal(await page.locator('[data-game-content]').count(), 0);
  assert.equal(await page.locator('.comparison-card').count(), 2);
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#back-to-top').evaluate(element => element.classList.contains('show')), true);

  console.log(JSON.stringify({ ok: true, mobile }, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
