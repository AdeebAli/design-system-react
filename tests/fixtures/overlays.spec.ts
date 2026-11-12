import { expect, test } from '@playwright/test';

// Spec 12: overlays in both consumer apps.

test.describe('Vite', () => {
  test('a dialog opens with its styles, and a table renders with its styles', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.goto('/');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Fixture dialog' });
    await expect(dialog).toBeVisible();
    // The popup's background is the raised surface token, not transparent.
    expect(
      await dialog.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    const table = page.getByTestId('table');
    await expect(table).toBeVisible();
    expect(
      await table.evaluate((el) => getComputedStyle(el).borderCollapse),
    ).toBe('separate');
    expect(
      await table
        .getByRole('columnheader', { name: 'Plan' })
        .evaluate((el) => getComputedStyle(el).textTransform),
    ).toBe('uppercase');
  });
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has each overlay trigger, rendered from a server component', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/overlays')).text();
    for (const name of ['Open dialog', 'Open popover', 'Open menu'])
      expect(html).toMatch(new RegExp(`<button[^>]*>${name}</button>`));
    expect(html).toMatch(/<button[^>]*>Hover me<\/button>/);
  });

  test('each overlay opens on click or focus, with no console errors', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/overlays');

    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Server dialog' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Open popover' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Server popover' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Duplicate' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();

    await page.getByRole('button', { name: 'Hover me' }).focus();
    await expect(page.getByText('A hint from the server')).toBeVisible();

    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    expect(errors).toEqual([]);
  });
});
