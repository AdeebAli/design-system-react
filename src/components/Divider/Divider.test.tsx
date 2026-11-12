import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Divider } from './index';

it('is a plain hr by default', () => {
  render(<Divider data-testid="d" />);
  const divider = screen.getByTestId('d');
  expect(divider.tagName).toBe('HR');
  expect(divider).not.toHaveAttribute('role');
  expect(divider).not.toHaveAttribute('aria-hidden');
});

it('vertical is a div separator with aria-orientation', () => {
  render(<Divider data-testid="d" orientation="vertical" />);
  const divider = screen.getByTestId('d');
  expect(divider.tagName).toBe('DIV');
  expect(divider).toHaveAttribute('role', 'separator');
  expect(divider).toHaveAttribute('aria-orientation', 'vertical');
});

it('label is a div separator containing the text', () => {
  render(<Divider data-testid="d" label="or" />);
  const divider = screen.getByTestId('d');
  expect(divider.tagName).toBe('DIV');
  expect(divider).toHaveAttribute('role', 'separator');
  expect(divider).not.toHaveAttribute('aria-orientation');
  expect(divider).toHaveTextContent('or');
});

it.each([
  ['horizontal', {}],
  ['vertical', { orientation: 'vertical' as const }],
])('decorative hides a %s divider', (_, props) => {
  render(<Divider data-testid="d" decorative {...props} />);
  expect(screen.getByTestId('d')).toHaveAttribute('aria-hidden', 'true');
});

it.each([
  ['the default', {}, 'HR'],
  ['vertical', { orientation: 'vertical' }, 'DIV'],
  ['labeled', { label: 'or' }, 'DIV'],
] as const)('forwards ref to the element, %s', (_, props, tag) => {
  const ref = createRef<HTMLElement>();
  render(<Divider ref={ref} {...props} />);
  expect(ref.current?.tagName).toBe(tag);
});
