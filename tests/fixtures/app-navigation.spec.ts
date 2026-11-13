import { expect, test } from '@playwright/test';

// Spec 15: app navigation in both consumer apps.

test.describe('Vite', () => {
  test('a Sidebar renders with its styles', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Fixture sidebar' });
    await expect(nav).toBeVisible();
    // size.sidebar, from the stylesheet.
    expect(await nav.evaluate((el) => el.getBoundingClientRect().width)).toBe(
      240,
    );
    await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

/**
 * The HTML of the nav with this name, so a match can't come from the site's
 * NavBar, which has links with the same text.
 */
function navHtml(html: string, label: string) {
  const start = html.search(new RegExp(`<nav[^>]*aria-label="${label}"`));
  if (start === -1) return '';
  return html.slice(start, html.indexOf('</nav>', start) + '</nav>'.length);
}

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has the sidebar links, the breadcrumbs, and the open accordion content', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/app-navigation')).text();
    // Sidebar: its nav and a next/link link, before hydration.
    const sidebar = navHtml(html, 'App');
    expect(sidebar).toMatch(
      /<a[^>]*href="\/app-navigation\/second"[^>]*>.*?Second page/,
    );
    // Breadcrumbs from a server component, with next/link and a server `as`.
    const crumbs = navHtml(html, 'Breadcrumbs');
    expect(crumbs).toMatch(/<a[^>]*href="\/"[^>]*>Home<\/a>/);
    expect(crumbs).toMatch(/<a[^>]*data-server-link=""[^>]*href="\/blog"/);
    expect(crumbs).toMatch(/aria-current="page"[^>]*>App navigation</);
    // Accordion: the open item's server-rendered content.
    expect(html).toContain('Rendered on the server.');
  });

  test('the page hydrates with no console errors, and a Sidebar link navigates client-side', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/app-navigation');
    const sidebar = page.getByRole('navigation', { name: 'App' });
    await expect(sidebar).toBeVisible();
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveAttribute('data-collapsed', '');
    // A full page load would drop this marker.
    await page.evaluate(() => {
      (window as unknown as { marker: boolean }).marker = true;
    });
    await sidebar.getByRole('link', { name: 'Second page' }).click();
    await expect(page).toHaveURL(/\/app-navigation\/second$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Second page' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as unknown as { marker?: boolean }).marker,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });

  test('below md, a Sidebar link in the drawer navigates client-side and closes it', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/app-navigation');
    await page.getByRole('button', { name: 'App menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'App menu' });
    await drawer.getByRole('link', { name: 'Second page' }).click();
    await expect(page).toHaveURL(/\/app-navigation\/second$/);
    // The layout keeps the Sidebar mounted, so only the link click closes it.
    await expect(drawer).toBeHidden();
    await expect(page.getByRole('button', { name: 'App menu' })).toBeFocused();
  });
});
