// Left for the consumer's bundler to replace, so it's read as written (Spec 05).
declare const process: { env: { NODE_ENV?: string } };

const seen = new Set<string>();

function isDevelopment() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    // No bundler and no process: stay quiet rather than throw.
    return false;
  }
}

/** Logs a development warning, once per key. Silent in production. */
export function warnOnce(key: string, message: string): void {
  if (!isDevelopment() || seen.has(key)) return;
  seen.add(key);
  console.warn(`[design-system-react] ${message}`);
}

/**
 * Test-only: forgets the warnings already shown. The test setups call it after
 * each test, so a warning test doesn't depend on which tests ran before it.
 */
export function resetWarnings(): void {
  seen.clear();
}
