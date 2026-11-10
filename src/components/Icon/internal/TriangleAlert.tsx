import type { SVGProps } from 'react';

/**
 * Lucide's triangle-alert icon, copied so this package doesn't depend on Lucide
 * (Spec 07). ISC License, Copyright (c) Lucide Icons and Contributors. The full
 * notice ships as dist/licenses/LICENSE-lucide.txt.
 */
export function TriangleAlertIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
