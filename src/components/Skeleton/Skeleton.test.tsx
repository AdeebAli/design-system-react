import { render, screen } from '@testing-library/react';
import { Skeleton } from './index';
import * as styles from './Skeleton.css';

it('is always aria-hidden', () => {
  render(<Skeleton data-testid="s" />);
  expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
});

it('cannot be un-hidden by a prop', () => {
  render(<Skeleton data-testid="s" variant="text" />);
  expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
});

it('renders one span line per line, the last one shorter', () => {
  render(<Skeleton data-testid="s" variant="text" lines={3} />);
  const lines = screen.getByTestId('s').children;
  expect(lines).toHaveLength(3);
  for (const line of lines) expect(line.tagName).toBe('SPAN');
  expect(lines[0]).not.toHaveClass(styles.lastLine);
  expect(lines[1]).not.toHaveClass(styles.lastLine);
  expect(lines[2]).toHaveClass(styles.lastLine);
});

it('a single text line is full width', () => {
  render(<Skeleton data-testid="s" variant="text" />);
  const lines = screen.getByTestId('s').children;
  expect(lines).toHaveLength(1);
  expect(lines[0]).not.toHaveClass(styles.lastLine);
});

it('applies a class per variant', () => {
  render(
    <>
      <Skeleton data-testid="rect" />
      <Skeleton data-testid="circle" variant="circle" />
    </>,
  );
  expect(screen.getByTestId('rect')).toHaveClass(styles.rect);
  expect(screen.getByTestId('circle')).toHaveClass(styles.circle);
  expect(screen.getByTestId('circle')).not.toHaveClass(styles.rect);
});

it('renders a div by default and a span with as="span"', () => {
  render(
    <>
      <Skeleton data-testid="d" />
      <Skeleton data-testid="s" as="span" />
      <Skeleton data-testid="t" as="span" variant="text" lines={2} />
    </>,
  );
  expect(screen.getByTestId('d').tagName).toBe('DIV');
  expect(screen.getByTestId('s').tagName).toBe('SPAN');
  expect(screen.getByTestId('t').tagName).toBe('SPAN');
});

it('defaults to full width for rect and text, not circle, and width overrides', () => {
  render(
    <>
      <Skeleton data-testid="rect" />
      <Skeleton data-testid="text" variant="text" />
      <Skeleton data-testid="circle" variant="circle" />
      <Skeleton data-testid="w" width="10" />
    </>,
  );
  const cls = (id: string) => screen.getByTestId(id).className;
  expect(cls('rect')).toBe(
    render(<Skeleton data-testid="x" width="full" />).getByTestId('x')
      .className,
  );
  expect(cls('rect')).not.toBe(cls('circle'));
  expect(cls('w')).not.toBe(cls('rect'));
  expect(cls('text')).not.toBe(cls('circle'));
});
