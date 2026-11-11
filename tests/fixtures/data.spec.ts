import { expect, test } from '@playwright/test';

// Spec 13: tables in both consumer apps.

test.describe('Vite', () => {
  test('a Table renders with its styles', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.goto('/');
    const table = page.getByTestId('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(3);
  });
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has the Table and a Pagination of next/link links', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/data')).text();
    expect(html).toMatch(/<table[^>]*aria-label="Plans"/);
    expect(html).toContain('Ada Park');
    expect(html).toMatch(/<nav[^>]*aria-label="Pagination"/);
    expect(html).toMatch(/<a[^>]*href="\/data\?page=2"[^>]*>2<\/a>/);
    // The second page's rows aren't in the first page's HTML.
    expect(html).not.toContain('Eli Moss');
  });

  test('clicking page 2 navigates client-side and shows the next rows', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    await page.goto('/data');
    await page.evaluate(() => {
      (window as { marker?: number }).marker = 1;
    });
    await page.getByRole('link', { name: 'Page 2', exact: true }).click();
    await expect(page).toHaveURL(/\/data\?page=2$/);
    await expect(page.getByText('Eli Moss')).toBeVisible();
    // A full page load would have dropped the marker.
    expect(
      await page.evaluate(() => (window as { marker?: number }).marker),
    ).toBe(1);
  });

  test('the DataTable with selection and defaultSort hydrates without warnings', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/data');
    const table = page.getByRole('table', { name: 'Customers' });
    await expect(table).toBeVisible();
    // defaultSort: spend, descending.
    await expect(
      table.getByRole('columnheader', { name: /Spend/ }),
    ).toHaveAttribute('aria-sort', 'descending');
    await table
      .getByRole('button', { name: /^Select / })
      .first()
      .click();
    await expect(page.getByRole('status')).toHaveText('1 selected');
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    expect(errors).toEqual([]);
  });
});
