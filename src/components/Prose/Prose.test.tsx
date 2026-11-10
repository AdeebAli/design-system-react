import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { NotProse, Prose } from './index';
import * as styles from './Prose.css';

it('defaults to a div with maxWidth prose and size md', () => {
  expectSameClass(
    <Prose data-testid="c" />,
    <Box
      data-testid="c"
      maxWidth="prose"
      className={`${styles.prose} ${styles.proseSize.md}`}
    />,
  );
  render(<Prose data-testid="p" />);
  expect(screen.getByTestId('p').tagName).toBe('DIV');
});

it('as="article" renders an article', () => {
  render(<Prose as="article">Text</Prose>);
  expect(screen.getByRole('article')).toHaveTextContent('Text');
});

it('size="sm" applies the sm class', () => {
  render(<Prose data-testid="p" size="sm" />);
  expect(screen.getByTestId('p')).toHaveClass(styles.proseSize.sm);
  expect(screen.getByTestId('p')).not.toHaveClass(styles.proseSize.md);
});

it('rejects dangerouslySetInnerHTML only in the type: at runtime it passes through, without a warning', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  // Spread untyped, as from JavaScript, since the type rejects it.
  const html: object = {
    dangerouslySetInnerHTML: { __html: '<h2>Title</h2><p>Body</p>' },
  };
  render(<Prose data-testid="p" {...html} />);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

it('maxWidth="full" removes the limit', () => {
  expectSameClass(
    <Prose data-testid="c" maxWidth="full" />,
    <Box
      data-testid="c"
      maxWidth="full"
      className={`${styles.prose} ${styles.proseSize.md}`}
    />,
  );
});

it('a responsive maxWidth without base gets prose at base', () => {
  expectSameClass(
    <Prose data-testid="c" maxWidth={{ lg: 'full' }} />,
    <Box
      data-testid="c"
      maxWidth={{ base: 'prose', lg: 'full' }}
      className={`${styles.prose} ${styles.proseSize.md}`}
    />,
  );
});

it('NotProse renders a div, and accepts as="span" and layout props', () => {
  render(
    <>
      <NotProse data-testid="d" marginTop="4" />
      <NotProse data-testid="s" as="span" />
    </>,
  );
  expect(screen.getByTestId('d').tagName).toBe('DIV');
  expect(screen.getByTestId('d')).toHaveClass(styles.notProse);
  expect(screen.getByTestId('s').tagName).toBe('SPAN');
  expectSameClass(
    <NotProse data-testid="c" marginTop="4" />,
    <Box data-testid="c" marginTop="4" className={styles.notProse} />,
  );
});
