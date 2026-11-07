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
