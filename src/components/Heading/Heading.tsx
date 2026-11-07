import { cx } from '../../utils/cx';
import type { ComponentProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';
import type {
  FontSizeToken,
  LineClamp,
  TextAlign,
  TextTone,
} from '../Text/Text';
import * as styles from '../Text/Text.css';
import { typography } from '../Text/typography.css';

/** A heading's place in the document, which sets its tag. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const defaultSizes: Record<HeadingLevel, FontSizeToken> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
};

function withDefaultSize(
  size: Responsive<FontSizeToken> | undefined,
  fallback: FontSizeToken,
): Responsive<FontSizeToken> {
  if (size == null) return fallback;
  if (typeof size !== 'object') return size;
  return { ...size, base: size.base ?? fallback };
}

interface HeadingOwnProps {
  /** The heading level, which sets the tag. Required. */
  level: HeadingLevel;
  /** The visual size. Doesn't change the tag. Unset, it comes from `level`. */
  size?: Responsive<FontSizeToken>;
  /** The font weight. @default 'semibold' */
  weight?: 'medium' | 'semibold' | 'bold';
  /** The color meaning. Never the only signal. Unset, it inherits. */
  tone?: TextTone;
  /** Text alignment. */
  align?: Responsive<TextAlign>;
  /** One line with an ellipsis. @default false */
  truncate?: boolean;
  /** That many lines with an ellipsis. Wins over `truncate`. */
  lineClamp?: LineClamp;
}

/** `Heading`'s props. */
export type HeadingProps = ComponentProps<'h1', HeadingOwnProps>;

/** A heading. `level` sets the tag, and `size` sets the look. */
export function Heading({
  level,
  size,
  weight = 'semibold',
  tone,
  align,
  truncate = false,
  lineClamp,
  className,
  ...props
}: HeadingProps) {
  if (truncate && lineClamp) {
    warnOnce(
      'heading-truncate-line-clamp',
      "Heading: `truncate` and `lineClamp` can't be combined. `lineClamp` wins.",
    );
  }

  return (
    <Box
      as={`h${level}`}
      className={cx(
        typography({ size: withDefaultSize(size, defaultSizes[level]), align }),
        styles.weight[weight],
        tone && styles.tone[tone],
        lineClamp ? styles.lineClamp[lineClamp] : truncate && styles.truncate,
        className,
      )}
      {...props}
    />
  );
}
