import { expect, test } from '@playwright/test';

// The minifier may write a duration as .2s or 200ms, and either is correct.
function toMs(duration: string) {
  return duration.endsWith('ms')
    ? parseFloat(duration)
    : parseFloat(duration) * 1000;
}

test('renders with styles and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/');
  await expect(page.getByTestId('stub')).toBeVisible();
  // The canvas comes from Soft Light's token values.
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe('rgb(244, 242, 238)');
  expect(errors).toEqual([]);
  expect(
    [...origins].filter((origin) => origin !== new URL(page.url()).origin),
  ).toEqual([]);
});

test('an icon renders at its token size', async ({ page }) => {
  await page.goto('/');
  const icon = page.getByTestId('icon');
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(await icon.evaluate((el) => getComputedStyle(el).width)).toBe('16px');
});

test('a toned icon uses the forced text color in forced colors', async ({
  page,
}) => {
  await page.goto('/');
  const color = () =>
    page.getByTestId('toned-icon').evaluate((el) => getComputedStyle(el).color);
  const toned = await color();
  await page.emulateMedia({ forcedColors: 'active' });
  const forced = await color();
  expect(forced).not.toBe(toned);
  const text = await page
    .getByTestId('text')
    .evaluate((el) => getComputedStyle(el).color);
  expect(forced).toBe(text);
});

test('layout and typography components render with their styles', async ({
  page,
}) => {
  await page.goto('/');
  const display = await page
    .getByTestId('layout')
    .evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('flex');
  const size = await page
    .getByTestId('text')
    .evaluate((el) => getComputedStyle(el).fontSize);
  expect(size).toBe('16px');
  await expect(
    page.getByRole('link', { name: 'Docs (opens in a new tab)' }),
  ).toHaveAttribute('target', '_blank');
});

test('Chrome names an external link with its hidden text', async ({ page }) => {
  await page.goto('/');
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send('Accessibility.getFullAXTree')) as {
    nodes: { role?: { value: string }; name?: { value: string } }[];
  };
  const names = nodes
    .filter((node) => node.role?.value === 'link')
    .map((node) => node.name?.value);
  expect(names).toContain('Docs (opens in a new tab)');
});

test("Inter's alternates make I, l, and 1 distinct", async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    for (const [id, features] of [
      ['plain', 'normal'],
      ['alternates', '"cv05", "cv08"'],
    ] as const) {
      const el = document.createElement('div');
      el.id = id;
      el.textContent = 'Il1';
      el.style.cssText = `font: 64px Inter; font-feature-settings: ${features}; width: max-content`;
      document.body.append(el);
    }
    await document.fonts.load('64px Inter', 'Il1');
  });
  const plain = await page.locator('#plain').screenshot();
  const alternates = await page.locator('#alternates').screenshot();
  expect(alternates.equals(plain)).toBe(false);
});

test('text renders in the bundled Inter', async ({ page }) => {
  await page.goto('/');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter((face) => face.status === 'loaded')
      .map((face) => face.family.replace(/"/g, ''));
  });
  expect(loaded).toContain('Inter');
});

for (const attribute of [null, 'light', 'dark']) {
  test(`reduced motion gives 0ms with mode ${attribute}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const duration = await page.evaluate((mode) => {
      if (mode) document.documentElement.setAttribute('data-ds-mode', mode);
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-motion-duration-base')
        .trim();
    }, attribute);
    expect(toMs(duration)).toBe(0);
  });
}

test('motion tokens keep their values without reduced motion', async ({
  page,
}) => {
  await page.goto('/');
  const duration = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--ds-motion-duration-base')
      .trim(),
  );
  expect(toMs(duration)).toBe(200);
});

test('the OS setting and a locked mode select the canvas', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const canvas = () =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await canvas()).toBe('rgb(20, 19, 17)');
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-ds-mode', 'light'),
  );
  expect(await canvas()).toBe('rgb(244, 242, 238)');
});

test('bento components render with their styles', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId('card');
  const radius = await card.evaluate((el) => {
    const probe = document.createElement('div');
    probe.style.borderTopLeftRadius = 'var(--ds-radius-card)';
    document.body.append(probe);
    const expected = getComputedStyle(probe).borderTopLeftRadius;
    probe.remove();
    return [getComputedStyle(el).borderTopLeftRadius, expected];
  });
  expect(radius[0]).toBe(radius[1]);
  expect(radius[0]).not.toBe('0px');
  await expect(card.getByRole('term')).toHaveText('Revenue');
  await expect(card.getByTestId('badge')).toHaveText('Pro');
});

test('a React Hook Form form submits every control', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'vite-app', 'Vite fixture only');
  await page.goto('/');
  const form = page.getByRole('form', { name: 'Filters' });
  await form.getByRole('textbox', { name: 'Seats' }).fill('12');
  await form.getByRole('textbox', { name: 'Notes' }).fill('Hello');
  await form.getByRole('combobox', { name: 'Plan' }).click();
  await page.getByRole('option', { name: 'Annual' }).click();
  await form.getByRole('checkbox', { name: 'Include archived' }).click();
  await form.getByRole('radio', { name: 'Yearly' }).click();
  await form.getByRole('switch', { name: 'Live updates' }).click();
  await form.getByRole('button', { name: 'Code' }).click();
  await form.getByRole('button', { name: 'Apply' }).click();
  expect(
    JSON.parse((await page.getByTestId('submitted').textContent()) ?? ''),
  ).toEqual({
    seats: '12',
    notes: 'Hello',
    plan: 'annual',
    archived: true,
    billing: 'yearly',
    live: true,
    topics: ['design', 'code'],
  });
});

test('a Select with server-built options shows its label in the server HTML', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'next-app', 'Next.js only');
  const html = await (await page.request.get('/')).text();
  expect(html).toMatch(/data-testid="server-select"[^>]*>[\s\S]*?Annual/);
  await page.goto('/');
  await expect(page.getByTestId('server-select')).toHaveText(/Annual/);
});
