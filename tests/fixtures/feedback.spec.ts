import { expect, test } from '@playwright/test';

// Spec 16: feedback and display components in both consumer apps.

test.describe('Vite', () => {
  test('an Alert and a Drawer render with their styles', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.goto('/');
    const alert = page.getByTestId('alert');
    await expect(alert).toBeVisible();
    // The tone background is a token, not transparent.
    expect(
      await alert.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');

    await page.getByRole('button', { name: 'Open drawer' }).click();
    const drawer = page.getByRole('dialog', { name: 'Fixture drawer' });
    await expect(drawer).toBeVisible();
    // The panel's background is the raised surface token, not transparent.
    expect(
      await drawer.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has the Alert, Spinner, Divider, Progress, Avatar image, and Drawer trigger', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/feedback')).text();
    expect(html).toMatch(/<div[^>]*data-tone="danger"/);
    expect(html).toContain('Could not save your changes');
    expect(html).toMatch(/role="status"[^>]*>[\s\S]*?Loading invoices/);
    expect(html).toMatch(/<hr[^>]*>/);
    expect(html).toMatch(/role="progressbar"/);
    expect(html).toMatch(/<img[^>]*src="\/avatar.svg"/);
    expect(html).toMatch(/<button[^>]*>Open drawer<\/button>/);
  });

  test('the drawer opens, with no console errors, including hydration errors', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/feedback');

    await page.getByRole('button', { name: 'Open drawer' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Server drawer' }),
    ).toBeVisible();

    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    expect(errors).toEqual([]);
  });
});
