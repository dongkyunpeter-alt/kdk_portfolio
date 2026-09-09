const { test } = require('@playwright/test');

const target = 'https://icerence.github.io/kiwik-project/';

async function capture(page, viewport, output) {
  await page.setViewportSize(viewport);
  await page.goto(target, { waitUntil: 'networkidle' });

  const closeButton = page.getByRole('button', { name: '닫기', exact: true });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  await page.waitForTimeout(800);
  await page.screenshot({ path: output });
}

test.use({ channel: 'chrome', deviceScaleFactor: 2 });

test('capture clean responsive Pulmuone screens', async ({ page }) => {
  await capture(page, { width: 1728, height: 1117 }, 'assets/images/pulmuone-desktop-screen.png');
  await capture(page, { width: 393, height: 852 }, 'assets/images/pulmuone-mobile-screen.png');
});
