import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Flex } from './index';

it('defaults to a flex div', () => {
  expectSameClass(
    <Flex data-testid="c" />,
    <Box data-testid="c" display="flex" />,
  );
  render(<Flex data-testid="f" />);
  expect(screen.getByTestId('f').tagName).toBe('DIV');
});

it('maps its props to Box props', () => {
  expectSameClass(
    <Flex
      data-testid="c"
      direction="column"
      wrap="wrap"
      align="center"
      justify="between"
      gap="2"
      rowGap="3"
      columnGap="4"
    />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection="column"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="between"
      gap="2"
      rowGap="3"
      columnGap="4"
    />,
  );
});

it('accepts responsive props', () => {
  expectSameClass(
    <Flex data-testid="c" direction={{ base: 'column', md: 'row' }} />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
    />,
  );
});

it('lets display override its default, and fills in a missing base', () => {
  expectSameClass(
    <Flex data-testid="c" display={{ md: 'none' }} />,
    <Box data-testid="c" display={{ base: 'flex', md: 'none' }} />,
  );
});

it('applies layout props, native props, className, and ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(<Flex data-testid="f" id="x" className="mine" margin="2" ref={ref} />);
  const el = screen.getByTestId('f');
  expect(el).toHaveAttribute('id', 'x');
  expect(el).toHaveClass('mine');
  expect(el.getAttribute('margin')).toBeNull();
  expect(ref.current).toBe(el);
});

it('renders as another element', () => {
  render(<Flex as="nav" data-testid="f" />);
  expect(screen.getByTestId('f').tagName).toBe('NAV');
});
