'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentPropsWithRef,
  type RefObject,
} from 'react';
import { cx } from '../../utils/cx';
import { warnOnce } from '../../utils/warn';
import { Icon } from '../Icon';
import { XIcon } from '../Icon/internal/X';
import { IconButton } from '../IconButton';
import type { Direction } from '../overlays/direction';
import { useDrawerContext, useRegisterPart } from './DrawerContext';
import * as styles from './Drawer.css';
import { toSwipeDirection, type DrawerSide } from './swipeDirection';

/** Side panel widths: 20, 28, and 40rem, capped to the viewport less `space.8`. */
export type DrawerSize = 'sm' | 'md' | 'lg';

type Shared = Omit<ComponentPropsWithRef<'div'>, 'dir'> & {
  /** Shows the close button. @default true */
  showClose?: boolean;
  /** The close button's name. @default 'Close' */
  closeLabel?: string;
  /** What gets focus on open. Unset, the first focusable element (the popup on touch). */
  initialFocus?: RefObject<HTMLElement | null>;
  /** What gets focus on close. Unset, the trigger. A controlled drawer with no trigger needs it. */
  finalFocus?: RefObject<HTMLElement | null>;
  /**
   * The text direction, when the drawer's isn't the document's. Unset, it
   * follows the document root, since the portal is outside any local `dir`.
   */
  dir?: Direction;
};

/** `DrawerContent`'s props. `size` applies to the side panels, not `bottom`. */
export type DrawerContentProps = Shared &
  (
    | {
        /** The edge it opens from. `start` and `end` follow text direction. @default 'end' */
        side?: Exclude<DrawerSide, 'bottom'>;
        /** The width. @default 'md' */
        size?: DrawerSize;
      }
    | { side: 'bottom'; size?: never }
  );

/** The drawer's backdrop and panel, rendered in a portal. */
export function DrawerContent(props: DrawerContentProps) {
  return (
    <BaseDrawer.Portal>
      <Panel {...props} />
    </BaseDrawer.Portal>
  );
}

const documentDirection = (): Direction =>
  typeof document !== 'undefined' &&
  getComputedStyle(document.documentElement).direction === 'rtl'
    ? 'rtl'
    : 'ltr';

/**
 * The portal mounts this only while the drawer is open, so each open reads
 * the direction afresh. `DrawerContent` itself stays mounted while closed.
 */
function Panel({
  side = 'end',
  size = 'md',
  showClose = true,
  closeLabel = 'Close',
  initialFocus,
  finalFocus,
  dir,
  className,
  children,
  ...props
}: DrawerContentProps) {
  const { setSwipeDirection } = useDrawerContext('DrawerContent');
  // A snapshot when it opens, since the portal is outside any local `dir`.
  const [documentDir] = useState(documentDirection);
  const resolved = dir ?? documentDir;
  const labelled = Boolean(props['aria-label'] ?? props['aria-labelledby']);

  useLayoutEffect(() => {
    setSwipeDirection(toSwipeDirection(side, resolved));
  }, [side, resolved, setSwipeDirection]);

  return (
    <>
      <BaseDrawer.Backdrop className={styles.backdrop} />
      <BaseDrawer.Viewport className={styles.viewport}>
        <BaseDrawer.Popup
          {...props}
          dir={resolved}
          data-side={side}
          data-close-shown={showClose ? '' : undefined}
          // Base UI focuses the popup itself unless told otherwise. A drawer
          // follows Dialog: the first focusable element, or the popup on touch.
          initialFocus={initialFocus ?? true}
          finalFocus={finalFocus}
          className={cx(
            styles.popup,
            styles.sides[side],
            side !== 'bottom' && styles.sizes[size],
            className,
          )}
        >
          <BaseDrawer.Content className={styles.content}>
            {children}
            {showClose && <CloseButton label={closeLabel} />}
          </BaseDrawer.Content>
          <Checks
            closeButton={showClose}
            labelled={labelled}
            hasFinalFocus={finalFocus !== undefined}
          />
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </>
  );
}

function CloseButton({ label }: { label: string }) {
  const { register } = useDrawerContext('DrawerContent');
  useRegisterPart(register, 'close');
  return (
    <BaseDrawer.Close
      render={
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={label}
          icon={<Icon icon={XIcon} />}
          className={styles.close}
        />
      }
    />
  );
}

/**
 * Warns about missing parts. It renders inside the popup, so it only runs while
 * the drawer is open, and after its siblings have registered themselves.
 */
function Checks({
  closeButton,
  labelled,
  hasFinalFocus,
}: {
  closeButton: boolean;
  labelled: boolean;
  hasFinalFocus: boolean;
}) {
  const { controlled, has } = useDrawerContext('DrawerContent');
  useEffect(() => {
    if (!has('title') && !labelled) {
      warnOnce(
        'drawer-name',
        'DrawerContent: the drawer has no name. Add a `DrawerTitle`, or give `DrawerContent` an `aria-label`.',
      );
    }
    if (!closeButton && !has('close')) {
      warnOnce(
        'drawer-no-close',
        'DrawerContent: there is no close button, so add a `DrawerClose` to the content. Touch screen reader users need a way out.',
      );
    }
    if (controlled && !has('trigger') && !hasFinalFocus) {
      warnOnce(
        'drawer-final-focus',
        'Drawer: it is controlled and has no `DrawerTrigger`, so focus has nowhere to return when it closes. Pass `finalFocus` to `DrawerContent`, a ref to the element that opened it.',
      );
    }
  }, [controlled, closeButton, labelled, hasFinalFocus, has]);
  return null;
}
