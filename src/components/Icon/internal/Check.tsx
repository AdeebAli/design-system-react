import type { SVGProps } from 'react';

/**
 * Lucide's check icon, copied so this package doesn't depend on Lucide
 * (Spec 07). ISC License, Copyright (c) Lucide Icons and Contributors. The full
 * notice ships as dist/licenses/LICENSE-lucide.txt.
 */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
