'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import type { ElementType, MouseEvent, ReactElement, ReactNode } from 'react';
import { focusRing } from '../../styles/focus.css';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import { warnOnce } from '../../utils/warn';
import { Box, box } from '../Box';
import { Spinner } from '../Spinner';
import { VisuallyHidden } from '../VisuallyHidden';
import * as styles from './Button.css';
import { resolveTone, type ButtonTone, type ButtonVariant } from './tones';

/** Button sizes, at the control heights 28, 36, and 44px. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Props shared by `Button` and `IconButton`. */
export interface ButtonBaseOwnProps {
  /** The style. @default 'solid' */
  variant?: ButtonVariant;
  /**
   * The color meaning. `solid` supports `accent` and `danger`, `ghost` supports
   * `neutral` and `danger`, and `soft` and `outline` support `neutral`.
   * @default 'accent' for solid, otherwise 'neutral'
   */
  tone?: ButtonTone;
  /** The size. @default 'md' */
  size?: ButtonSize;
  /**
   * Shows a spinner and ignores clicks and form submission, while staying
   * focusable. Not supported on links. @default false
   */
  loading?: boolean;
  /** Disables the button. Not supported on links. @default false */
  disabled?: boolean;
  /** Hidden text announced while loading. @default 'Loading' */
  loadingLabel?: string;
}

interface InternalProps extends ButtonBaseOwnProps {
  as?: ElementType;
  component: string;
  square?: boolean;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  className?: string;
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  [prop: string]: unknown;
}

/** The shared implementation of `Button` and `IconButton`. */
export function ButtonBase({
  as,
  component,
  square = false,
  variant = 'solid',
  tone,
  size = 'md',
  loading = false,
  disabled = false,
  loadingLabel = 'Loading',
  startIcon,
  endIcon,
  className,
  children,
  type,
  onClick,
  ...props
}: InternalProps) {
  const resolved = resolveTone(variant, tone, component);
  const classes = cx(
    styles.button({ variant, tone: resolved, size, square }),
    focusRing,
  );

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (loading) {
      // Also catches the click a browser fires on implicit form submission.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const content = (
    <>
      {loading ? (
        <Spinner />
      ) : (
        startIcon && <span className={styles.iconSlot}>{startIcon}</span>
      )}
      {children}
      {endIcon && <span className={styles.iconSlot}>{endIcon}</span>}
      {loading && <VisuallyHidden> {loadingLabel}</VisuallyHidden>}
    </>
  );

  const state = {
    'aria-busy': loading || undefined,
    'data-loading': loading ? '' : undefined,
  };

  if (as != null) {
    if (disabled || loading) {
      warnOnce(
        `${component}-link-${loading ? 'loading' : 'disabled'}`,
        `${component}: \`disabled\` and \`loading\` don't work on a link, because a link can't be disabled. Render a button instead, or remove the link while it's unavailable.`,
      );
    }
    return (
      <Box
        as={as}
        className={cx(classes, className)}
        onClick={handleClick}
        {...state}
        {...props}
      >
        {content}
      </Box>
    );
  }

  const [layout, rest] = splitLayoutProps(props);
  return (
    <BaseButton
      type={type ?? 'button'}
      disabled={disabled}
      className={cx(box(layout), classes, className)}
      onClick={handleClick}
      {...state}
      {...rest}
    >
      {content}
    </BaseButton>
  );
}
