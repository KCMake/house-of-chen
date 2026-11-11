import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('front of house', () => {
  test('the first screen says who, what, and when', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Full stack');
    await expect(page.locator('.hero-name')).toHaveText('Kenney Chen');
    await expect(page.locator('.seek')).toContainText('Summer 2027');
    await expect(page.locator('.quick-links').getByRole('link', { name: 'Resume PDF' })).toBeVisible();
  });

  test('combo platters circle the right dishes', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'C2 Embedded and hardware' }).click();
    await expect(page.locator('.item.circled')).toHaveCount(3);
    await expect(page.locator('#W1')).toHaveClass(/circled/);
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(page.locator('.item.circled')).toHaveCount(0);
  });

  test('typing a number jumps to that dish', async ({ page, isMobile }) => {
    test.skip(isMobile, 'needs a keyboard');
    await page.goto('./');
    await page.keyboard.press('w');
    await page.keyboard.press('1');
    await expect(page.locator('#W1')).toBeFocused();
  });

  test('the kitchen door opens', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Peek', exact: true }).click();
    await expect(page.locator('[data-peek]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-door]')).toHaveAttribute('style', /rotateY\(83/);
  });

  test('the lazy Susan turns with buttons and arrow keys', async ({ page }) => {
    await page.goto('./');
    const name = page.locator('[data-dish-name]');
    await expect(name).toHaveText('AI phone ordering');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(name).toHaveText('Free Curb ATL');
    await page.getByRole('slider').focus();
    await page.keyboard.press('ArrowRight');
    await expect(name).toHaveText('AgriNexus 2.0');
  });

  test('the calendar tears to the next year', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Tear off 2016' }).click();
    await expect(page.locator('[data-cal-count]')).toHaveText('2 of 6');
  });

  test('the fortune cookie cracks from the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'needs a keyboard');
    await page.goto('./');
    await page.locator('.cookie').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-fortune]')).not.toBeEmpty();
  });

  test('the phone turns words into a validated order', async ({ page }) => {
    await page.goto('./');
    await page.getByLabel('Say something').fill("what's good for an embedded team?");
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('[data-call-reply]')).toContainText('W1, AgriNexus 2.0');
    await expect(page.locator('[data-call-ticket]')).toContainText('"valid": true');
  });

  test('email links are assembled in the browser', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.quick-links [data-mail]')).toHaveAttribute('href', 'mailto:kchen755@gatech.edu');
  });

  test('nothing scrolls sideways', async ({ page }) => {
    await page.goto('./');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('back of house', () => {
  test('a ticket has the line, printouts, and refires', async ({ page }) => {
    await page.goto('kitchen/free-curb-atl/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Free Curb ATL');
    await expect(page.locator('.kraft li')).toHaveCount(6);
    await expect(page.locator('.printout')).toHaveCount(2);
    await expect(page.locator('.refire')).toHaveCount(4);
  });

  test('the menu links into the kitchen', async ({ page }) => {
    await page.goto('./');
    await page.locator('#S2').getByRole('link', { name: 'Kitchen ticket' }).click();
    await expect(page).toHaveURL(/kitchen\/free-curb-atl\/$/);
  });
});

test('to go is plain, complete, and has no phone number', async ({ page }) => {
  await page.goto('to-go/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kenney Chen');
  const text = await page.locator('main').innerText();
  expect(text).toContain('Georgia Institute of Technology');
  expect(text).not.toMatch(/\d{3}[-. ]\d{3}[-. ]\d{4}/);
});

test("a missing page is 86'd", async ({ page }) => {
  const response = await page.goto('no-such-dish/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main')).toContainText("86'd");
});

for (const path of ['./', 'kitchen/', 'kitchen/free-curb-atl/', 'to-go/']) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
  });
}
