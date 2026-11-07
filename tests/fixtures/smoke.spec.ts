import { expect, test } from '@playwright/test';

test('renders with styles and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  const stub = page.getByTestId('stub');
  await expect(stub).toBeVisible();
  // The stub's class sets a known property. Task 5 changes this to a token value.
  expect(await stub.evaluate((el) => getComputedStyle(el).boxSizing)).toBe(
    'border-box',
  );
  expect(errors).toEqual([]);
});
