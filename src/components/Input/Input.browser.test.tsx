import { render, screen } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Textarea } from '../Textarea';
import { Input } from './index';

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false });
});

it('uses 14px text with a fine pointer, and 16px with a coarse one', async () => {
  render(
    <>
      <Input aria-label="i" />
      <Textarea aria-label="t" />
    </>,
  );
  const size = (name: string) =>
    getComputedStyle(screen.getByRole('textbox', { name })).fontSize;
  expect(size('i')).toBe('14px');
  expect(size('t')).toBe('14px');
  await cdp().send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  expect(matchMedia('(pointer: coarse)').matches).toBe(true);
  expect(size('i')).toBe('16px');
  expect(size('t')).toBe('16px');
});
