import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Grid } from './index';

it('defaults to one column with a gap of 3', () => {
  expectSameClass(
    <Grid data-testid="c" />,
    <Box data-testid="c" display="grid" gridTemplateColumns="1" gap="3" />,
  );
});

it('maps its props to Box props', () => {
  expectSameClass(
    <Grid
      data-testid="c"
      columns={{ base: '2', md: '4' }}
      gap="1"
      rowGap="2"
      columnGap="4"
    />,
    <Box
      data-testid="c"
      display="grid"
      gridTemplateColumns={{ base: '2', md: '4' }}
      gap="1"
      rowGap="2"
      columnGap="4"
    />,
  );
});

it('lets display override its default, and fills in a missing base', () => {
  expectSameClass(
    <Grid data-testid="c" columns="4" display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ base: 'grid', md: 'none' }}
      gridTemplateColumns="4"
      gap="3"
    />,
  );
});

it('adds a class only for autoRows="equal"', () => {
  render(<Grid data-testid="a" />);
  render(<Grid data-testid="b" autoRows="equal" />);
  expect(screen.getByTestId('b').classList.length).toBe(
    screen.getByTestId('a').classList.length + 1,
  );
});

it('never forwards autoRows or columns', () => {
  render(<Grid data-testid="g" autoRows="equal" columns="2" />);
  expect(screen.getByTestId('g').getAttribute('autorows')).toBeNull();
  expect(screen.getByTestId('g').getAttribute('columns')).toBeNull();
});

it('renders as another element', () => {
  render(<Grid as="section" data-testid="g" />);
  expect(screen.getByTestId('g').tagName).toBe('SECTION');
});
