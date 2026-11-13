import type { SVGProps } from 'react';

/**
 * Lucide's upload icon, copied so this package doesn't depend on Lucide
 * (Spec 07). ISC License, Copyright (c) Lucide Icons and Contributors. The full
 * notice ships as dist/licenses/LICENSE-lucide.txt.
 */
export function UploadIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3v12" />
      <path d="m17 8-5-5-5 5" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}
