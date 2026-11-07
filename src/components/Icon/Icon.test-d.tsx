import { X } from 'lucide-react';
import type { SVGProps } from 'react';
import { Icon } from './index';

function Mine(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}

test('Lucide icons and custom SVG components are accepted', () => {
  <Icon icon={X} />;
  <Icon icon={Mine} size="inherit" tone="muted" label="x" marginTop="2" />;
});

test('sizing props and unknown values are errors', () => {
  // @ts-expect-error size sets both dimensions
  <Icon icon={X} width="6" />;
  // @ts-expect-error size sets both dimensions
  <Icon icon={X} height={24} />;
  // @ts-expect-error size sets both dimensions
  <Icon icon={X} maxWidth="full" />;
  // @ts-expect-error display is a Box style prop, not the SVG attribute
  <Icon icon={X} display="none" />;
  // @ts-expect-error overflow is a Box style prop, not the SVG attribute
  <Icon icon={X} overflow="hidden" />;
  // @ts-expect-error neutral isn't a tone
  <Icon icon={X} tone="neutral" />;
  // @ts-expect-error icon is required
  <Icon />;
  // @ts-expect-error Icon doesn't accept as
  <Icon icon={X} as="span" />;
});
