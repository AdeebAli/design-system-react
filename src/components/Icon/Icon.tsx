import type { ElementType, SVGProps } from 'react';
import type { ComponentProps } from '../../utils/types';
import { cx } from '../../utils/cx';
import { Box } from '../Box';
import type { BoxOnlyProps } from '../Box/types';
import * as styles from './Icon.css';

/** Icon sizes. `inherit` matches the surrounding text. */
export type IconSize = 'sm' | 'md' | 'lg' | 'inherit';
/** Icon colors. With no tone, an icon takes its parent's text color. */
export type IconTone =
  'muted' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface IconOwnProps {
  /** Any component that passes SVG props to its root `svg`. */
  icon: ElementType<SVGProps<SVGSVGElement>>;
  /** The size. @default 'md' */
  size?: IconSize;
  /** The color meaning. Never the only signal. Unset, it inherits. */
  tone?: IconTone;
  /** The accessible name. Without one, the icon is decorative. */
  label?: string;
}

/**
 * `Icon`'s props. `size` sets both dimensions, so sizing props aren't accepted.
 * SVG attributes that share a name with a `Box` style prop, such as `display`,
 * aren't accepted either, because `Box` would read them as style props.
 */
export type IconProps = Omit<
  ComponentProps<'svg', IconOwnProps>,
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | keyof BoxOnlyProps
>;

/** Sizes, colors, and labels an SVG icon. */
export function Icon({
  icon,
  size = 'md',
  tone,
  label,
  className,
  ...props
}: IconProps) {
  const accessibility = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <Box
      // The icon's type is only known at runtime, and Box's props can't be
      // inferred from it, so it's widened to a plain element type.
      as={icon as ElementType}
      focusable="false"
      className={cx(styles.icon({ size, tone }), className)}
      {...accessibility}
      {...props}
    />
  );
}
