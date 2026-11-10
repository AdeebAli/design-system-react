const count = (value: string, char: string) => value.split(char).length - 1;

const closers: Record<string, string> = { '(': ')', '[': ']' };

// Line breaks end a quoted string early. Outside quotes they're whitespace.
const lineBreaks = new Set(['\n', '\r', '\f']);

// Whether every ( and [ outside quotes is closed, in order, and no quoted
// string contains a line break.
function wellFormed(value: string) {
  const open: string[] = [];
  let quote: string | null = null;
  for (const char of value) {
    if (quote) {
      if (char === quote) quote = null;
      else if (lineBreaks.has(char)) return false;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char in closers) {
      open.push(closers[char]!);
    } else if (char === ')' || char === ']') {
      if (open.pop() !== char) return false;
    }
  }
  return open.length === 0;
}

// All theme CSS is one line, so an unclosed quote, comment, or bracket, an
// escape, or a line break inside quotes, would swallow every rule after it,
// including reduced motion. Control characters other than tabs and line breaks
// are rejected too.
function breaksRule(value: string) {
  return (
    // eslint-disable-next-line no-control-regex
    /[{};<\\\u0000-\u0008\u000b\u000e-\u001f\u007f]|\/\*/.test(value) ||
    count(value, '"') % 2 === 1 ||
    count(value, "'") % 2 === 1 ||
    !wellFormed(value)
  );
}

// url() and image-set() make the browser fetch a resource, so a theme from user
// input could track people.
const loadsResource = (value: string) => /(url|image-set)\(/i.test(value);

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
    } else if (typeof value === 'string' && breaksRule(value)) {
      throw new Error(
        `Invalid theme value for ${next}: ${JSON.stringify(value)}. Values can't contain {, }, ;, <, \\, /*, a line break inside quotes, a control character other than a tab or line break, an unclosed quote, or an unclosed ( or [.`,
      );
    } else if (typeof value === 'string' && loadsResource(value)) {
      throw new Error(
        `Invalid theme value for ${next}: ${JSON.stringify(value)}. Values can't load resources with url() or image-set().`,
      );
    }
  }
}
