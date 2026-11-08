import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { Box } from './index';
import { componentPadding } from './Box.browser.css';

const el = () => screen.getByTestId('b');
const css = () => getComputedStyle(el());

it('applies responsive values at the right breakpoints', async () => {
  render(<Box data-testid="b" padding={{ base: '2', md: '8', xl: '4' }} />);
  await page.viewport(500, 600);
  expect(css().paddingTop).toBe('8px');
  await page.viewport(767, 600);
  expect(css().paddingTop).toBe('8px');
  await page.viewport(768, 600);
  expect(css().paddingTop).toBe('32px');
  await page.viewport(1280, 600);
  expect(css().paddingTop).toBe('16px');
});

it('a prop beats a component style, and unlayered CSS beats the prop', () => {
  render(<Box data-testid="b" className={componentPadding} />);
  expect(css().paddingTop).toBe('4px');
  render(<Box data-testid="c" className={componentPadding} padding="4" />);
  const prop = screen.getByTestId('c');
  expect(getComputedStyle(prop).paddingTop).toBe('16px');

  const unlayered = document.createElement('style');
  unlayered.textContent = '[data-testid="c"]{padding:40px}';
  document.head.append(unlayered);
  expect(getComputedStyle(prop).paddingTop).toBe('40px');
  unlayered.remove();
});

it('a larger breakpoint wins, regardless of which prop set it', async () => {
  render(<Box data-testid="b" padding={{ md: '8' }} paddingX="2" />);
  await page.viewport(500, 600);
  expect(css().paddingLeft).toBe('8px');
  await page.viewport(900, 600);
  expect(css().paddingLeft).toBe('32px');
});

it('within a breakpoint, the more specific prop wins', async () => {
  await page.viewport(1000, 600);
  render(<Box data-testid="b" paddingStart="1" paddingX="2" padding="4" />);
  expect(css().paddingTop).toBe('16px');
  expect(css().paddingRight).toBe('8px');
  expect(css().paddingLeft).toBe('4px');
});

it('a token override changes a prop', () => {
  render(<Box data-testid="b" padding="4" />);
  document.documentElement.style.setProperty('--ds-space-4', '50px');
  expect(css().paddingTop).toBe('50px');
  document.documentElement.style.removeProperty('--ds-space-4');
});

it('borderWidth sets the style as well', () => {
  render(<Box data-testid="b" borderWidth="thin" borderColor="control" />);
  expect(css().borderTopWidth).toBe('1px');
  expect(css().borderTopStyle).toBe('solid');
});

it('sides use logical properties', () => {
  document.documentElement.dir = 'rtl';
  render(<Box data-testid="b" paddingStart="4" />);
  expect(css().paddingRight).toBe('16px');
  document.documentElement.dir = '';
});
