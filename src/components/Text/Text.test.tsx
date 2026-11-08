import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { vi } from 'vitest';
import { expectSameClass } from '../../utils/testUtils';
import { Text } from './index';
import * as styles from './Text.css';

const el = () => screen.getByTestId('t');

it('renders a p and adds no classes by default', () => {
  render(<Text data-testid="t" />);
  expect(el().tagName).toBe('P');
  expect(el().className).toBe('');
});

it('renders as another element, with its props', () => {
  render(<Text as="label" htmlFor="x" data-testid="t" />);
  expect(el().tagName).toBe('LABEL');
  expect(el()).toHaveAttribute('for', 'x');
});

it.each([
  ['weight', { weight: 'bold' }, styles.weight.bold],
  ['tone', { tone: 'muted' }, styles.tone.muted],
  ['family', { family: 'mono' }, styles.family.mono],
  ['numeric', { numeric: true }, styles.numeric],
  ['truncate', { truncate: true }, styles.truncate],
  ['lineClamp', { lineClamp: '3' }, styles.lineClamp['3']],
] as const)('%s applies its class', (_name, props, expected) => {
  render(<Text data-testid="t" {...props} />);
  expect(el()).toHaveClass(expected);
});

it('size and align add classes, and are not forwarded', () => {
  render(<Text data-testid="t" size="lg" align="center" />);
  expect(el().classList.length).toBe(2);
  expect(el().getAttribute('size')).toBeNull();
  expect(el().getAttribute('align')).toBeNull();
});

it('takes responsive values, and ignores nullish ones', () => {
  expectSameClass(
    <Text data-testid="c" size={{ base: 'lg', md: undefined }} />,
    <Text data-testid="c" size="lg" />,
  );
});

it('warns once when truncate and lineClamp are both set, and lineClamp wins', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(<Text data-testid="t" truncate lineClamp="2" />);
  render(<Text data-testid="u" truncate lineClamp="2" />);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(el()).toHaveClass(styles.lineClamp['2']);
  expect(el()).not.toHaveClass(styles.truncate);
  warn.mockRestore();
});

it('passes layout props, className, and ref through', () => {
  const ref = createRef<HTMLParagraphElement>();
  render(<Text data-testid="t" className="mine" margin="2" ref={ref} />);
  expect(el()).toHaveClass('mine');
  expect(el().classList.length).toBe(2);
  expect(ref.current).toBe(el());
});
