import { render, screen } from '@testing-library/react';
import { Code } from './index';

const css = () => getComputedStyle(screen.getByTestId('c'));

it('never falls below 12px', () => {
  render(
    <p style={{ fontSize: '8px' }}>
      <Code data-testid="c">x</Code>
    </p>,
  );
  expect(css().fontSize).toBe('12px');
});

it('scales with the surrounding text', () => {
  render(
    <p style={{ fontSize: '50px' }}>
      <Code data-testid="c">x</Code>
    </p>,
  );
  expect(css().fontSize).toBe('44px');
});

it('sets its own text color, so an inverse surface stays legible', () => {
  render(
    <p style={{ color: 'rgb(1, 2, 3)' }}>
      <Code data-testid="c">x</Code>
    </p>,
  );
  expect(css().color).not.toBe('rgb(1, 2, 3)');
});

it('inside pre, drops its background and padding, and inherits its size', () => {
  render(
    <pre style={{ fontSize: '20px' }}>
      <Code data-testid="c">x</Code>
    </pre>,
  );
  expect(css().backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(css().paddingInlineStart).toBe('0px');
  expect(css().borderTopLeftRadius).toBe('0px');
  expect(css().fontSize).toBe('20px');
});
