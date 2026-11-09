import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { card } from './Card.css';
import { Card } from './index';

it('defaults to a flex column with md padding and a gap of 2', () => {
  expectSameClass(
    <Card data-testid="c" />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection="column"
      padding="4"
      gap="2"
      className={card({ surface: 'default', clip: false })}
    />,
  );
});

it('maps span to grid props', () => {
  expectSameClass(
    <Card data-testid="c" span="2x2" />,
    <Card
      data-testid="c"
      gridColumn={{ base: 'full', md: 'span-2' }}
      gridRow="span-2"
    />,
  );
});

it('explicit gridColumn replaces span on that axis only', () => {
  expectSameClass(
    <Card data-testid="c" span="2x2" gridColumn="span-1" />,
    <Card data-testid="c" gridColumn="span-1" gridRow="span-2" />,
  );
});

it.each([
  ['none', '0'],
  ['sm', '3'],
  ['md', '4'],
  ['lg', '6'],
] as const)('padding %s maps to space %s', (padding, space) => {
  expectSameClass(
    <Card data-testid="c" padding={padding} />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection="column"
      padding={space}
      gap="2"
      className={card({ surface: 'default', clip: false })}
    />,
  );
});

it('accepts responsive padding and gap', () => {
  expectSameClass(
    <Card data-testid="c" padding={{ base: 'sm', md: 'lg' }} gap="4" />,
    <Box
      data-testid="c"
      display="flex"
      flexDirection="column"
      padding={{ base: '3', md: '6' }}
      gap="4"
      className={card({ surface: 'default', clip: false })}
    />,
  );
});

it('keeps flex below a responsive display with no base', () => {
  expectSameClass(
    <Card data-testid="c" display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ base: 'flex', md: 'none' }}
      flexDirection="column"
      padding="4"
      gap="2"
      className={card({ surface: 'default', clip: false })}
    />,
  );
});

it('surface and clip change the recipe classes', () => {
  render(<Card data-testid="c" surface="sunken" clip />);
  expect(screen.getByTestId('c').className).toContain(
    card({ surface: 'sunken', clip: true }),
  );
});

it('renders as another element', () => {
  render(<Card as="article" data-testid="c" />);
  expect(screen.getByTestId('c').tagName).toBe('ARTICLE');
});

describe('interactive', () => {
  it.each(['div', 'li'] as const)('warns once on %s', (as) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <>
        <Card as={as} interactive />
        <Card as={as} interactive />
      </>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/Card.*interactive/);
    warn.mockRestore();
  });

  it('does not warn on a link or a custom component', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const RouterLink = (p: { href: string }) => <a {...p}>Link</a>;
    render(
      <>
        <Card as="a" href="/x" interactive />
        <Card as={RouterLink} href="/y" interactive />
      </>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('renders a link with the interactive class', () => {
    render(
      <Card as="a" href="/blog" interactive>
        Post
      </Card>,
    );
    expect(screen.getByRole('link', { name: 'Post' })).toHaveAttribute(
      'href',
      '/blog',
    );
  });
});
