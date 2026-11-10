import { toBaseOptions } from './toastOptions';

it('maps tone to type and priority: danger is high, others low', () => {
  expect(toBaseOptions({ tone: 'danger' }, 5000)).toMatchObject({
    type: 'danger',
    priority: 'high',
    data: { tone: 'danger' },
  });
  expect(toBaseOptions({ tone: 'success' }, 5000)).toMatchObject({
    type: 'success',
    priority: 'low',
  });
  expect(toBaseOptions({ title: 'x' }, 5000)).toMatchObject({
    type: 'neutral',
    priority: 'low',
    data: { tone: 'neutral' },
  });
});

it('maps action to actionProps with the label as children', () => {
  const onClick = vi.fn();
  const base = toBaseOptions({ action: { label: 'Retry', onClick } }, 5000);
  expect(base.actionProps).toEqual({ children: 'Retry', onClick });
});

it('duration rules', () => {
  expect(toBaseOptions({ title: 'x' }, 5000).timeout).toBe(5000);
  expect(toBaseOptions({ title: 'x', tone: 'danger' }, 5000).timeout).toBe(0);
  expect(
    toBaseOptions(
      { title: 'x', action: { label: 'Retry', onClick: vi.fn() } },
      5000,
    ).timeout,
  ).toBe(0);
  expect(
    toBaseOptions({ title: 'x', tone: 'danger', duration: 5000 }, 9000).timeout,
  ).toBe(5000);
  expect(toBaseOptions({ title: 'x', duration: 0 }, 5000).timeout).toBe(0);
});

it("leaves the default to the provider when it isn't given a duration", () => {
  expect(toBaseOptions({ title: 'x' }).timeout).toBeUndefined();
  expect(toBaseOptions({ title: 'x', tone: 'danger' }).timeout).toBe(0);
});
