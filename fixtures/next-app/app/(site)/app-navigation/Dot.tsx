import { Icon } from '@adeebali/design-system-react';

function DotSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

/** A small icon, so the fixture needs no icon package. */
export function Dot() {
  return <Icon icon={DotSvg} />;
}
