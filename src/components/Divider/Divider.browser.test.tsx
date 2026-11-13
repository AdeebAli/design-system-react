import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { axEntries } from '../../utils/browserTestUtils';
import { Inline } from '../Inline';
import { Text } from '../Text';
import { Divider } from './index';

afterEach(async () => {
  await page.viewport(414, 896);
});

it('a screen reader reads the label: Chrome exposes it as text, not as a separator', async () => {
  render(
    <div data-testid="host">
      <button type="button">Continue with a passkey</button>
      <Divider label="or" />
      <button type="button">Continue with email</button>
    </div>,
  );
  const read = await axEntries();
  const start = read.indexOf('button:Continue with a passkey');
  const end = read.indexOf('button:Continue with email');
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  const between = read.slice(start + 1, end);
  expect(between).toContain('StaticText:or');
  expect(between.filter((entry) => entry.startsWith('separator'))).toEqual([]);
});

it('is a 1px border.subtle line with no margins of its own', () => {
  render(<Divider data-testid="d" />);
  const style = getComputedStyle(screen.getByTestId('d'));
  const subtle = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-border-subtle')
    .trim();
  const probe = document.createElement('span');
  probe.style.color = subtle;
  document.body.append(probe);
  expect(style.borderBlockStartWidth).toBe('1px');
  expect(style.borderBlockStartColor).toBe(getComputedStyle(probe).color);
  expect(style.marginBlockStart).toBe('0px');
  expect(style.marginBlockEnd).toBe('0px');
  expect(screen.getByTestId('d').getBoundingClientRect().height).toBe(1);
  probe.remove();
});

it('a vertical divider is as tall as its Inline parent', () => {
  render(
    <Inline data-testid="row">
      <Text>Drafts</Text>
      <Divider data-testid="d" orientation="vertical" />
      <Text size="2xl">Sent</Text>
    </Inline>,
  );
  const row = screen.getByTestId('row').getBoundingClientRect();
  const divider = screen.getByTestId('d').getBoundingClientRect();
  expect(row.height).toBeGreaterThan(20);
  expect(divider.height).toBe(row.height);
  expect(divider.width).toBe(1);
});

it('the label is centered at 320px and the page does not scroll sideways', async () => {
  await page.viewport(320, 640);
  render(<Divider data-testid="d" label="or continue with email" />);
  const divider = screen.getByTestId('d').getBoundingClientRect();
  const text = screen
    .getByText('or continue with email')
    .getBoundingClientRect();
  const center = divider.left + divider.width / 2;
  expect(Math.abs(text.left + text.width / 2 - center)).toBeLessThanOrEqual(1);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});

it('a long label wraps instead of overflowing at 320px', async () => {
  await page.viewport(320, 640);
  render(
    <Divider
      data-testid="d"
      label="Sign in with the email address you used when you first created your account"
    />,
  );
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});

it('label text is font.size.xs in fg.muted', () => {
  render(<Divider label="or" />);
  const text = getComputedStyle(screen.getByText('or'));
  const root = getComputedStyle(document.documentElement);
  const probe = document.createElement('span');
  probe.style.color = root.getPropertyValue('--ds-color-fg-muted').trim();
  probe.style.fontSize = root.getPropertyValue('--ds-font-size-xs').trim();
  document.body.append(probe);
  expect(text.color).toBe(getComputedStyle(probe).color);
  expect(text.fontSize).toBe(getComputedStyle(probe).fontSize);
  probe.remove();
});
