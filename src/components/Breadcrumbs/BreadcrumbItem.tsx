import type { ElementType, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import type { ComponentProps, PolymorphicProps } from '../../utils/types';
import { Box } from '../Box';
import * as styles from './Breadcrumbs.css';

type LinkItemProps<E extends ElementType> = PolymorphicProps<
  E,
  {
    /** Where the link goes. */
    href: string;
    current?: never;
    /** The link text. */
    children?: ReactNode;
  }
>;

type CurrentItemProps = ComponentProps<
  'span',
  {
    /** Marks the current page, which isn't a link. */
    current: true;
    href?: never;
    as?: never;
    /** The current page's name. */
    children?: ReactNode;
  }
>;

/** `BreadcrumbItem`'s props: `href` (and `as`), or `current`. */
export type BreadcrumbItemProps<E extends ElementType = 'a'> =
  LinkItemProps<E> | CurrentItemProps;

/** A step in `Breadcrumbs`. It renders its own `li`. */
export function BreadcrumbItem<E extends ElementType = 'a'>(
  props: BreadcrumbItemProps<E>,
) {
  if (props.current) {
    const { current, className, ...rest } = props;
    return (
      <li className={styles.item}>
        <Box
          as="span"
          aria-current="page"
          data-current={current ? '' : undefined}
          className={cx(styles.current, className)}
          {...rest}
        />
      </li>
    );
  }
  const { as, className, ...rest } = props;
  // The rest depends on the generic `as`, which Box can't infer through.
  const linkProps: object = rest;
  const element: ElementType = as ?? 'a';
  return (
    <li className={styles.item}>
      <Box
        as={element}
        className={cx(styles.link, focusRing, className)}
        {...linkProps}
      />
    </li>
  );
}
