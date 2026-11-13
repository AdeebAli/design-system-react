import { expect, test, type Page } from '@playwright/test';

// Spec 17: Image in both consumer apps, and through next/image from a server
// component.

/** An Image's frame: the element around the img with the given test id. */
const frame = (page: Page, id: string) =>
  page.getByTestId(id).locator('xpath=..');

test.describe('Vite', () => {
  test('an Image renders with its frame styles', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.goto('/');
    const image = frame(page, 'image');
    await expect(image).not.toHaveAttribute('data-loading');
    expect(await image.evaluate((el) => getComputedStyle(el).overflow)).toBe(
      'hidden',
    );
  });
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has each img inside a loading frame', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/image')).text();
    // The native img, in its frame.
    expect(html).toMatch(
      /<span[^>]*data-loading=""[^>]*><img[^>]*src="\/avatar.svg"/,
    );
    // next/image's img, optimized, in its frame.
    expect(html).toMatch(
      /<span[^>]*data-loading=""[^>]*><img[^>]*srcSet="[^"]*\/_next\/image\?url=[^"]*hero/,
    );
  });

  test('both images load after hydration, with no console errors', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/image');
    await expect(frame(page, 'native')).not.toHaveAttribute('data-loading');
    await expect(frame(page, 'next')).not.toHaveAttribute('data-loading');
    await expect(frame(page, 'next')).not.toHaveAttribute('data-error');
    // The missing image fails; anything else in the console is a finding.
    await expect(frame(page, 'missing')).toHaveAttribute('data-error');
    expect(errors.filter((text) => !text.includes('404'))).toEqual([]);
  });

  test('an image that fails before hydration shows the fallback after it', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    // Hold the app's scripts until the image has failed, so React attaches
    // onError only after the error event has already fired.
    let release!: () => void;
    const failed = new Promise<void>((resolve) => (release = resolve));
    // Only scripts: a held stylesheet would block parsing, and the img with it.
    await page.route('**/_next/static/chunks/**/*.js', async (route) => {
      await failed;
      await route.continue();
    });
    await page.goto('/image', { waitUntil: 'commit' });
    const missing = page.locator('img[src="/missing.png"]');
    await expect
      .poll(() =>
        missing.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth === 0,
        ),
      )
      .toBe(true);
    // Not hydrated yet: the frame still says loading.
    await expect(frame(page, 'missing')).toHaveAttribute('data-loading');
    release();
    await expect(frame(page, 'missing')).toHaveAttribute('data-error');
    const fallback = frame(page, 'missing').locator(
      ':scope > [aria-hidden="true"]',
    );
    await expect(fallback).toBeVisible();
  });
});
