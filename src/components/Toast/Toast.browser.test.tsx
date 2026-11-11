import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { ToastProvider, createToastManager } from './index';

it('a toast has the popup surface: background, border, shadow, radius', async () => {
  const manager = createToastManager();
  render(<ToastProvider manager={manager} />);
  act(() => {
    manager.add({ title: 'Surface', duration: 0 });
  });
  const root = (await screen.findByText('Surface')).closest('[data-tone]')!;
  const style = getComputedStyle(root);
  expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(style.boxShadow).not.toBe('none');
  expect(style.borderTopWidth).toBe('1px');
  expect(style.borderTopLeftRadius).not.toBe('0px');
});
