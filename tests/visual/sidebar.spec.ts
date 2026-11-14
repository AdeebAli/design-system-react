import { expect, test, type Page } from '@playwright/test';

// The real sidebar in the built Storybook manager, not storySort (Spec 18,
// Testing). The mobile project collapses the sidebar into a menu, so this
// runs on desktop only.
test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    `sidebar checks run on desktop (${browserName})`,
  );
});

const labels = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-item-id') ?? ''),
    );

test('top-level sections read in Spec 18 order', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-nodetype="root"]').first().waitFor();
  expect(await labels(page, '[data-nodetype="root"]')).toEqual([
    'overview',
    'foundations',
    'components',
    'patterns',
    'guides',
  ]);
});

test('Components groups read in Spec 18 order', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-nodetype="root"]').first().waitFor();
  expect(
    await labels(page, '[data-nodetype="group"][data-parent-id="components"]'),
  ).toEqual([
    'components-layout',
    'components-typography',
    'components-icons',
    'components-display',
    'components-forms-and-actions',
    'components-advanced-inputs',
    'components-navigation',
    'components-app-navigation',
    'components-overlays',
    'components-data',
    'components-feedback-and-display',
    'components-image',
  ]);
});

test('the Layout group starts Box, Flex, Stack', async ({ page }) => {
  await page.goto('/');
  const layout = page.locator('[data-item-id="components-layout"]');
  await layout.waitFor();
  if ((await layout.getAttribute('aria-expanded')) !== 'true') {
    await layout.locator('button').first().click();
  }
  const children = await labels(page, '[data-parent-id="components-layout"]');
  expect(children.slice(0, 3)).toEqual([
    'components-layout-box',
    'components-layout-flex',
    'components-layout-stack',
  ]);
});

test('the default page is Overview/Welcome', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/path=\/docs\/overview-welcome--docs/);
});
