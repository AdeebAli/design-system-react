import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Stack } from './index';

it('defaults to a column with a gap of 3', () => {
  expectSameClass(
    <Stack data-testid="c" />,
    <Box data-testid="c" display="flex" flexDirection="column" gap="3" />,
  );
});

it('maps its props to Box props', () => {
  expectSameClass(
    <Stack data-testid="c" gap="6" align="center" justify="end" />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection="column"
      gap="6"
      alignItems="center"
      justifyContent="end"
    />,
  );
});

it('lets display override its default, and fills in a missing base', () => {
  expectSameClass(
    <Stack data-testid="c" display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ base: 'flex', md: 'none' }}
      flexDirection="column"
      gap="3"
    />,
  );
});

it('renders as another element', () => {
  render(<Stack as="ul" data-testid="s" />);
  expect(screen.getByTestId('s').tagName).toBe('UL');
});
