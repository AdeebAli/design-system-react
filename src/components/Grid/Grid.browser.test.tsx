import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { Grid } from './index';

const columnCount = () =>
  getComputedStyle(screen.getByTestId('g')).gridTemplateColumns.split(' ')
    .length;

it('changes columns at each breakpoint', async () => {
  render(<Grid data-testid="g" columns={{ base: '2', md: '4', xl: '6' }} />);
  await page.viewport(500, 600);
  expect(columnCount()).toBe(2);
  await page.viewport(768, 600);
  expect(columnCount()).toBe(4);
  await page.viewport(1280, 600);
  expect(columnCount()).toBe(6);
});

function gridHeight(autoRows?: 'equal') {
  render(
    <Grid data-testid="g" columns="1" autoRows={autoRows}>
      <div style={{ height: 10 }} />
      <div style={{ height: 50 }} />
    </Grid>,
  );
  return screen.getByTestId('g').getBoundingClientRect().height;
}

it('autoRows="equal" evens the rows', () => {
  expect(gridHeight('equal')).toBe(50 * 2 + 12);
});

it('rows size to their content by default', () => {
  expect(gridHeight()).toBe(10 + 50 + 12);
});
