import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Kbd } from './index';

it('renders a kbd element, and passes className and ref', () => {
  const ref = createRef<HTMLElement>();
  render(
    <Kbd data-testid="k" className="mine" ref={ref}>
      K
    </Kbd>,
  );
  const el = screen.getByTestId('k');
  expect(el.tagName).toBe('KBD');
  expect(el).toHaveClass('mine');
  expect(ref.current).toBe(el);
});
