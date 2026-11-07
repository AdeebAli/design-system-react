import type { ElementType } from 'react';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { Box } from '../Box';
import type { Responsive } from '../Box/types';
import * as styles from './Text.css';
import { typography } from './typography.css';

/** A font size. Each also sets a matching line height and letter spacing. */
export type FontSizeToken =
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
/** Text colors. With no tone, text takes its parent's color. */
export type TextTone =
  'muted' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
/** Text alignment. */
export type TextAlign = 'start' | 'center' | 'end';
/** The number of lines `lineClamp` keeps. */
export type LineClamp = '2' | '3' | '4' | '5' | '6';

interface TextOwnProps {
  /** The font size. Unset, it inherits. */
  size?: Responsive<FontSizeToken>;
  /** The font weight. Unset, it inherits. */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** The color meaning. Never the only signal. Unset, it inherits. */
  tone?: TextTone;
  /** Text alignment. */
  align?: Responsive<TextAlign>;
  /** The font family, with its font features. Unset, it inherits. */
  family?: 'sans' | 'mono' | 'prose';
  /** Uses tabular numerals, so digits line up in columns. @default false */
  numeric?: boolean;
  /** One line with an ellipsis. Makes the text a block. @default false */
  truncate?: boolean;
  /** That many lines with an ellipsis. Wins over `truncate`. */
  lineClamp?: LineClamp;
}

/** `Text`'s props. */
export type TextProps<E extends ElementType = 'p'> = PolymorphicProps<
  E,
  TextOwnProps
>;

/** Body text. Unset props inherit, so it keeps the surrounding style. */
export function Text<E extends ElementType = 'p'>({
  as,
  size,
  weight,
  tone,
  align,
  family,
  numeric = false,
  truncate = false,
  lineClamp,
  className,
  ...props
}: TextProps<E>) {
  if (truncate && lineClamp) {
    warnOnce(
      'text-truncate-line-clamp',
      "Text: `truncate` and `lineClamp` can't be combined. `lineClamp` wins.",
    );
  }
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'p';

  return (
    <Box
      as={element}
      className={cx(
        typography({ size, align }),
        weight && styles.weight[weight],
        tone && styles.tone[tone],
        family && styles.family[family],
        numeric && styles.numeric,
        lineClamp ? styles.lineClamp[lineClamp] : truncate && styles.truncate,
        className,
      )}
      {...rest}
    />
  );
}
