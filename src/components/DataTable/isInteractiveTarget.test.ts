import { expect, it } from 'vitest';
import { isInteractiveTarget } from './isInteractiveTarget';

function setup(cell: string) {
  const row = document.createElement('tr');
  row.innerHTML = `<td>${cell}</td>`;
  document.body.append(row);
  return row;
}

it.each([
  ['a', '<a href="/x"><span id="t">x</span></a>'],
  ['button', '<button><span id="t">x</span></button>'],
  ['input', '<input id="t" />'],
  ['select', '<select id="t"></select>'],
  ['textarea', '<textarea id="t"></textarea>'],
  ['label', '<label><span id="t">x</span></label>'],
  ['summary', '<details><summary id="t">x</summary></details>'],
  ['an interactive role', '<div role="switch"><span id="t">x</span></div>'],
])('is true inside %s', (_name, html) => {
  const row = setup(html);
  expect(isInteractiveTarget(row.querySelector('#t')!, row)).toBe(true);
  row.remove();
});

it('is false for plain content and for the row itself', () => {
  const row = setup('<span id="t">x</span>');
  expect(isInteractiveTarget(row.querySelector('#t')!, row)).toBe(false);
  expect(isInteractiveTarget(row, row)).toBe(false);
  row.remove();
});

it('ignores an interactive element around the row', () => {
  const wrap = document.createElement('div');
  wrap.setAttribute('role', 'button');
  const row = document.createElement('div');
  row.innerHTML = '<span id="t">x</span>';
  wrap.append(row);
  document.body.append(wrap);
  expect(isInteractiveTarget(row.querySelector('#t')!, row)).toBe(false);
  wrap.remove();
});
