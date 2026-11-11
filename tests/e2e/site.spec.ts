import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const phrase = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const openCount = (page: Page) => page.locator('[data-open-count]');
const CURBS = 'a map of every free curb in Atlanta';
const BLOCKS = 'worked out all 2,035 blocks';
const SEGMENTS = "the city's server quietly dropped 769 street segments";

// clientWidth is the screen's layout width. On a phone, window.innerWidth grows to fit a page that
// is too wide, so comparing against it can never catch sideways scrolling.
const sidewaysScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function expectNoSeriousIssues(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
}

test.describe('the paragraph', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('says who, what, and when before anything is opened', async ({ page }) => {
    await expect(page.locator('[data-sentence-text]')).toContainText(
      "I'm Kenney Chen, a computer engineering student at Georgia Tech looking for a software engineering internship for Summer 2027.",
      { useInnerText: true },
    );
    await expect(page.locator('#more-school')).toBeHidden();
    await expect(openCount(page)).toHaveText('0');
    await expect(page.getByRole('link', { name: 'Resume', exact: true })).toBeVisible();
  });

  test('a phrase opens in place and closes again', async ({ page }) => {
    const curbs = phrase(page, CURBS);
    await curbs.click();
    await expect(curbs).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#more-curbs')).toBeVisible();
    await expect(page.locator('#more-curbs')).toContainText("Atlanta doesn't publish where its meters are");
    await expect(openCount(page)).toHaveText('1');
    await curbs.click();
    await expect(page.locator('#more-curbs')).toBeHidden();
    await expect(openCount(page)).toHaveText('0');
  });

  test('phrases inside phrases open all the way down to code', async ({ page }) => {
    await phrase(page, CURBS).click();
    await phrase(page, BLOCKS).click();
    await phrase(page, SEGMENTS).click();
    await expect(page.locator('#more-segments .excerpt')).toBeVisible();
    await expect(page.locator('#more-segments')).toContainText('raise RuntimeError');
    await expect(openCount(page)).toHaveText('3');
  });

  test('closing a phrase closes everything inside it', async ({ page }) => {
    await phrase(page, CURBS).click();
    await phrase(page, BLOCKS).click();
    await phrase(page, SEGMENTS).click();
    await phrase(page, CURBS).click();
    await expect(page.locator('#more-blocks')).toBeHidden();
    await expect(page.locator('#more-segments')).toBeHidden();
    await expect(openCount(page)).toHaveText('0');
  });

  test('works from the keyboard', async ({ page }) => {
    await phrase(page, 'a computer engineering student at Georgia Tech').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#more-school')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('#more-school')).toBeHidden();
  });

  test('opens and closes everything at once, without scrolling sideways', async ({ page }) => {
    const total = await page.locator('[data-phrase]').count();
    await page.getByRole('button', { name: 'Open everything' }).click();
    await expect(openCount(page)).toHaveText(String(total));
    await expect(page.locator('#more-segments')).toBeVisible();
    expect(await sidewaysScroll(page)).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Close everything' }).click();
    await expect(openCount(page)).toHaveText('0');
  });

  test('a link inside an open phrase goes to its write-up', async ({ page }) => {
    await phrase(page, CURBS).click();
    await page.locator('#more-curbs').getByRole('link', { name: 'read how it works' }).click();
    await expect(page).toHaveURL(/work\/free-curb-atl\/$/);
  });
});

test.describe('with motion on', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('words slide into place and settle, with no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    const phones = phrase(page, "an AI that answers a restaurant's phones");
    await phones.click();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await expect(page.locator('#more-phones')).toBeVisible();
    await phones.click();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    await expect(page.locator('#more-phones')).toBeHidden();
    expect(errors).toEqual([]);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every phrase is already open', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#more-school')).toBeVisible();
    await expect(page.locator('#more-segments .excerpt')).toBeVisible();
    await expect(page.locator('[data-sentence-controls]')).toBeHidden();
  });
});

test('email links are put together in the browser', async ({ page }) => {
  await page.goto('./');
  const mail = page.locator('.footer [data-mail]');
  await expect(mail).toHaveAttribute('href', 'mailto:kchen755@gatech.edu');
  await expect(mail).toHaveText('kchen755@gatech.edu');
});

test('the work list links to write-ups', async ({ page }) => {
  await page.goto('./');
  await page.locator('#work').getByRole('link', { name: 'Free Curb ATL' }).click();
  await expect(page).toHaveURL(/work\/free-curb-atl\/$/);
});

test('a write-up goes from the problem to what shipped', async ({ page }) => {
  await page.goto('work/free-curb-atl/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Free Curb ATL');
  for (const name of ['Problem', 'First try', 'What broke', 'What shipped']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await expect(page.locator('.w-broke > li')).toHaveCount(4);
  await expect(page.locator('.excerpt')).toHaveCount(2);
});

for (const path of ['./', 'work/free-curb-atl/', 'work/quill/', 'work/tuck/', 'work/this-site/', 'resume/']) {
  test(`nothing scrolls sideways on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await sidewaysScroll(page)).toBeLessThanOrEqual(0);
  });
}

test('the resume is plain, complete, and has no phone number', async ({ page }) => {
  await page.goto('resume/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kenney Chen');
  const text = await page.locator('.resume').innerText();
  expect(text).toContain('Georgia Institute of Technology');
  expect(text).not.toMatch(/\d{3}[-. ]\d{3}[-. ]\d{4}/);
});

test('a missing page says so', async ({ page }) => {
  const response = await page.goto('no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nothing here');
});

for (const path of ['./', 'work/free-curb-atl/', 'work/this-site/', 'resume/']) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousIssues(page);
  });
}

test('no serious accessibility problems with every phrase open', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Open everything' }).click();
  await expectNoSeriousIssues(page);
});
