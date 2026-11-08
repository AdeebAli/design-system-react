import { render, screen } from '@testing-library/react';
import { Kbd } from './index';

const css = () => getComputedStyle(screen.getByTestId('k'));

it('never falls below 12px', () => {
  render(
    <p style={{ fontSize: '8px' }}>
      <Kbd data-testid="k">K</Kbd>
    </p>,
  );
  expect(css().fontSize).toBe('12px');
});

it('has a thicker bottom edge, and its own text color', () => {
  render(
    <p style={{ color: 'rgb(1, 2, 3)' }}>
      <Kbd data-testid="k">K</Kbd>
    </p>,
  );
  expect(parseFloat(css().borderBottomWidth)).toBeGreaterThan(
    parseFloat(css().borderTopWidth),
  );
  expect(css().color).not.toBe('rgb(1, 2, 3)');
});
