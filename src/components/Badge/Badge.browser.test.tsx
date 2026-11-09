import { render, screen } from '@testing-library/react';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { Badge } from './index';

it('sizes startIcon to its 12px text', () => {
  render(
    <Badge startIcon={<Icon icon={ArrowUpIcon} data-testid="i" />}>Up</Badge>,
  );
  const box = screen.getByTestId('i').getBoundingClientRect();
  expect(box.width).toBe(12);
  expect(box.height).toBe(12);
});

it('is a fully rounded pill', () => {
  render(<Badge data-testid="b">Pro</Badge>);
  const b = screen.getByTestId('b');
  expect(
    parseFloat(getComputedStyle(b).borderTopLeftRadius),
  ).toBeGreaterThanOrEqual(b.getBoundingClientRect().height / 2);
});

it.each([
  ['success', 'soft', '--ds-color-bg-success-subtle', '--ds-color-fg-success'],
  ['success', 'solid', '--ds-color-bg-success', '--ds-color-fg-on-status'],
  ['neutral', 'solid', '--ds-color-bg-inverse', '--ds-color-fg-inverse'],
  ['accent', 'soft', '--ds-color-bg-accent-subtle', '--ds-color-fg-accent'],
] as const)('%s %s uses its token colors', (tone, variant, bg, fg) => {
  render(
    <>
      <Badge data-testid="b" tone={tone} variant={variant}>
        x
      </Badge>
      <span
        data-testid="probe"
        style={{ background: `var(${bg})`, color: `var(${fg})` }}
      />
    </>,
  );
  const badge = getComputedStyle(screen.getByTestId('b'));
  const probe = getComputedStyle(screen.getByTestId('probe'));
  expect(badge.backgroundColor).toBe(probe.backgroundColor);
  expect(badge.color).toBe(probe.color);
});

it('a long label truncates inside a narrow container, keeping its full text', () => {
  const text = 'An unusually long status label from user data';
  render(
    <div data-testid="box" style={{ width: 120 }}>
      <Badge data-testid="b">{text}</Badge>
    </div>,
  );
  const badge = screen.getByTestId('b');
  const box = screen.getByTestId('box').getBoundingClientRect();
  expect(badge.getBoundingClientRect().right).toBeLessThanOrEqual(box.right);
  expect(badge.textContent).toBe(text);
  const label = badge.lastElementChild as HTMLElement;
  expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
});

it('a short label keeps its natural width', () => {
  render(
    <div style={{ width: 400 }}>
      <Badge data-testid="b">Pro</Badge>
    </div>,
  );
  expect(screen.getByTestId('b').getBoundingClientRect().width).toBeLessThan(
    60,
  );
});

it('a long label truncates as a flex item, without overflowing its row', () => {
  const text = 'An unusually long status label from user data';
  render(
    <div data-testid="row" style={{ display: 'flex', width: 120 }}>
      <Badge data-testid="b">{text}</Badge>
    </div>,
  );
  const row = screen.getByTestId('row');
  const badge = screen.getByTestId('b');
  expect(badge.getBoundingClientRect().right).toBeLessThanOrEqual(
    row.getBoundingClientRect().right,
  );
  expect(row.scrollWidth).toBe(row.clientWidth);
  const label = badge.lastElementChild as HTMLElement;
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
});

it('a long label truncates as a grid item, without widening its column', () => {
  const text = 'An unusually long status label from user data';
  render(
    <div
      data-testid="grid"
      style={{ display: 'grid', gridTemplateColumns: '1fr', width: 120 }}
    >
      <Badge data-testid="b">{text}</Badge>
    </div>,
  );
  const grid = screen.getByTestId('grid');
  const badge = screen.getByTestId('b');
  expect(badge.getBoundingClientRect().right).toBeLessThanOrEqual(
    grid.getBoundingClientRect().right,
  );
  expect(grid.scrollWidth).toBe(grid.clientWidth);
  const label = badge.lastElementChild as HTMLElement;
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
});
