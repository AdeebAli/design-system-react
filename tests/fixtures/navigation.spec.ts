import { expect, test } from '@playwright/test';

// Spec 10 and 11: NavBar, Tabs, and Prose in both consumer apps.

test('NavBar, Tabs, and Prose render with their styles', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav).toBeVisible();
  expect(await nav.evaluate((el) => getComputedStyle(el).display)).toBe('grid');
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toHaveText(/Overview panel/);
  const prose = page.getByTestId('prose');
  const family = await prose.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/^"?Source Serif 4/);
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has the nav with its links and the active tab', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/')).text();
    expect(html).toMatch(/<nav[^>]*aria-label="Main"/);
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Home<\/a>/);
    expect(html).toMatch(/<a[^>]*href="\/blog"[^>]*>Blog<\/a>/);
    expect(html).toMatch(/<button[^>]*data-active=""[^>]*>Overview<\/button>/);
    expect(html).toContain('Overview panel, rendered on the server');
  });

  test('server HTML has the Prose article on /blog', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/blog')).text();
    expect(html).toMatch(/<article[^>]*data-testid="article"/);
    expect(html).toContain('Writing a useful changelog');
  });

  test('no console errors on either page, including hydration errors', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of ['/', '/blog']) {
      await page.goto(path);
      await expect(
        page.getByRole('navigation', { name: 'Main' }),
      ).toBeVisible();
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(resolve)),
      );
    }
    expect(errors).toEqual([]);
  });

  test('on a small screen, a next/link in the menu navigates client-side, closes the panel, and focuses the menu button', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await page.evaluate(() => {
      (window as { marker?: number }).marker = 1;
    });
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByTestId('article')).toBeVisible();
    // A full page load would have dropped the marker.
    expect(
      await page.evaluate(() => (window as { marker?: number }).marker),
    ).toBe(1);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the links are visible from md', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'next-app', 'Needs server HTML');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    for (const name of ['Home', 'Blog'])
      await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  });
});
