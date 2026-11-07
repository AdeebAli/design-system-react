/**
 * Throws for a theme value or key that could break out of its CSS rule. Theme
 * CSS is written into a style element, so this guards against injection when a
 * value comes from user input (Spec 03).
 */
export function validateTheme(node: unknown, path = ''): void {
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const next = path ? `${path}.${key}` : key;
    if (!/^[A-Za-z0-9.]+$/.test(key)) {
      throw new Error(
        `Invalid theme key "${next}". Keys are token names, such as color.bg.accent.`,
      );
    }
    if (typeof value === 'object' && value !== null) {
      validateTheme(value, next);
    } else if (typeof value === 'string' && /[{};<]/.test(value)) {
      throw new Error(
        `Invalid theme value for ${next}: "${value}". Values can't contain {, }, ;, or <.`,
      );
    }
  }
}
