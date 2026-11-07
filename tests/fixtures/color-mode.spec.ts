import { expect, test, type Page } from '@playwright/test';

const LIGHT = 'rgb(244, 242, 238)';
const DARK = 'rgb(20, 19, 17)';

const canvas = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const accent = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--ds-color-bg-accent')
      .trim(),
  );

test('a stored choice applies before the app script loads', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('ds-color-mode', 'dark'));
  await page.route(/\.js(\?.*)?$/, (route) => route.abort());
  await page.goto('/');
  expect(await canvas(page)).toBe(DARK);
});

test('with nothing stored, the OS selects the mode and updates live', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await canvas(page)).toBe(DARK);
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await canvas(page)).toBe(LIGHT);
});

test('without JavaScript, the stylesheet alone follows the OS', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto('/');
  expect(await canvas(page)).toBe(DARK);
  await context.close();
});

test('portaled content inherits the theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ds-color-mode', 'dark'));
  await page.goto('/');
  const portal = page.getByTestId('portal');
  await expect(portal).toBeVisible();
  expect(
    await portal.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe('rgb(45, 212, 191)');
});

test('typed overrides apply per mode, with no leak', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.getByTestId('stub')).toBeVisible();
  expect(await accent(page)).toBe('#0f766e');
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await accent(page)).toBe('#2dd4bf');
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-ds-mode', 'light'),
  );
  expect(await accent(page)).toBe('#0f766e');
});

test('no console errors, including hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('ds-color-mode', 'dark'));
  await page.goto('/');
  await expect(page.getByTestId('portal')).toBeVisible();
  expect(errors).toEqual([]);
});

test('typed overrides are in the server HTML, unescaped', async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'next-app', 'Next.js only');
  const html = await (await request.get('/')).text();
  expect(html).toContain('--ds-font-family-mono:"Fixture Mono", monospace');
});
