import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expectSameClass } from '../../utils/testUtils';
import { weight } from '../Text/Text.css';
import { Heading } from './index';

it.each([
  [1, 'H1'],
  [2, 'H2'],
  [3, 'H3'],
  [4, 'H4'],
  [5, 'H5'],
  [6, 'H6'],
] as const)('level %s renders %s', (level, tag) => {
  render(<Heading level={level} data-testid="h" />);
  expect(screen.getByTestId('h').tagName).toBe(tag);
});

it('keeps the tag when size changes', () => {
  render(
    <Heading level={2} size="5xl">
      x
    </Heading>,
  );
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
});

it.each([
  [1, '4xl'],
  [2, '3xl'],
  [3, '2xl'],
  [4, 'xl'],
  [5, 'lg'],
  [6, 'md'],
] as const)('level %s defaults to size %s', (level, size) => {
  expectSameClass(
    <Heading level={level} data-testid="c" />,
    <Heading level={level} size={size} data-testid="c" />,
  );
});

it('a responsive size with no base keeps the level default', () => {
  expectSameClass(
    <Heading level={3} size={{ md: '5xl' }} data-testid="c" />,
    <Heading level={3} size={{ base: '2xl', md: '5xl' }} data-testid="c" />,
  );
});

it('defaults to semibold, and weight overrides it', () => {
  render(<Heading level={1} data-testid="a" />);
  render(<Heading level={1} weight="bold" data-testid="b" />);
  expect(screen.getByTestId('a')).toHaveClass(weight.semibold);
  expect(screen.getByTestId('b')).toHaveClass(weight.bold);
  expect(screen.getByTestId('b')).not.toHaveClass(weight.semibold);
});

it('never forwards level, and passes className and ref through', () => {
  const ref = createRef<HTMLHeadingElement>();
  render(<Heading level={2} data-testid="h" className="mine" ref={ref} />);
  const el = screen.getByTestId('h');
  expect(el.getAttribute('level')).toBeNull();
  expect(el).toHaveClass('mine');
  expect(ref.current).toBe(el);
});
