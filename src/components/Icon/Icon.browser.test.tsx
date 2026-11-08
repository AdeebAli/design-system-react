import { render, screen } from '@testing-library/react';
import type { SVGProps } from 'react';
import { Icon } from './index';

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="i" viewBox="0 0 24 24" {...props} />;
}

const el = () => screen.getByTestId('i');
const css = () => getComputedStyle(el());

it.each([
  ['sm', '14px'],
  ['md', '16px'],
  ['lg', '20px'],
] as const)('size %s is %s', (size, px) => {
  render(<Icon icon={Svg} size={size} />);
  expect(css().width).toBe(px);
  expect(css().height).toBe(px);
});

it('grows with the root font size', () => {
  document.documentElement.style.fontSize = '32px';
  render(<Icon icon={Svg} />);
  expect(css().width).toBe('32px');
  document.documentElement.style.fontSize = '';
});

it('inherit matches the parent font size', () => {
  render(
    <div style={{ fontSize: '30px' }}>
      <Icon icon={Svg} size="inherit" />
    </div>,
  );
  expect(css().width).toBe('30px');
});

it('takes the parent color with no tone', () => {
  render(
    <div style={{ color: 'rgb(1, 2, 3)' }}>
      <Icon icon={Svg} />
    </div>,
  );
  expect(css().color).toBe('rgb(1, 2, 3)');
});

it('sits inline in text', () => {
  render(
    <p>
      Before <Icon icon={Svg} /> after
    </p>,
  );
  expect(css().display).toBe('inline-block');
});

it('does not shrink in a narrow row', () => {
  render(
    <div style={{ display: 'flex', width: '20px' }}>
      <Icon icon={Svg} size="lg" />
      <span style={{ flex: 'none', width: '100px' }}>Text</span>
    </div>,
  );
  expect(el().getBoundingClientRect().width).toBe(20);
});
