/**
 * The public CSS variable name for a contract path. These names are API:
 * consumers write them in plain CSS (Spec 02).
 */
export function tokenToVarName(path: readonly string[]): string {
  const parts = path.map((part) =>
    part.replace(/\./g, '_').replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
  );
  return `--ds-${parts.join('-')}`;
}
