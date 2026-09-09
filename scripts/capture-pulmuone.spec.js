const { test } = require('@playwright/test');

const target = 'https://icerence.github.io/kiwik-project/';

async function capture(page, viewport, output, zoom) {
  await page.setViewportSize(viewport);
  await page.goto(target, { waitUntil: 'networkidle' });

  const closeButton = page.getByRole('button', { name: '닫기', exact: true });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  await page.evaluate((value) => {
    document.documentElement.style.zoom = String(value);
  }, zoom);
  await page.waitForTimeout(800);
  await page.screenshot({ path: output });
}

test.use({ channel: 'chrome', deviceScaleFactor: 2 });

test('capture clean mobile Pulmuone screen', async ({ page }) => {
  await capture(page, { width: 393, height: 852 }, 'assets/images/pulmuone-mobile-screen.png', 1.14);
});
