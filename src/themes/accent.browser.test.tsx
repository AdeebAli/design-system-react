import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Link } from '../components/Link';
import { Text } from '../components/Text';

const accent = 'rgb(1, 2, 3)';

afterEach(() => {
  document.querySelector('style[data-accent]')?.remove();
});

function overrideAccent() {
  const style = document.createElement('style');
  style.dataset.accent = '';
  style.textContent = `:root { --ds-color-bg-accent: ${accent}; }`;
  document.head.append(style);
}

it('plain CSS changes links, accent text, and focus rings', async () => {
  overrideAccent();
  render(
    <>
      <Link href="/x">Link</Link>
      <Text tone="accent" data-testid="t">
        Text
      </Text>
    </>,
  );
  const link = screen.getByRole('link');
  expect(getComputedStyle(link).color).toBe(accent);
  expect(getComputedStyle(screen.getByTestId('t')).color).toBe(accent);
  await userEvent.tab();
  expect(getComputedStyle(link).outlineColor).toBe(accent);
});
