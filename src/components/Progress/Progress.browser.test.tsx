import { render, screen } from '@testing-library/react';
import { cdp, page } from 'vitest/browser';
import { Progress } from './index';
import * as styles from './Progress.css';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  await page.viewport(414, 896);
  document.documentElement.removeAttribute('dir');
});

const track = () =>
  screen.getByRole('progressbar').querySelector(`.${styles.track}`)!;
const fill = () =>
  screen.getByRole('progressbar').querySelector(`.${styles.fill}`)!;

/** A CSS variable's value as the browser resolves it for `property`. */
function resolved(variable: string, property: 'color' | 'height' = 'color') {
  const probe = document.createElement('div');
  probe.style[property] = `var(${variable})`;
  document.body.append(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

it.each([150, -5])(
  'value=%s keeps the fill inside the track, with no page overflow at 320px',
  async (value) => {
    await page.viewport(320, 640);
    render(<Progress aria-label="Uploading" value={value} />);
    const t = track().getBoundingClientRect();
    const f = fill().getBoundingClientRect();
    expect(f.left).toBeGreaterThanOrEqual(t.left);
    expect(f.right).toBeLessThanOrEqual(t.right);
    expect(f.width).toBe(value > 0 ? t.width : 0);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  },
);

it('fills the share of the track that value is of max', () => {
  render(<Progress aria-label="Uploading" value={25} max={50} />);
  expect(fill().getBoundingClientRect().width).toBeCloseTo(
    track().getBoundingClientRect().width / 2,
    0,
  );
});

it('fills from the inline start in RTL', () => {
  document.documentElement.dir = 'rtl';
  render(<Progress aria-label="Uploading" value={25} />);
  expect(fill().getBoundingClientRect().right).toBeCloseTo(
    track().getBoundingClientRect().right,
    0,
  );
});

it.each([
  ['sm', 4],
  ['md', 8],
] as const)('size %s is %spx tall', (size, px) => {
  render(<Progress aria-label="Uploading" value={40} size={size} />);
  expect(track().getBoundingClientRect().height).toBe(px);
});

it('the track is bg.muted and fully rounded', () => {
  render(<Progress aria-label="Uploading" value={40} />);
  const style = getComputedStyle(track());
  expect(style.backgroundColor).toBe(resolved('--ds-color-bg-muted'));
  expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(4);
});

it.each([
  ['accent', '--ds-color-bg-accent'],
  ['success', '--ds-color-bg-success'],
  ['warning', '--ds-color-bg-warning'],
  ['danger', '--ds-color-bg-danger'],
] as const)('tone %s fills with %s', (tone, variable) => {
  render(<Progress aria-label="Uploading" value={40} tone={tone} />);
  expect(getComputedStyle(fill()).backgroundColor).toBe(resolved(variable));
});

it('indeterminate slides a segment across the track', () => {
  render(<Progress aria-label="Importing" value={null} />);
  const style = getComputedStyle(fill());
  expect(style.animationName).not.toBe('none');
  expect(parseFloat(style.animationDuration)).toBeGreaterThan(0);
});

it('reduced motion makes indeterminate a static, visible partial fill', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  render(<Progress aria-label="Importing" value={null} />);
  const style = getComputedStyle(fill());
  expect(parseFloat(style.animationDuration)).toBe(0);
  const t = track().getBoundingClientRect();
  const f = fill().getBoundingClientRect();
  expect(f.width).toBeGreaterThan(0);
  expect(f.width).toBeLessThan(t.width);
  expect(f.left).toBeGreaterThanOrEqual(t.left);
  expect(f.right).toBeLessThanOrEqual(t.right);
  expect(style.visibility).toBe('visible');
  expect(style.opacity).toBe('1');
});

it('forced colors gives the track a 1px border and the fill Highlight', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  render(<Progress aria-label="Uploading" value={40} />);
  const t = getComputedStyle(track());
  expect(t.borderTopWidth).toBe('1px');
  expect(t.borderTopStyle).toBe('solid');
  const probe = document.createElement('div');
  probe.style.forcedColorAdjust = 'none';
  probe.style.backgroundColor = 'Highlight';
  document.body.append(probe);
  expect(getComputedStyle(fill()).backgroundColor).toBe(
    getComputedStyle(probe).backgroundColor,
  );
  probe.remove();
});
