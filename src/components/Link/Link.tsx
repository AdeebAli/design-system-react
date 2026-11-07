import type { ElementType, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import { Icon } from '../Icon';
import { ExternalLinkIcon } from '../Icon/internal/ExternalLink';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Link.css';

/** Link colors. `neutral` takes the surrounding text color. */
export type LinkTone = 'accent' | 'neutral';

interface LinkOwnProps {
  /** The color. @default 'accent' */
  tone?: LinkTone;
  /**
   * When to underline. `hover` is only for links that are identifiable without
   * one, such as in a navigation bar. @default 'always'
   */
  underline?: 'always' | 'hover';
  /** Opens in a new tab, with an icon and hidden text saying so. @default false */
  external?: boolean;
  /** The hidden text on an external link. @default '(opens in a new tab)' */
  externalLabel?: string;
  children?: ReactNode;
}

/** `Link`'s props. */
export type LinkProps<E extends ElementType = 'a'> = PolymorphicProps<
  E,
  LinkOwnProps
>;

/** A link. It can wrap a router's link through `as`, and mark external links. */
export function Link<E extends ElementType = 'a'>({
  as,
  tone = 'accent',
  underline = 'always',
  external = false,
  externalLabel = '(opens in a new tab)',
  className,
  children,
  ...props
}: LinkProps<E>) {
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'a';

  return (
    <Box
      as={element}
      className={cx(
        styles.tone[tone],
        styles.underline[underline],
        focusRing,
        className,
      )}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...rest}
    >
      {children}
      {external && (
        <>
          <Icon icon={ExternalLinkIcon} size="inherit" marginStart="1" />
          {/* The space is hidden too, so punctuation can follow the icon. */}
          <VisuallyHidden> {externalLabel}</VisuallyHidden>
        </>
      )}
    </Box>
  );
}
