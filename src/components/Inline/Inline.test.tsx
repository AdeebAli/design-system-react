import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Inline } from './index';

it('defaults to a wrapping, centered row with a gap of 2', () => {
  expectSameClass(
    <Inline data-testid="c" />,
    <Box
      data-testid="c"
      display="flex"
      gap="2"
      flexWrap="wrap"
      alignItems="center"
    />,
  );
});

it('maps its props to Box props', () => {
  expectSameClass(
    <Inline
      data-testid="c"
      gap="4"
      wrap="nowrap"
      align="start"
      justify="between"
    />,
    <Box
      data-testid="c"
      display="flex"
      gap="4"
      flexWrap="nowrap"
      alignItems="start"
      justifyContent="between"
    />,
  );
});

it('lets display override its default, and fills in a missing base', () => {
  expectSameClass(
    <Inline data-testid="c" display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ base: 'flex', md: 'none' }}
      gap="2"
      flexWrap="wrap"
      alignItems="center"
    />,
  );
});

it('renders as another element', () => {
  render(<Inline as="ul" data-testid="i" />);
  expect(screen.getByTestId('i').tagName).toBe('UL');
});
