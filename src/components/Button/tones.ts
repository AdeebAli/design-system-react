import { warnOnce } from '../../utils/warn';

/** Button styles. */
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/** Button color meanings. Each variant supports only some (Spec 09). */
export type ButtonTone = 'accent' | 'neutral' | 'danger';

const VALID: Record<ButtonVariant, readonly ButtonTone[]> = {
  solid: ['accent', 'danger'],
  soft: ['neutral'],
  outline: ['neutral'],
  ghost: ['neutral', 'danger'],
};

/** The tone to use, falling back to the variant's default for unsupported pairs. */
export function resolveTone(
  variant: ButtonVariant,
  tone: ButtonTone | undefined,
  component = 'Button',
): ButtonTone {
  const valid = VALID[variant];
  // Every variant lists at least one tone.
  const fallback = valid[0]!;
  if (tone == null || valid.includes(tone)) return tone ?? fallback;
  warnOnce(
    `button-tone-${variant}-${tone}`,
    `${component}: tone="${tone}" isn't available with variant="${variant}", so "${fallback}" is used. Supported tones for ${variant}: ${valid.join(', ')}.`,
  );
  return fallback;
}
