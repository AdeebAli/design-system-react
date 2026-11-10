import { expect, test, type Page } from '@playwright/test';

// fixtures/next-app/proxy.ts serves /csp with a strict, nonce-based policy, and
// its layout passes the nonce to ColorModeScript and ThemeProvider.
const nextOnly = (name: string) =>
  test.skip(name !== 'next-app', 'Next.js only');

const DARK = 'rgb(20, 19, 17)';

// Collects console errors and CSP violations from before the first script.
async function watch(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const found: string[] = [];
    Object.assign(window, { cspViolations: found });
    document.addEventListener('securitypolicyviolation', (event) =>
      found.push(
        `${event.violatedDirective} ${event.blockedURI} ${event.sample}`,
      ),
    );
  });
  const violations = () =>
    page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    );
  return { errors, violations };
}

test('the page carries the policy, and the nonce reaches the script and the theme style', async ({
  request,
}, testInfo) => {
  nextOnly(testInfo.project.name);
  const response = await request.get('/csp');
  const policy = response.headers()['content-security-policy'] ?? '';
  const nonce = /'nonce-([^']+)'/.exec(policy)?.[1];
  expect(nonce).toBeTruthy();
  const html = await response.text();
  expect(html).toMatch(
    new RegExp(`<script nonce="${nonce}">\\(function\\(\\)\\{var m=`),
  );
  expect(html).toContain(`<style nonce="${nonce}">`);
});

test('no CSP violations or console errors through load, hydration, and a mode change', async ({
  page,
}, testInfo) => {
  nextOnly(testInfo.project.name);
  const { errors, violations } = await watch(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/csp');
  await expect(page.getByTestId('portal')).toBeVisible();
  // Base UI hides a form control's native input with a style attribute, which
  // the policy must allow (README), or the input shows on the page.
  const hidden = page.locator('input[aria-hidden="true"][tabindex="-1"]');
  await expect(hidden).not.toHaveCount(0);
  for (const input of await hidden.all())
    expect((await input.boundingBox())?.width).toBeLessThanOrEqual(1);
  // The mode change adds a style element to suppress transitions.
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    )
    .toBe(DARK);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  expect(await violations()).toEqual([]);
  expect(errors).toEqual([]);
});

test('a stored choice applies before the app script loads, under the CSP', async ({
  page,
}, testInfo) => {
  nextOnly(testInfo.project.name);
  const { violations } = await watch(page);
  await page.addInitScript(() => localStorage.setItem('ds-color-mode', 'dark'));
  await page.route(/\.js(\?.*)?$/, (route) => route.abort());
  await page.goto('/csp');
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe(DARK);
  expect(await violations()).toEqual([]);
});

test('theme overrides apply under the CSP', async ({ page }, testInfo) => {
  nextOnly(testInfo.project.name);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/csp');
  await expect(page.getByTestId('stub')).toBeVisible();
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-color-bg-accent')
        .trim(),
    ),
  ).toBe('#0f766e');
});
