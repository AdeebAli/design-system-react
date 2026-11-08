import { render, screen } from '@testing-library/react';
import { createRef, type SVGProps } from 'react';
import { Icon } from './index';

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="i" viewBox="0 0 24 24" {...props} />;
}

const el = () => screen.getByTestId('i');

it('is decorative without a label', () => {
  render(<Icon icon={Svg} />);
  expect(el()).toHaveAttribute('aria-hidden', 'true');
  expect(el()).not.toHaveAttribute('role');
  expect(el()).toHaveAttribute('focusable', 'false');
});

it('is named with a label', () => {
  render(<Icon icon={Svg} label="Close" />);
  expect(el()).toHaveAttribute('role', 'img');
  expect(el()).toHaveAttribute('aria-label', 'Close');
  expect(el()).not.toHaveAttribute('aria-hidden');
  expect(el()).toHaveAttribute('focusable', 'false');
});

it('applies different classes per size and tone', () => {
  render(<Icon icon={Svg} size="sm" />);
  const small = el().getAttribute('class');
  render(
    <Icon
      icon={(p) => <Svg {...p} data-testid="j" />}
      size="lg"
      tone="muted"
    />,
  );
  expect(screen.getByTestId('j').getAttribute('class')).not.toBe(small);
});

it('passes className and ref to the svg', () => {
  const ref = createRef<SVGSVGElement>();
  render(<Icon icon={Svg} className="mine" ref={ref} />);
  expect(el()).toHaveClass('mine');
  expect(ref.current).toBe(el());
});

it('never forwards size or label', () => {
  render(<Icon icon={Svg} size="lg" label="x" />);
  expect(el().getAttribute('size')).toBeNull();
  expect(el().getAttribute('label')).toBeNull();
});

it('accepts layout props other than sizing', () => {
  render(<Icon icon={Svg} marginTop="2" />);
  expect(el().getAttribute('margintop')).toBeNull();
});
