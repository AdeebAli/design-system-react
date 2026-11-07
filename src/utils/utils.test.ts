import { cx } from './cx';
import { splitLayoutProps } from './splitLayoutProps';

it('cx joins, skipping empty values', () => {
  expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  expect(cx()).toBe('');
});

it('splitLayoutProps separates layout props from the rest', () => {
  const [layout, rest] = splitLayoutProps({
    margin: '4',
    id: 'x',
    padding: '2',
    width: 'full',
  });
  expect(layout).toEqual({ margin: '4', width: 'full' });
  expect(rest).toEqual({ id: 'x', padding: '2' });
});

it('splitLayoutProps covers every layout prop', () => {
  const props = {
    margin: '1',
    marginX: '1',
    marginY: '1',
    marginTop: '1',
    marginBottom: '1',
    marginStart: '1',
    marginEnd: '1',
    width: '1',
    minWidth: '1',
    height: '1',
    minHeight: '1',
    maxWidth: 'none',
    maxHeight: 'none',
    flexGrow: '0',
    flexShrink: '0',
    alignSelf: 'auto',
    justifySelf: 'auto',
    gridColumn: 'full',
    gridRow: 'full',
  };
  const [layout, rest] = splitLayoutProps(props);
  expect(layout).toEqual(props);
  expect(rest).toEqual({});
});
