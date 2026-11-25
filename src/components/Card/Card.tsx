import type { ElementType } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { withDefaultDisplay } from '../../utils/withDefaultDisplay';
import { Box } from '../Box';
import type { Responsive, SpaceToken } from '../Box/types';
import * as styles from './Card.css';
import { spanToGrid } from './span';

export type { CardSpan } from './span';

/** Card padding sizes: 0, 12px, 16px, and 24px. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Card backgrounds. `sunken` is for a secondary card, or a card inside a card. */
export type CardSurface = 'default' | 'sunken';

const PADDING = { none: '0', sm: '3', md: '4', lg: '6' } as const;

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

function toSpace(padding: Responsive<CardPadding>): Responsive<SpaceToken> {
  if (typeof padding === 'string') return PADDING[padding];
  const space: Partial<Record<Breakpoint, SpaceToken>> = {};
  for (const [breakpoint, value] of Object.entries(padding) as [
    Breakpoint,
    CardPadding | undefined,
  ][]) {
    if (value != null) space[breakpoint] = PADDING[value];
  }
  return space;
}

interface CardOwnProps {
  /**
   * Columns × rows in a `Grid`. A fixed span wider than one column fills the row
   * below `md`. A responsive span is taken literally. An explicit `gridColumn`
   * or `gridRow` replaces it on that axis. One of `'1x1'`, `'2x1'`, `'1x2'`,
   * `'2x2'`, `'3x1'`, `'4x1'`, or `'full'`.
   * @default '1x1'
   */
  span?: Responsive<'1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '4x1' | 'full'>;
  /**
   * Inner padding. One of `'none'`, `'sm'`, `'md'`, or `'lg'`. Responsive.
   * @default 'md'
   */
  padding?: Responsive<'none' | 'sm' | 'md' | 'lg'>;
  /**
   * The space between children, which stack in a column. `space` tokens (`'4'`
   * is 16px, `'px'` is 1px). Responsive.
   * @default '2'
   */
  gap?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /** The background. One of `'default'` or `'sunken'`. @default 'default' */
  surface?: 'default' | 'sunken';
  /** Clips content to the card's corners, such as a full-bleed image. It also clips children's focus rings. @default false */
  clip?: boolean;
  /**
   * Makes a whole-card link lift on hover. Use with `as="a"` or a router
   * link, and don't put other links or buttons inside. @default false
   */
  interactive?: boolean;
  /**
   * Overrides `flex`. A missing `base` keeps `flex`. One of `'none'`, `'block'`,
   * `'inline'`, `'inline-block'`, `'flex'`, `'inline-flex'`, `'grid'`, or
   * `'inline-grid'`. Responsive.
   */
  display?: Responsive<
    | 'none'
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
  >;
}

/** `Card`'s props. */
export type CardProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  CardOwnProps
>;

/** A surface for grouping content, sized for bento grids. */
export function Card<E extends ElementType = 'div'>({
  as,
  span,
  padding = 'md',
  gap = '2',
  surface = 'default',
  clip = false,
  interactive = false,
  display,
  className,
  ...props
}: CardProps<E>) {
  const element: ElementType = as ?? 'div';
  if (interactive && typeof element === 'string' && element !== 'a') {
    warnOnce(
      `card-interactive-${element}`,
      `Card: \`interactive\` is for links, but this card renders a <${element}>. Use as="a" with an href, or put a Button inside the card instead.`,
    );
  }
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;

  return (
    <Box
      as={element}
      display={withDefaultDisplay(display, 'flex')}
      flexDirection="column"
      padding={toSpace(padding)}
      gap={gap}
      {...spanToGrid(span)}
      className={cx(
        styles.card({ surface, clip }),
        interactive && styles.interactive,
        interactive && focusRing,
        className,
      )}
      {...rest}
    />
  );
}
