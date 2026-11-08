import type { SVGProps } from 'react';

/**
 * Lucide's minus icon, copied so this package doesn't depend on Lucide
 * (Spec 07). ISC License, Copyright (c) Lucide Icons and Contributors. The full
 * notice ships as dist/licenses/LICENSE-lucide.txt.
 */
export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  );
}
