import { render, screen } from '@testing-library/react';
import { createRef, type ComponentProps } from 'react';
import { Box, box } from './index';

const el = () => screen.getByTestId('b');

it('renders a div by default', () => {
  render(<Box data-testid="b" />);
  expect(el().tagName).toBe('DIV');
});

it('turns style props into classes, and forwards nothing', () => {
  render(<Box data-testid="b" padding="4" background="surface" />);
  expect(el().getAttribute('padding')).toBeNull();
  expect(el().getAttribute('background')).toBeNull();
  expect(el().className).not.toBe('');
});

it('gives different values different classes', () => {
  render(<Box data-testid="b" padding="4" />);
  const four = el().className;
  render(<Box data-testid="c" padding="2" />);
  expect(screen.getByTestId('c').className).not.toBe(four);
});

it('merges className and forwards style, data, and aria', () => {
  render(
    <Box
      data-testid="b"
      padding="4"
      className="mine"
      style={{ gridArea: 'nav' }}
      aria-label="x"
    />,
  );
  expect(el()).toHaveClass('mine');
  expect(el().className.split(' ').length).toBeGreaterThan(1);
  expect(el().style.gridArea).toContain('nav');
  expect(el()).toHaveAttribute('aria-label', 'x');
});

it('forwards ref, and as renders the right element', () => {
  const ref = createRef<HTMLAnchorElement>();
  render(<Box as="a" href="/x" ref={ref} data-testid="b" />);
  expect(el().tagName).toBe('A');
  expect(ref.current).toBe(el());
  expect(el()).toHaveAttribute('href', '/x');
});

it('renders htmlWidth and htmlHeight as attributes', () => {
  render(
    <Box
      as="img"
      alt=""
      data-testid="b"
      htmlWidth={640}
      htmlHeight={360}
      width="full"
    />,
  );
  expect(el()).toHaveAttribute('width', '640');
  expect(el()).toHaveAttribute('height', '360');
  expect(el().getAttribute('htmlwidth')).toBeNull();
});

it.each([undefined, null])('ignores %s without throwing', (value) => {
  render(
    <Box
      data-testid="b"
      padding={value as never}
      margin={{ md: value } as never}
      background={value as never}
    />,
  );
  expect(el().className).toBe('');
  expect(el().getAttribute('padding')).toBeNull();
});

it('keeps real values beside nullish ones in a responsive object', () => {
  render(<Box data-testid="b" padding={{ base: '4', md: undefined }} />);
  expect(el().className).toBe(box({ padding: '4' }));
});

it('passes as={Component} its className and props, and no style props', () => {
  const Probe = vi.fn((props: ComponentProps<'a'>) => <a {...props}>link</a>);
  render(<Box as={Probe} href="/x" padding="4" />);
  const received = Probe.mock.calls[0]?.[0];
  expect(received).toMatchObject({ href: '/x' });
  expect(received).not.toHaveProperty('padding');
  expect(received?.className).toBe(box({ padding: '4' }));
});

it('renders no class attribute when there is nothing to apply', () => {
  render(<Box data-testid="b" />);
  expect(el().hasAttribute('class')).toBe(false);
});

it('box() returns the same class string as the prop', () => {
  render(<Box data-testid="b" padding="4" marginTop={{ md: '2' }} />);
  expect(el().className).toBe(box({ padding: '4', marginTop: { md: '2' } }));
});

it('box() ignores nullish values', () => {
  expect(box({ padding: undefined, margin: null as never })).toBe('');
});
