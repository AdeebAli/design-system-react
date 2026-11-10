import { ToastProvider, createToastManager, useToast } from './index';
import type { ToastManager, ToastOptions } from './index';

test('tone is a closed set', () => {
  const ok: ToastOptions = { title: 'x', tone: 'danger' };
  // @ts-expect-error error is not a tone
  const bad: ToastOptions = { tone: 'error' };
  void ok;
  void bad;
});

test('ToastProvider props', () => {
  <ToastProvider position="top-start" limit={2} duration={0} />;
  // @ts-expect-error left is not a logical position
  <ToastProvider position="left" />;
  <ToastProvider manager={createToastManager()} />;
});

test('ToastManager has no Base UI types in its signature', () => {
  type Add = ToastManager['add'];
  expectTypeOf<Add>().toEqualTypeOf<(options: ToastOptions) => string>();
  expectTypeOf<ToastManager['close']>().toEqualTypeOf<(id?: string) => void>();
  expectTypeOf(useToast).returns.toEqualTypeOf<ToastManager>();
});
