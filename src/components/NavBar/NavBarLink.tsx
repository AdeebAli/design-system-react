'use client';

import type { ElementType, MouseEvent, ReactElement, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { PolymorphicProps } from '../../utils/types';
import { warnOnce } from '../../utils/warn';
import { Box } from '../Box';
import * as styles from './NavBar.css';
import { useNavBar } from './NavBarContext';

interface NavBarLinkOwnProps {
  /** Marks the current page. The library doesn't read the URL. @default false */
  active?: boolean;
  /** An `Icon` element before the text. */
  startIcon?: ReactElement;
  children?: ReactNode;
}

/** `NavBarLink`'s props. */
export type NavBarLinkProps<E extends ElementType = 'a'> = PolymorphicProps<
  E,
  NavBarLinkOwnProps
>;

/** A link in a `NavBar`. It renders its own `li`. */
export function NavBarLink<E extends ElementType = 'a'>({
  as,
  active = false,
  startIcon,
  className,
  children,
  ...props
}: NavBarLinkProps<E>) {
  const navBar = useNavBar();
  const { onClick } = props as {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
  };
  // The panel closes after the project's own handler, unless it cancels the click.
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) navBar?.closeFromLink();
  };
  // The rest depends on the generic `as`, which Box can't infer through.
  const rest: object = props;
  const element: ElementType = as ?? 'a';

  const link = (
    <Box
      as={element}
      className={cx(styles.link, focusRing, className)}
      aria-current={active ? 'page' : undefined}
      data-active={active ? '' : undefined}
      {...rest}
      onClick={handleClick}
    >
      {startIcon && <span className={styles.linkIcon}>{startIcon}</span>}
      {children}
    </Box>
  );

  if (navBar == null) {
    warnOnce(
      'NavBarLink-outside',
      'NavBarLink: render it inside a NavBar, which supplies its list. Use Link for a link anywhere else.',
    );
    return link;
  }
  return <li>{link}</li>;
}
