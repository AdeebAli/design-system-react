import { render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { vars } from '../../themes/contract.css';
import { Button } from '../Button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../Menu';
import { Prose } from '../Prose';
import {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
  type TableProps,
} from './index';

const noop = () => undefined;
const COLS = 10;
const ROWS = 24;
const css = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const wrapperOf = () => document.querySelector<HTMLElement>('[data-ds-table]')!;
const headerCell = (index = 0) =>
  document.querySelectorAll<HTMLElement>('thead th')[index]!;
const rect = (el: Element) => el.getBoundingClientRect();
const transparent = 'rgba(0, 0, 0, 0)';

/** The computed color a token resolves to, via a probe element. */
function resolved(token: string): string {
  const probe = document.createElement('div');
  probe.style.background = token;
  document.body.append(probe);
  const color = css(probe).backgroundColor;
  probe.remove();
  return color;
}

interface GridProps extends TableProps {
  selectedRow?: number;
  boxHeight?: number;
}

/** A wide, tall table in a box of fixed height, so the wrapper scrolls both ways. */
function Grid({ selectedRow, boxHeight = 240, ...props }: GridProps) {
  return (
    <div style={{ height: boxHeight, width: 360 }}>
      <Table aria-label="Grid" maxHeight="full" scrollable {...props}>
        <TableHead>
          <TableRow>
            {Array.from({ length: COLS }, (_, c) => (
              <TableHeader key={c}>{`Col${c}`}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: ROWS }, (_, r) => (
            <TableRow key={r} selected={r === selectedRow}>
              {Array.from({ length: COLS }, (_, c) =>
                c === 0 ? (
                  <TableHeader key={c} scope="row">{`Row ${r}`}</TableHeader>
                ) : (
                  <TableCell key={c}>
                    <Button size="sm" data-cell={`${r}-${c}`}>
                      {`R${r}C${c}`}
                    </Button>
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell colSpan={COLS}>Total</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(800, 600);
});

it('accepts maxHeight="screen" and limits the wrapper to the viewport', async () => {
  await page.viewport(800, 300);
  render(
    <Table aria-label="Tall" maxHeight="screen">
      <TableBody>
        {Array.from({ length: 40 }, (_, r) => (
          <TableRow key={r}>
            <TableCell>{r}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>,
  );
  expect(wrapperOf().clientHeight).toBeLessThanOrEqual(300);
  expect(wrapperOf().scrollHeight).toBeGreaterThan(300);
});

it('a wide table scrolls in its wrapper at 320px without widening the page or breaking short words', async () => {
  await page.viewport(320, 600);
  render(
    <Table aria-label="Wide">
      <TableHead>
        <TableRow>
          {Array.from({ length: COLS }, (_, c) => (
            <TableHeader key={c}>Enterprise</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          {Array.from({ length: COLS }, (_, c) => (
            <TableCell key={c}>Quarterly</TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>,
  );
  const wrapper = wrapperOf();
  expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  for (const cell of document.querySelectorAll('th, td')) {
    const range = document.createRange();
    range.selectNodeContents(cell);
    expect(range.getClientRects()).toHaveLength(1);
  }
});

it('a long URL scrolls in the wrapper and does not widen the page', async () => {
  await page.viewport(320, 600);
  render(
    <Table aria-label="Urls">
      <TableBody>
        <TableRow>
          <TableCell>
            https://example.com/a/very/long/path/that/keeps/going/without/spaces/at/all/so/it/must/wrap
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  // break-word doesn't shrink min-content, so the wrapper scrolls; the page doesn't widen.
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});

it('scrollable scrolls by keyboard', async () => {
  render(<Grid />);
  const wrapper = screen.getByRole('region', { name: 'Grid' });
  wrapper.focus();
  expect(wrapper).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(() => wrapper.scrollLeft).toBeGreaterThan(0);
  await userEvent.keyboard('{ArrowDown}');
  await expect.poll(() => wrapper.scrollTop).toBeGreaterThan(0);
});

it('stickyHeader stays visible with its bottom border; rows do not show through', async () => {
  render(<Grid stickyHeader />);
  const wrapper = wrapperOf();
  wrapper.scrollTop = 200;
  await expect.poll(() => wrapper.scrollTop).toBeGreaterThan(100);
  const th = headerCell(2);
  expect(rect(th).top).toBeCloseTo(rect(wrapper).top, 0);
  expect(css(th).borderBottomWidth).toBe('1px');
  expect(css(th).backgroundColor).toBe(resolved(vars.color.bg.surface));
  const r = rect(th);
  const top = document.elementFromPoint(
    r.left + r.width / 2,
    r.top + r.height / 2,
  );
  expect(top?.closest('th')).toBe(th);
  // Just under the rule, a body cell shows, so the header isn't the whole column.
  const below = document.elementFromPoint(r.left + r.width / 2, r.bottom + 4);
  expect(below?.closest('td, tbody th')).not.toBeNull();
});

describe.each([
  ['ltr', 1],
  ['rtl', -1],
] as const)('stickyFirstColumn in %s', (dir, sign) => {
  it('stays in view with stickyHeader, and a colSpan cell does not stick', async () => {
    render(
      <div dir={dir}>
        <Grid stickyHeader stickyFirstColumn />
      </div>,
    );
    const wrapper = wrapperOf();
    wrapper.scrollLeft = sign * 400;
    wrapper.scrollTop = 120;
    await expect.poll(() => Math.abs(wrapper.scrollLeft)).toBeGreaterThan(100);
    const w = rect(wrapper);
    const rowHeader = screen.getByRole('rowheader', { name: 'Row 5' });
    const edge = dir === 'ltr' ? rect(rowHeader).left : rect(rowHeader).right;
    expect(edge).toBeCloseTo(dir === 'ltr' ? w.left : w.right, 0);
    expect(css(rowHeader).borderInlineEndWidth).toBe('1px');
    // The corner stays in the corner of both.
    const corner = headerCell(0);
    expect(rect(corner).top).toBeCloseTo(w.top, 0);
    expect(dir === 'ltr' ? rect(corner).left : rect(corner).right).toBeCloseTo(
      dir === 'ltr' ? w.left : w.right,
      0,
    );
    expect(Number(css(corner).zIndex)).toBeGreaterThan(
      Number(css(rowHeader).zIndex),
    );
    // The colSpan cell scrolls away with the table.
    expect(css(screen.getByText('Total')).position).not.toBe('sticky');
  });
});

it('hovered and selected rows keep their background and bar in the sticky column', async () => {
  render(<Grid stickyFirstColumn selectedRow={3} />);
  const selected = screen.getByRole('rowheader', { name: 'Row 3' });
  const row = selected.closest('tr') as HTMLElement;
  expect(css(row).backgroundColor).toBe(resolved(vars.color.bg.accentSubtle));
  expect(css(selected).backgroundColor).toBe(
    resolved(vars.color.bg.accentSubtle),
  );
  const bar = css(selected, '::before');
  expect(bar.width).toBe('2px');
  expect(bar.backgroundColor).toBe(resolved(vars.color.bg.accent));

  const other = screen.getByRole('rowheader', { name: 'Row 1' });
  expect(css(other).backgroundColor).toBe(resolved(vars.color.bg.surface));
  await userEvent.hover(other);
  await expect
    .poll(() => css(other).backgroundColor)
    .toBe(resolved(vars.color.bg.muted));
  expect(css(other.closest('tr') as Element).backgroundColor).toBe(
    resolved(vars.color.bg.muted),
  );
});

it('stickyBackground applies each value to sticky cells only', () => {
  const values = ['canvas', 'surface', 'raised', 'sunken'] as const;
  for (const value of values) {
    const { unmount } = render(
      <Grid stickyHeader stickyFirstColumn stickyBackground={value} />,
    );
    const expected = resolved(vars.color.bg[value]);
    expect(css(headerCell(3)).backgroundColor).toBe(expected);
    expect(
      css(screen.getByRole('rowheader', { name: 'Row 2' })).backgroundColor,
    ).toBe(expected);
    expect(
      css(screen.getByText('R2C3').closest('td') as Element).backgroundColor,
    ).toBe(transparent);
    unmount();
  }
});

it('stickyBackground has no effect without a sticky prop', () => {
  render(<Grid stickyBackground="sunken" />);
  expect(css(headerCell(1)).backgroundColor).toBe(transparent);
});

describe.each(['md', 'sm'] as const)(
  'a focused element scrolled into view is not under a sticky part (%s)',
  (size) => {
    it('clears the sticky header and first column', async () => {
      render(<Grid size={size} stickyHeader stickyFirstColumn />);
      const wrapper = wrapperOf();
      const target = document.querySelector<HTMLElement>('[data-cell="14-2"]')!;
      // Scroll away first, so focus has to scroll back toward the sticky parts.
      wrapper.scrollLeft = 1000;
      wrapper.scrollTop = 2000;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      await expect.poll(() => wrapper.scrollTop).toBeLessThan(2000);
      const header = rect(headerCell(0));
      const column = rect(screen.getByRole('rowheader', { name: 'Row 14' }));
      const t = rect(target);
      expect(t.top).toBeGreaterThanOrEqual(header.bottom);
      expect(t.left).toBeGreaterThanOrEqual(column.right);
      // From behind the sticky parts: target partly under header and column.
      const w = rect(wrapper);
      const hidden = document.querySelector<HTMLElement>('[data-cell="10-5"]')!;
      wrapper.scrollTop += rect(hidden).top - w.top - 2;
      wrapper.scrollLeft += rect(hidden).left - w.left - 2;
      expect(rect(hidden).top).toBeLessThan(header.bottom);
      expect(rect(hidden).left).toBeLessThan(column.right);
      hidden.focus({ preventScroll: true });
      hidden.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      await expect
        .poll(() => rect(hidden).top)
        .toBeGreaterThanOrEqual(header.bottom);
      expect(rect(hidden).left).toBeGreaterThanOrEqual(column.right);
    });

    it('the header reserve is its height plus `space.1`', () => {
      render(<Grid size={size} stickyHeader />);
      const probe = document.createElement('div');
      probe.style.height = vars.space['1'];
      document.body.append(probe);
      const gap = rect(probe).height;
      probe.remove();
      // Scroll positions snap to whole pixels, so compare the padding itself.
      const reserve = parseFloat(css(wrapperOf()).scrollPaddingTop);
      expect(reserve).toBeCloseTo(rect(headerCell(0)).height + gap, 1);
    });
  },
);

it('focus rings and the selected bar are not clipped by the wrapper', async () => {
  render(
    <Table aria-label="Edge" stickyFirstColumn>
      <TableBody>
        <TableRow selected>
          <TableCell>
            <Button size="sm">Edge</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  const button = screen.getByRole('button', { name: 'Edge' });
  await userEvent.tab();
  expect(button).toHaveFocus();
  const style = css(button);
  const reach =
    parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
  expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  const b = rect(button);
  const w = rect(wrapperOf());
  expect(b.left - reach).toBeGreaterThanOrEqual(w.left);
  expect(b.top - reach).toBeGreaterThanOrEqual(w.top);
  expect(b.right + reach).toBeLessThanOrEqual(w.right);
  expect(b.bottom + reach).toBeLessThanOrEqual(w.bottom);
  const cell = button.closest('td') as HTMLElement;
  expect(rect(cell).left).toBeGreaterThanOrEqual(w.left);
  expect(css(cell, '::before').width).toBe('2px');
});

it('a Menu opened from a cell sits above the sticky header and column', async () => {
  render(
    <div style={{ height: 300, width: 520 }}>
      <Table aria-label="Menus" maxHeight="full" stickyHeader stickyFirstColumn>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Plan</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 8 }, (_, r) => (
            <TableRow key={r}>
              <TableHeader scope="row">
                {r === 0 ? (
                  <Menu>
                    <MenuTrigger>
                      <Button size="sm">Actions</Button>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem>Edit</MenuItem>
                      <MenuItem>Delete</MenuItem>
                      <MenuItem>Archive</MenuItem>
                    </MenuContent>
                  </Menu>
                ) : (
                  `Row ${r}`
                )}
              </TableHeader>
              <TableCell>Pro</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
  const popup = await screen.findByRole('menu');
  await expect.poll(() => css(popup).opacity).toBe('1');
  const p = rect(popup);
  const x = p.left + p.width / 2;
  const y = p.top + p.height / 2;
  const stack = document.elementsFromPoint(x, y);
  // The popup overlaps a sticky first-column cell, and is still on top.
  expect(
    stack.some(
      (el) =>
        el.closest('tbody th') &&
        css(el.closest('th') as Element).position === 'sticky',
    ),
  ).toBe(true);
  expect(popup.contains(document.elementFromPoint(x, y))).toBe(true);
});

it('keeps both borders of the header and the first body row, a 2px rule between them (Spec 13)', () => {
  render(<Grid />);
  const th = headerCell(1);
  const td = screen.getByText('R0C1').closest('td') as HTMLElement;
  expect(css(th).borderBottomWidth).toBe('1px');
  expect(css(td).borderTopWidth).toBe('1px');
  // Measured: the two borders touch, so they stack into one 2px rule.
  expect(rect(td).top - rect(th).bottom).toBe(0);
});

it('inside Prose: keeps its own styles, the wrapper has Prose margins, and still scrolls', async () => {
  await page.viewport(320, 600);
  render(
    <Prose>
      <p>Before</p>
      <Table aria-label="Prose table">
        <TableHead>
          <TableRow>
            {Array.from({ length: COLS }, (_, c) => (
              <TableHeader key={c}>Quarterly</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Array.from({ length: COLS }, (_, c) => (
              <TableCell key={c}>Enterprise</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      <p>After</p>
    </Prose>,
  );
  const wrapper = wrapperOf();
  const fontSize = parseFloat(css(wrapper).fontSize);
  expect(parseFloat(css(wrapper).marginTop)).toBeCloseTo(fontSize * 1.25, 0);
  expect(parseFloat(css(wrapper).marginBottom)).toBeCloseTo(fontSize * 1.25, 0);
  const table = screen.getByRole('table');
  expect(css(table).marginTop).toBe('0px');
  expect(css(table).borderCollapse).toBe('separate');
  const cell = document.querySelector('tbody td')!;
  expect(css(cell).overflowWrap).toBe('break-word');
  expect(css(cell).fontSize).toBe(css(resolvedProbe('sm')).fontSize);
  expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);
});

function resolvedProbe(size: 'sm'): HTMLElement {
  const probe = document.createElement('div');
  probe.style.fontSize = vars.font.size[size];
  document.body.append(probe);
  return probe;
}

const LONG =
  'A very long customer name that goes on and on and on and on and on';

/** The sticky first column's fixed width in pixels: half of `size.dialog.sm`. */
function stickyColumnWidth(): number {
  const probe = document.createElement('div');
  probe.style.width = `calc(${vars.size.dialog.sm} / 2)`;
  document.body.append(probe);
  const width = rect(probe).width;
  probe.remove();
  return width;
}

const UNBROKEN =
  'Pneumonoultramicroscopicsilicovolcanoconiosis-Holdings-Limited';

describe('a sticky first column has a fixed width, so focus lands clear of it', () => {
  it.each([
    ['a long row header', LONG, false],
    ['an unbroken word', UNBROKEN, false],
    ['a sort header in the corner', LONG, true],
  ])('with %s', async (_label, text, sortable) => {
    render(
      <div style={{ width: 360 }}>
        <Table
          aria-label="Long"
          stickyFirstColumn
          stickyHeader
          scrollable
          style={{ minWidth: 1000 }}
        >
          <TableHead>
            <TableRow>
              {sortable ? (
                <TableSortHeader direction="none" onSort={noop}>
                  {text}
                </TableSortHeader>
              ) : (
                <TableHeader>Name</TableHeader>
              )}
              {Array.from({ length: 6 }, (_, c) => (
                <TableHeader key={c}>{`Col ${c}`}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 3 }, (_, r) => (
              <TableRow key={r}>
                <TableHeader scope="row">{`${text} ${r}`}</TableHeader>
                {Array.from({ length: 6 }, (_, c) => (
                  <TableCell key={c}>
                    <Button size="sm" data-cell={`${r}-${c}`}>
                      {`Column ${c} of ${r}`}
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>,
    );
    const rowHeader = screen.getByRole('rowheader', { name: `${text} 1` });
    expect(rect(rowHeader).width).toBeCloseTo(stickyColumnWidth(), 0);
    // Content wraps inside the column instead of spilling past it.
    const corner = document.querySelector('thead th')!;
    for (const cell of [rowHeader, corner]) {
      for (const child of cell.querySelectorAll('*')) {
        expect(rect(child).right).toBeLessThanOrEqual(rect(cell).right + 0.5);
      }
    }
    const target = document.querySelector<HTMLElement>('[data-cell="1-2"]')!;
    target.focus();
    await expect
      .poll(() => rect(target).left)
      .toBeGreaterThanOrEqual(rect(rowHeader).right);
    expect(rect(target).right).toBeLessThanOrEqual(rect(wrapperOf()).right);
  });
});

describe('a first-column cell that spans rows', () => {
  // Rows the span covers are marked `spanned`, so their first cell, which is
  // really in the second column, doesn't stick. One ordinary row follows.
  it.each([2, 3, 12])(
    'with rowSpan=%i, the spanning cell sticks and the rows it covers scroll',
    (span) => {
      render(
        <div style={{ width: 360 }}>
          <Table
            aria-label="Spans"
            stickyFirstColumn
            scrollable
            style={{ minWidth: 1000 }}
          >
            <TableBody>
              {Array.from({ length: span + 1 }, (_, r) => (
                <TableRow key={r} spanned={r > 0 && r < span}>
                  {r === 0 ? (
                    <TableHeader scope="row" rowSpan={span}>
                      Europe
                    </TableHeader>
                  ) : r === span ? (
                    <TableHeader scope="row">After</TableHeader>
                  ) : null}
                  <TableCell data-first={r}>{`Q${r}`}</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>,
      );
      const europe = screen.getByRole('rowheader', { name: 'Europe' });
      const after = screen.getByRole('rowheader', { name: 'After' });
      expect(rect(europe).width).toBeCloseTo(stickyColumnWidth(), 0);
      const covered = Array.from({ length: span - 1 }, (_, r) =>
        document.querySelector(`[data-first="${r + 1}"]`)!,
      );
      const before = covered.map((cell) => rect(cell).left);
      const europeLeft = rect(europe).left;
      wrapperOf().scrollLeft = 400;
      // Past the column's width, so a sticky cell would have pinned. The
      // spanning cell and the next row header stay; covered cells scroll.
      expect(rect(europe).left).toBeCloseTo(europeLeft, 0);
      expect(rect(after).left).toBeCloseTo(europeLeft, 0);
      covered.forEach((cell, n) => {
        expect(rect(cell).left).toBeCloseTo(before[n]! - 400, 0);
      });
    },
  );

  it('a second-column span inside a covered row leaves later row headers sticky', () => {
    render(
      <div style={{ width: 360 }}>
        <Table
          aria-label="Staggered"
          stickyFirstColumn
          scrollable
          style={{ minWidth: 1000 }}
        >
          <TableBody>
            <TableRow>
              <TableHeader scope="row" rowSpan={2}>
                Europe
              </TableHeader>
              <TableCell>X</TableCell>
              <TableCell>1</TableCell>
            </TableRow>
            <TableRow spanned>
              <TableCell rowSpan={2}>Group</TableCell>
              <TableCell>Y</TableCell>
            </TableRow>
            <TableRow>
              <TableHeader scope="row">Asia</TableHeader>
              <TableCell>Z</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    );
    const asia = screen.getByRole('rowheader', { name: 'Asia' });
    const left = rect(asia).left;
    wrapperOf().scrollLeft = 400;
    expect(rect(asia).left).toBeCloseTo(left, 0);
  });
});

it('the sticky column reserve is its fixed width plus `space.1`', async () => {
  render(
    <div style={{ width: 360 }}>
      <Table aria-label="Gap" stickyFirstColumn scrollable>
        <TableBody>
          <TableRow>
            <TableHeader scope="row">Row</TableHeader>
            {Array.from({ length: 6 }, (_, c) => (
              <TableCell key={c}>
                <Button size="sm" data-cell={c}>{`Column ${c}`}</Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>,
  );
  const wrapper = wrapperOf();
  wrapper.scrollLeft = wrapper.scrollWidth;
  // Aligning to the start lands exactly on the scroll padding.
  const target = document.querySelector<HTMLElement>('[data-cell="0"]')!;
  target.scrollIntoView({ inline: 'start', block: 'nearest' });
  const probe = document.createElement('div');
  probe.style.width = vars.space['1'];
  document.body.append(probe);
  const gap = rect(probe).width;
  probe.remove();
  const rowHeader = screen.getByRole('rowheader', { name: 'Row' });
  // The column's end border is inside its fixed width, so the reserve is that
  // width plus the gap.
  await expect
    .poll(() => rect(target).left - rect(rowHeader).right)
    .toBeCloseTo(gap, 0);
});

it('focus clears a sticky header made of sort buttons', async () => {
  render(
    <div style={{ height: 240, width: 360 }}>
      <Table aria-label="Sort" maxHeight="full" stickyHeader scrollable>
        <TableHead>
          <TableRow>
            {Array.from({ length: 8 }, (_, c) => (
              <TableSortHeader key={c} direction="none" onSort={noop}>
                {`Col${c}`}
              </TableSortHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 20 }, (_, r) => (
            <TableRow key={r}>
              {Array.from({ length: 8 }, (_, c) => (
                <TableCell key={c}>
                  <Button size="sm" data-cell={`${r}-${c}`}>
                    {`R${r}C${c}`}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>,
  );
  const wrapper = wrapperOf();
  const header = rect(headerCell(0));
  const target = document.querySelector<HTMLElement>('[data-cell="8-1"]')!;
  wrapper.scrollTop += rect(target).top - rect(wrapper).top - 2;
  expect(rect(target).top).toBeLessThan(header.bottom);
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  await expect
    .poll(() => rect(target).top)
    .toBeGreaterThanOrEqual(header.bottom);
});
