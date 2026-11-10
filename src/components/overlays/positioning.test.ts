import { gapOffset, toBaseSide } from './positioning';

function setGap(gap: string, fontSize = '16px') {
  document.documentElement.style.fontSize = fontSize;
  document.documentElement.style.setProperty('--ds-space-1_5', gap);
}

afterEach(() => {
  document.documentElement.removeAttribute('style');
});

it('maps logical sides to Base UI sides', () => {
  expect(toBaseSide('top')).toBe('top');
  expect(toBaseSide('bottom')).toBe('bottom');
  expect(toBaseSide('start')).toBe('inline-start');
  expect(toBaseSide('end')).toBe('inline-end');
});

it('converts a rem gap using the root font size', () => {
  setGap('0.375rem');
  expect(gapOffset()).toBe(6);
  setGap('0.375rem', '20px');
  expect(gapOffset()).toBe(7.5);
});

it('passes a px gap through', () => {
  setGap('10px');
  expect(gapOffset()).toBe(10);
});
