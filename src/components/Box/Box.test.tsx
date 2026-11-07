import { render, screen } from '@testing-library/react';
import { Box } from './Box';

it('renders a div with a compiled class', () => {
  render(<Box data-testid="b" />);
  expect(screen.getByTestId('b').tagName).toBe('DIV');
  expect(screen.getByTestId('b').className).not.toBe('');
});
