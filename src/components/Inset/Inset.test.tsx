import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Inset } from './index';

it('adds nothing by default', () => {
  render(<Inset data-testid="i" />);
  expect(screen.getByTestId('i').className).toBe('');
});

it('maps its props to padding props', () => {
  expectSameClass(
    <Inset data-testid="c" x="2" top="4" />,
    <Box data-testid="c" paddingX="2" paddingTop="4" />,
  );
  expectSameClass(
    <Inset data-testid="c" space="1" y="2" bottom="3" start="4" end="5" />,
    <Box
      data-testid="c"
      padding="1"
      paddingY="2"
      paddingBottom="3"
      paddingStart="4"
      paddingEnd="5"
    />,
  );
});

it('accepts responsive values and display', () => {
  expectSameClass(
    <Inset
      data-testid="c"
      space={{ base: '2', md: '6' }}
      display={{ md: 'none' }}
    />,
    <Box
      data-testid="c"
      padding={{ base: '2', md: '6' }}
      display={{ md: 'none' }}
    />,
  );
});

it('never forwards its shorthand props, and renders as another element', () => {
  render(<Inset as="section" data-testid="i" x="2" top="1" end="3" />);
  const el = screen.getByTestId('i');
  expect(el.tagName).toBe('SECTION');
  for (const name of ['x', 'top', 'end']) {
    expect(el.getAttribute(name)).toBeNull();
  }
});
