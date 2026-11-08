import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { VisuallyHidden } from './index';

it('is a span in the accessibility tree', () => {
  render(
    <button>
      <VisuallyHidden data-testid="v">Close</VisuallyHidden>
    </button>,
  );
  expect(screen.getByTestId('v').tagName).toBe('SPAN');
  expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
});

it('renders as a link, and never forwards focusable', () => {
  const ref = createRef<HTMLAnchorElement>();
  render(
    <VisuallyHidden as="a" href="#main" focusable ref={ref}>
      Skip
    </VisuallyHidden>,
  );
  const link = screen.getByRole('link', { name: 'Skip' });
  expect(link.getAttribute('focusable')).toBeNull();
  expect(ref.current).toBe(link);
});

it('focusable uses a different class', () => {
  render(<VisuallyHidden data-testid="a" />);
  render(<VisuallyHidden data-testid="b" focusable />);
  expect(screen.getByTestId('b').className).not.toBe(
    screen.getByTestId('a').className,
  );
});
