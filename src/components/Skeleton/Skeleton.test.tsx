import { render, screen } from '@testing-library/react';
import { Skeleton } from './index';
import * as styles from './Skeleton.css';

it('is always aria-hidden', () => {
  render(<Skeleton data-testid="s" />);
  expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
});

it('cannot be un-hidden by a prop', () => {
  render(
    <>
      <Skeleton data-testid="a" aria-hidden="false" />
      <Skeleton data-testid="b" aria-hidden={undefined} />
      <Skeleton data-testid="c" variant="text" aria-hidden="false" />
      <Skeleton data-testid="d" variant="text" aria-hidden={undefined} />
    </>,
  );
  for (const id of ['a', 'b', 'c', 'd']) {
    expect(screen.getByTestId(id)).toHaveAttribute('aria-hidden', 'true');
  }
});

it('treats a non-finite lines as 1', () => {
  render(
    <>
      <Skeleton data-testid="nan" variant="text" lines={NaN} />
      <Skeleton data-testid="inf" variant="text" lines={Infinity} />
      <Skeleton data-testid="zero" variant="text" lines={0} />
    </>,
  );
  for (const id of ['nan', 'inf', 'zero']) {
    expect(screen.getByTestId(id).children).toHaveLength(1);
  }
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
