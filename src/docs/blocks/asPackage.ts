/**
 * Shows an example's imports of this package's source as a project would
 * write them. Examples import `src/index` so `npm run typecheck` checks them
 * against the real API (Spec 18, Guides).
 */
export function asPackage(source: string): string {
  return source.replace(
    /from '(?:\.\.\/)+index'/g,
    "from '@adeebali/design-system-react'",
  );
}
