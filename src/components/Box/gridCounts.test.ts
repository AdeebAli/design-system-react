import { vi } from 'vitest';
import { gridCountStyle } from './gridCounts';
import { gridCountClass, gridFullClass } from './gridCounts.css';

const none = { className: '', style: undefined };

it('turns a number into the base class and its variable', () => {
  expect(gridCountStyle({ gridTemplateColumns: 16 }, 'Box')).toEqual({
    className: gridCountClass.gridTemplateColumns.base,
    style: { '--ds-grid-columns-base': 16 },
  });
});

it('reads a numeric string as the same number', () => {
  const sixteen = gridCountStyle({ gridTemplateColumns: 16 }, 'Box');
  expect(gridCountStyle({ gridTemplateColumns: '16' }, 'Box')).toEqual(sixteen);
  expect(gridCountStyle({ gridTemplateColumns: '016' }, 'Box')).toEqual(
    sixteen,
  );
});

it('gives each breakpoint its own class and variable', () => {
  const { className, style } = gridCountStyle(
    { gridTemplateColumns: { base: 2, md: 16 } },
    'Box',
  );
  expect(className.split(' ').sort()).toEqual(
    [
      gridCountClass.gridTemplateColumns.base,
      gridCountClass.gridTemplateColumns.md,
    ].sort(),
  );
  expect(style).toEqual({
    '--ds-grid-columns-base': 2,
    '--ds-grid-columns-md': 16,
  });
});

it('names each prop and breakpoint in its variable', () => {
  expect(
    gridCountStyle({ gridColumn: { xl: 3 }, gridRow: { sm: 4 } }, 'Box').style,
  ).toEqual({ '--ds-grid-column-xl': 3, '--ds-grid-row-sm': 4 });
});

it('"full" is a class with no variable', () => {
  expect(gridCountStyle({ gridColumn: 'full' }, 'Box')).toEqual({
    className: gridFullClass.gridColumn.base,
    style: undefined,
  });
  expect(gridCountStyle({ gridRow: { md: 'full' } }, 'Box')).toEqual({
    className: gridFullClass.gridRow.md,
    style: undefined,
  });
});

it('a span is a number or span- plus a number', () => {
  const fourteen = gridCountStyle({ gridColumn: 14 }, 'Box');
  expect(fourteen.style).toEqual({ '--ds-grid-column-base': 14 });
  expect(gridCountStyle({ gridColumn: 'span-14' }, 'Box')).toEqual(fourteen);
});

it('adds nothing when no count is given, or when one is nullish', () => {
  expect(gridCountStyle({}, 'Box')).toEqual(none);
  expect(
    gridCountStyle({ gridTemplateColumns: { base: undefined } }, 'Box'),
  ).toEqual(none);
});

describe('an invalid count', () => {
  const cases = [
    ['gridTemplateColumns', 0],
    ['gridTemplateColumns', -1],
    ['gridTemplateColumns', 1.5],
    ['gridTemplateColumns', NaN],
    ['gridTemplateColumns', Infinity],
    ['gridTemplateColumns', 1e21],
    ['gridTemplateColumns', 'abc'],
    ['gridTemplateColumns', '1e3'],
    ['gridTemplateColumns', 'full'],
    ['gridColumn', 'span-0'],
    ['gridRow', -2],
  ] as const;

  it.each(cases)('%s=%s warns once and adds nothing', (prop, value) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = { [prop]: value } as never;
    expect(gridCountStyle(props, 'Box')).toEqual(none);
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toContain('Box');
    expect(message).toContain(prop);
    expect(message).toContain(String(value));
    warn.mockRestore();
  });

  it('names the component that called the helper', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    gridCountStyle({ gridColumn: 0 }, 'Button');
    expect(String(warn.mock.calls[0]?.[0])).toContain('Button');
    warn.mockRestore();
  });

  it('keeps the valid breakpoints', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(
      gridCountStyle({ gridTemplateColumns: { base: 2, md: 0 } }, 'Box'),
    ).toEqual({
      className: gridCountClass.gridTemplateColumns.base,
      style: { '--ds-grid-columns-base': 2 },
    });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
