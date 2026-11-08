import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Container } from './index';

it('defaults to lg, centered, with responsive side padding', () => {
  expectSameClass(
    <Container data-testid="c" />,
    <Box
      data-testid="c"
      maxWidth="container.lg"
      marginX="auto"
      paddingX={{ base: '4', md: '6' }}
    />,
  );
});

it.each([
  ['sm', 'container.sm'],
  ['md', 'container.md'],
  ['xl', 'container.xl'],
  ['prose', 'prose'],
  ['full', 'full'],
] as const)('size %s maps to maxWidth %s', (size, maxWidth) => {
  expectSameClass(
    <Container data-testid="c" size={size} />,
    <Box
      data-testid="c"
      maxWidth={maxWidth}
      marginX="auto"
      paddingX={{ base: '4', md: '6' }}
    />,
  );
});

it('paddingX="0" removes the side padding', () => {
  expectSameClass(
    <Container data-testid="c" paddingX="0" />,
    <Box data-testid="c" maxWidth="container.lg" marginX="auto" paddingX="0" />,
  );
});

it('accepts display', () => {
  expectSameClass(
    <Container data-testid="c" display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ md: 'none' }}
      maxWidth="container.lg"
      marginX="auto"
      paddingX={{ base: '4', md: '6' }}
    />,
  );
});

it('never forwards size', () => {
  render(<Container data-testid="k" size="sm" />);
  expect(screen.getByTestId('k').getAttribute('size')).toBeNull();
});

it('renders as another element', () => {
  render(<Container as="main" data-testid="k" />);
  expect(screen.getByTestId('k').tagName).toBe('MAIN');
});
