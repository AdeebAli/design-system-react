import { vi } from 'vitest';
import { gridCountClass } from '../components/Box/gridCounts.css';
import { layoutStyle } from './layoutStyle';

it('returns the layout classes, and nothing else when there is no count or style', () => {
  const result = layoutStyle({ marginTop: '4' }, undefined, 'Input');
  expect(result.className).not.toBe('');
  expect(result.style).toBeUndefined();
});

it('returns no class and no style for no layout and no style', () => {
  expect(layoutStyle({}, undefined, 'Input')).toEqual({
    className: '',
    style: undefined,
  });
});

it('adds the count class and variable, and passes a consumer object style after them', () => {
  const result = layoutStyle({ gridColumn: 14 }, { color: 'red' }, 'Input');
  expect(result.className).toBe(gridCountClass.gridColumn.base);
  expect(result.style).toEqual({
    '--ds-grid-column-base': 14,
    color: 'red',
  });
});

it('adds a row span the same way', () => {
  const result = layoutStyle({ gridRow: { md: 3 } }, undefined, 'Input');
  expect(result.className).toBe(gridCountClass.gridRow.md);
  expect(result.style).toEqual({ '--ds-grid-row-md': 3 });
});

it('lets a consumer style override the variable', () => {
  const result = layoutStyle(
    { gridColumn: 14 },
    { '--ds-grid-column-base': 3 } as never,
    'Input',
  );
  expect(result.style).toEqual({ '--ds-grid-column-base': 3 });
});

it('keeps a function style a function, calls it with the state, and merges its result after the variables', () => {
  const style = vi.fn((state: { open: boolean }) => ({
    color: state.open ? 'red' : 'blue',
  }));
  const result = layoutStyle({ gridColumn: 14 }, style, 'MenuItem');
  expect(typeof result.style).toBe('function');
  const resolve = result.style as unknown as (state: {
    open: boolean;
  }) => object;
  expect(resolve({ open: true })).toEqual({
    '--ds-grid-column-base': 14,
    color: 'red',
  });
  expect(style).toHaveBeenCalledWith({ open: true });
});

it('leaves a function style alone when there is no count', () => {
  const style = () => ({ color: 'red' });
  expect(layoutStyle({ marginTop: '4' }, style, 'MenuItem').style).toBe(style);
});

it('names the component in its warning', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  layoutStyle({ gridColumn: 0 }, undefined, 'Select');
  expect(String(warn.mock.calls[0]?.[0])).toContain('Select');
  warn.mockRestore();
});
