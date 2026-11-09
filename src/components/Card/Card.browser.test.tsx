import { render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { Grid } from '../Grid';
import { Card } from './index';

function bento() {
  render(
    <Grid data-testid="g" columns={{ base: '2', md: '4' }}>
      <Card data-testid="wide" span="3x1">
        Wide
      </Card>
      <Card data-testid="one">One</Card>
    </Grid>,
  );
  return {
    grid: screen.getByTestId('g'),
    wide: screen.getByTestId('wide'),
    one: screen.getByTestId('one'),
  };
}

it('a wide card fills the row below md without overflowing', async () => {
  await page.viewport(390, 800);
  const { grid, wide, one } = bento();
  const width = grid.getBoundingClientRect().width;
  expect(grid.scrollWidth).toBe(grid.clientWidth);
  expect(wide.getBoundingClientRect().width).toBe(width);
  // No extra implicit column: the grid keeps exactly two equal columns.
  expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(2);
  expect(one.getBoundingClientRect().width).toBeCloseTo((width - 12) / 2, 0);
});

it('a wide card spans its columns from md up', async () => {
  await page.viewport(1280, 800);
  const { grid, wide } = bento();
  const gap = 12;
  const column = (grid.getBoundingClientRect().width - 3 * gap) / 4;
  expect(wide.getBoundingClientRect().width).toBeCloseTo(
    3 * column + 2 * gap,
    0,
  );
});

it("a long unbroken word doesn't widen its column", async () => {
  await page.viewport(390, 800);
  render(
    <Grid data-testid="g" columns="2">
      <Card data-testid="long">{'x'.repeat(200)}</Card>
      <Card data-testid="short">y</Card>
    </Grid>,
  );
  const long = screen.getByTestId('long');
  const short = screen.getByTestId('short').getBoundingClientRect().width;
  expect(long.getBoundingClientRect().width).toBeCloseTo(short, 0);
  // The word wraps inside the card instead of spilling past its edge.
  expect(long.scrollWidth).toBe(long.clientWidth);
});

it('marginTop="auto" pushes a child to the bottom', () => {
  render(
    <Card data-testid="c" height="full" style={{ height: 300 }}>
      <span data-testid="top">Top</span>
      <span data-testid="bottom" style={{ marginTop: 'auto' }}>
        Bottom
      </span>
    </Card>,
  );
  const card = screen.getByTestId('c').getBoundingClientRect();
  const bottom = screen.getByTestId('bottom').getBoundingClientRect();
  const top = screen.getByTestId('top').getBoundingClientRect();
  // Children stack in a column.
  expect(top.bottom).toBeLessThanOrEqual(bottom.top);
  // 16px padding plus the 1px border.
  expect(card.bottom - bottom.bottom).toBeCloseTo(17, 0);
});

it('clip hides overflow so content follows the corners', () => {
  render(<Card data-testid="c" padding="none" clip />);
  expect(getComputedStyle(screen.getByTestId('c')).overflow).toBe('hidden');
});

it('a theme override swaps the shadow for a border, with no component change', () => {
  render(
    <div
      style={
        {
          '--ds-shadow-card': 'none',
          '--ds-color-border-surface': 'rgb(1, 2, 3)',
        } as React.CSSProperties
      }
    >
      <Card data-testid="c" />
    </div>,
  );
  const styles = getComputedStyle(screen.getByTestId('c'));
  expect(styles.boxShadow).toBe('none');
  expect(styles.borderTopColor).toBe('rgb(1, 2, 3)');
  expect(styles.borderTopWidth).toBe('1px');
});

it('an interactive card transitions transform only', () => {
  render(<Card as="a" href="#x" data-testid="c" interactive />);
  const styles = getComputedStyle(screen.getByTestId('c'));
  expect(styles.transitionProperty).toBe('transform');
  expect(styles.textDecorationLine).toBe('none');
});

it('an interactive card lifts on hover', async () => {
  render(<Card as="a" href="#x" data-testid="c" interactive />);
  const el = screen.getByTestId('c');
  expect(getComputedStyle(el).transform).toBe('none');
  await userEvent.hover(el);
  await expect
    .poll(() => getComputedStyle(el).transform)
    .toBe('matrix(1, 0, 0, 1, 0, -1)');
});
