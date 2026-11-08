import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Code } from './index';

it('renders a code element, and passes className and ref', () => {
  const ref = createRef<HTMLElement>();
  render(
    <Code data-testid="c" className="mine" ref={ref}>
      x
    </Code>,
  );
  const el = screen.getByTestId('c');
  expect(el.tagName).toBe('CODE');
  expect(el).toHaveClass('mine');
  expect(ref.current).toBe(el);
});
