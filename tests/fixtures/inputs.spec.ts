import { expect, test } from '@playwright/test';

// Spec 14: advanced inputs in both consumer apps.

test.describe('Vite', () => {
  test('a Combobox renders with its styles and filters', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'vite-app', 'Vite only');
    await page.goto('/');
    const input = page.getByRole('combobox', { name: 'Fixture country' });
    await expect(input).toBeVisible();
    // The wrapper's background is the sunken token, not transparent.
    expect(
      await input.evaluate(
        (el) => getComputedStyle(el.parentElement!).backgroundColor,
      ),
    ).not.toBe('rgba(0, 0, 0, 0)');
    await input.fill('jap');
    await expect(page.getByRole('option')).toHaveText(['Japan']);
  });
});

test.describe('Next.js', () => {
  const nextOnly = (name: string) =>
    test.skip(name !== 'next-app', 'Next.js only');

  test('server HTML has the starting labels and the file input', async ({
    request,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const html = await (await request.get('/inputs')).text();
    // Combobox: the starting value's label in the input.
    expect(html).toMatch(/<input[^>]*role="combobox"[^>]*value="Canada"/);
    // MultiSelect: the first label and the count in the trigger.
    expect(html).toMatch(/>Design<\/span><span[^>]*>\+1</);
    // MultiSelect searchable: a chip labeled from selectedOptions.
    expect(html).toContain('aria-label="Remove Ada Lovelace"');
    // FileUpload: the native input, before hydration.
    expect(html).toMatch(/<input[^>]*type="file"[^>]*name="attachments"/);
  });

  test('the page hydrates with no console errors, and the Combobox filters', async ({
    page,
  }, testInfo) => {
    nextOnly(testInfo.project.name);
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/inputs');
    const input = page.getByRole('combobox', { name: 'Country' });
    await input.fill('fra');
    await expect(page.getByRole('option')).toHaveText(['France']);
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    expect(errors).toEqual([]);
  });
});
