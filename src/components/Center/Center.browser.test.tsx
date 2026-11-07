import { render, screen } from '@testing-library/react';
import { Center } from './index';

function rects(props: Parameters<typeof Center>[0]) {
  render(
    <Center data-testid="o" style={{ width: 200, height: 100 }} {...props}>
      <div data-testid="i" style={{ width: 20, height: 20 }} />
    </Center>,
  );
  return {
    outer: screen.getByTestId('o').getBoundingClientRect(),
    inner: screen.getByTestId('i').getBoundingClientRect(),
  };
}

it('centers on both axes', () => {
  const { outer, inner } = rects({});
  expect(inner.left - outer.left).toBe(90);
  expect(inner.top - outer.top).toBe(40);
});

it('centers horizontally only', () => {
  const { outer, inner } = rects({ axis: 'horizontal' });
  expect(inner.left - outer.left).toBe(90);
  expect(inner.top).toBe(outer.top);
});

it('centers vertically only', () => {
  const { outer, inner } = rects({ axis: 'vertical' });
  expect(inner.left).toBe(outer.left);
  expect(inner.top - outer.top).toBe(40);
});

it('inline shrinks to its content', () => {
  render(
    <div style={{ width: 300 }}>
      <Center inline data-testid="o">
        <div style={{ width: 20, height: 20 }} />
      </Center>
    </div>,
  );
  expect(screen.getByTestId('o').getBoundingClientRect().width).toBe(20);
});
