import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

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
