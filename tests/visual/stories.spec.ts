import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

interface IndexEntry {
  id: string;
  type: string;
}

const index = JSON.parse(
  readFileSync('storybook-static/index.json', 'utf8'),
) as {
  entries: Record<string, IndexEntry>;
};

const stories = Object.values(index.entries).filter(
  (entry) => entry.type === 'story',
);

// MDX pages, such as Foundations and Box's style props. They don't follow the
// color mode, so one mode is enough (Spec 02).
const docsPages = Object.values(index.entries).filter(
  (entry) => entry.type === 'docs',
);

for (const docs of docsPages) {
  test(docs.id, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/iframe.html?id=${docs.id}&viewMode=docs`);
    await page.locator('#storybook-docs h1').waitFor();
    // A Markdown table that MDX didn't parse shows up as a paragraph of pipes.
    await expect(
      page.locator('#storybook-docs p', { hasText: /\|\s*-{3,}/ }),
    ).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${docs.id}.png`, { fullPage: true });
  });
}

// Props tables render after the page's first paint, so a check for something
// absent waits until the docs stop changing.
async function settled(page: Page) {
  let last = '';
  await expect
    .poll(
      async () => {
        const now = await page.locator('#storybook-docs').innerHTML();
        const same = now === last;
        last = now;
        return same;
      },
      { intervals: [300] },
    )
    .toBe(true);
}

// Docs-page content checks (Spec 18, Testing), apart from the screenshot so
// they run locally, where baselines for new pages don't exist yet.
for (const docs of docsPages) {
  test(`${docs.id} content`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${docs.id}&viewMode=docs`);
    await page.locator('#storybook-docs h1').first().waitFor();
    await settled(page);
    // The page's own title; stories shown on the page may render their own.
    await expect(
      page.locator('#storybook-docs h1:not(.docs-story h1)'),
    ).toHaveCount(1);
    await expect(
      page.locator('#storybook-docs').getByText('This story has no controls'),
    ).toHaveCount(0);
  });
}

test('the Button page has its sections and own props', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=components-forms-and-actions-button--docs&viewMode=docs',
  );
  const docs = page.locator('#storybook-docs');
  await docs.locator('h1').waitFor();
  for (const id of [
    'usage',
    'dos-and-donts',
    'accessibility',
    'api',
    'examples',
  ]) {
    await expect(docs.locator(`[id="${id}"]`)).toHaveCount(1);
  }
  const names = docs.locator('.docblock-argstable tbody tr td:first-child');
  for (const prop of ['variant', 'tone', 'loading']) {
    await expect(
      names.filter({ hasText: new RegExp(`^${prop}$`) }),
    ).toHaveCount(1);
  }
});

for (const story of stories) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${story.id} ${mode}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=mode:${mode}`,
      );
      await page.locator('#storybook-root').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${story.id}-${mode}.png`, {
        fullPage: true,
      });
    });
  }
}
