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

test.describe('the first screen', () => {
  const curb = (page: Page) => page.locator('[data-curb]');
  const freeKm = async (page: Page) => Number(await curb(page).getAttribute('data-free-km'));

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await expect(curb(page)).toHaveClass(/is-running/);
  });

  test('says who, what, and when in plain words', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kenney Chen');
    await expect(page.locator('.hero-lede')).toContainText('computer engineering at Georgia Tech');
    await expect(page.locator('.hero-lede')).toContainText('software engineering internship for Summer 2027');
    await expect(page.locator('.hero-links').getByRole('link', { name: 'Resume' })).toBeVisible();
  });

  test('draws the map', async ({ page }) => {
    const inked = await page.locator('[data-curb-canvas]').evaluate((canvas: HTMLCanvasElement) => {
      const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count += 1;
      return count;
    });
    expect(inked).toBeGreaterThan(5000);
  });

  test('more curb is free on a Sunday than on a Tuesday afternoon', async ({ page }) => {
    await page.getByRole('slider', { name: /Hour/ }).fill('14');
    await page.getByRole('radio', { name: 'Tuesday' }).check({ force: true });
    await expect(page.locator('[data-curb-rule]')).toContainText('City meters are running');
    const tuesday = await freeKm(page);
    expect(tuesday).toBe(120);
    await page.getByRole('radio', { name: 'Sunday' }).check({ force: true });
    await expect(page.locator('[data-curb-time]')).toContainText('Sunday');
    await expect(page.locator('[data-curb-rule]')).toContainText('meters are off all day');
    expect(await freeKm(page)).toBeGreaterThan(tuesday + 40);
  });

  test('the hour works from the keyboard', async ({ page }) => {
    const hour = page.getByRole('slider', { name: /Hour/ });
    await hour.fill('21');
    await page.getByRole('radio', { name: 'Tuesday' }).check({ force: true });
    const before = await freeKm(page);
    await hour.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-curb-hour-name]')).toHaveText('10 PM');
    expect(await freeKm(page)).toBeGreaterThan(before);
  });

  test('playing the week moves the clock, and pausing stops it', async ({ page }) => {
    const hour = page.getByRole('slider', { name: /Hour/ });
    await hour.fill('3');
    await page.getByRole('button', { name: 'Play the week' }).click();
    await expect(hour).not.toHaveValue('3');
    await page.getByRole('button', { name: 'Pause' }).click();
    const stopped = await hour.inputValue();
    await page.waitForTimeout(900);
    await expect(hour).toHaveValue(stopped);
  });
});

test('the work filter narrows the list and brings it back', async ({ page }) => {
  await page.goto('./');
  const shown = page.locator('.work-item:visible');
  await expect(shown).toHaveCount(16);
  await page.getByRole('button', { name: 'Hardware', exact: true }).click();
  await expect(shown).toHaveCount(3);
  await expect(page.locator('#work')).toContainText('AgriNexus');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(shown).toHaveCount(16);
});

test('CourseSniper only pings when a student can act', async ({ page }) => {
  await page.goto('work/coursesniper/');
  const state = page.locator('[data-sniper-state]');
  const pings = page.locator('.sniper-msg.is-ping');
  await expect(state).toHaveText('WAITLIST OPEN');
  await page.getByRole('button', { name: 'Someone joins the waitlist' }).click();
  await expect(state).toHaveText('FULL');
  await expect(pings).toHaveCount(1);
  await expect(pings.first()).toContainText('WAITLIST OPEN → FULL');
  // A seat empties, but ten people are waiting for it, so the section is still not open.
  await page.getByRole('button', { name: 'A student drops' }).click();
  await expect(state).toHaveText('FULL');
  await expect(pings).toHaveCount(1);
  await expect(page.locator('.sniper-msg').first()).toContainText('belongs to the waitlist');
  await expect(page.getByRole('button', { name: 'A student registers' })).toBeDisabled();
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(state).toHaveText('WAITLIST OPEN');
  await expect(page.locator('.sniper-msg')).toHaveCount(0);
});

test.describe('the paragraph', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('about/');
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
    await page.goto('about/');
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

  test('the first screen still says who I am, and points to the full map', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kenney Chen');
    await expect(page.locator('.curb-nojs')).toBeVisible();
    await expect(page.locator('.curb-map')).toBeHidden();
    await expect(page.locator('.work-item')).toHaveCount(16);
  });

  test('every phrase is already open', async ({ page }) => {
    await page.goto('about/');
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

for (const path of ['./', 'about/', 'work/free-curb-atl/', 'work/coursesniper/', 'work/quill/', 'work/tuck/', 'work/this-site/', 'resume/']) {
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

for (const path of ['./', 'about/', 'work/free-curb-atl/', 'work/coursesniper/', 'work/this-site/', 'resume/']) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousIssues(page);
  });
}

test('no serious accessibility problems with every phrase open', async ({ page }) => {
  await page.goto('about/');
  await page.getByRole('button', { name: 'Open everything' }).click();
  await expectNoSeriousIssues(page);
});
