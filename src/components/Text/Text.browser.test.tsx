import { render, screen } from '@testing-library/react';
import { Heading } from '../Heading';
import { Text } from './index';

const el = () => screen.getByTestId('t');
const css = () => getComputedStyle(el());

it('a span inside a larger Heading keeps its size', () => {
  render(
    <Heading level={1} size="4xl">
      Large{' '}
      <Text as="span" data-testid="t">
        words
      </Text>
    </Heading>,
  );
  expect(css().fontSize).toBe('36px');
  expect(css().fontWeight).toBe(
    getComputedStyle(el().parentElement!).fontWeight,
  );
});

it.each([
  ['md', '14px', 1.5],
  ['2xl', '22px', 1.3],
  ['4xl', '36px', 1.15],
] as const)('size %s sets size and line height', (size, px, ratio) => {
  render(<Text data-testid="t" size={size} />);
  expect(css().fontSize).toBe(px);
  expect(parseFloat(css().lineHeight) / parseFloat(px)).toBeCloseTo(ratio, 1);
});

it('large sizes tighten letter spacing', () => {
  render(<Text data-testid="t" size="md" />);
  render(<Text data-testid="l" size="4xl" />);
  expect(css().letterSpacing).toBe('normal');
  expect(
    parseFloat(getComputedStyle(screen.getByTestId('l')).letterSpacing),
  ).toBeLessThan(0);
});

it('family resets font features for mono and applies them for sans', () => {
  render(<Text data-testid="t" family="mono" />);
  expect(css().fontFeatureSettings).toBe('normal');
  render(<Text data-testid="s" family="sans" />);
  expect(
    getComputedStyle(screen.getByTestId('s')).fontFeatureSettings,
  ).not.toBe('normal');
});

const long = 'word '.repeat(80);

it.each(['p', 'span'] as const)('truncate clips on one line as %s', (as) => {
  render(
    <div style={{ width: 100 }}>
      <Text as={as} truncate data-testid="t">
        {long}
      </Text>
    </div>,
  );
  expect(css().display).toBe('block');
  expect(css().textOverflow).toBe('ellipsis');
  expect(el().scrollWidth).toBeGreaterThan(el().clientWidth);
  expect(el().getBoundingClientRect().height).toBeLessThan(30);
});

it.each(['p', 'span'] as const)('lineClamp clips to its lines as %s', (as) => {
  render(
    <div style={{ width: 100, lineHeight: '20px', fontSize: 14 }}>
      <Text as={as} lineClamp="2" data-testid="t">
        {long}
      </Text>
    </div>,
  );
  expect(el().getBoundingClientRect().height).toBe(40);
});

it('tone sets the color, and no tone inherits', () => {
  render(
    <div style={{ color: 'rgb(1, 2, 3)' }}>
      <Text data-testid="t" />
      <Text data-testid="m" tone="muted" />
    </div>,
  );
  expect(css().color).toBe('rgb(1, 2, 3)');
  expect(getComputedStyle(screen.getByTestId('m')).color).not.toBe(
    'rgb(1, 2, 3)',
  );
});
