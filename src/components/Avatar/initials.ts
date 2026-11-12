const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function firstGrapheme(word: string) {
  for (const { segment } of segmenter.segment(word)) return segment;
  return '';
}

/**
 * The first letters of the first and last words, uppercased. Letters are
 * whole graphemes, so an accent or emoji is never split. One word gives one
 * letter, and a blank name gives none.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (first === undefined) return '';
  const last = words.length > 1 ? words[words.length - 1]! : '';
  // Not toLocaleUpperCase: the host's locale could differ between server and
  // client (a Turkish i), which would be a hydration mismatch.
  return (firstGrapheme(first) + firstGrapheme(last)).toUpperCase();
}
