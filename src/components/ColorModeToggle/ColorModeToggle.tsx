'use client';

import type { MouseEvent } from 'react';

import { useColorMode } from '../../theme/ThemeProvider';
import type { ButtonVariant } from '../Button';
import { Box } from '../Box';
import { Icon } from '../Icon';
import { MoonIcon } from '../Icon/internal/Moon';
import { SunIcon } from '../Icon/internal/Sun';
import { IconButton, type IconButtonProps } from '../IconButton';

/** The toggle's names, for translation. */
export interface ColorModeToggleLabels {
  /** @default 'Switch to light mode' */
  toLight?: string;
  /** @default 'Switch to dark mode' */
  toDark?: string;
  /** Before hydration, when the mode isn't known. @default 'Switch color mode' */
  neutral?: string;
}

/** `ColorModeToggle`'s props. */
export type ColorModeToggleProps = Omit<
  IconButtonProps<'button'>,
  'icon' | 'aria-label' | 'variant' | 'as' | 'children'
> & {
  /** The names for each state. */
  labels?: ColorModeToggleLabels;
  /** The button style. @default 'ghost' */
  variant?: Exclude<ButtonVariant, 'solid'>;
};

/**
 * Switches between light and dark, storing the opposite of what's on screen.
 * It renders nothing when a `ThemeProvider` forces the mode.
 */
export function ColorModeToggle({
  labels,
  variant = 'ghost',
  onClick,
  ...props
}: ColorModeToggleProps) {
  const { resolvedMode, setMode, isForced } = useColorMode();
  if (isForced) return null;

  const name =
    resolvedMode === 'dark'
      ? (labels?.toLight ?? 'Switch to light mode')
      : resolvedMode === 'light'
        ? (labels?.toDark ?? 'Switch to dark mode')
        : (labels?.neutral ?? 'Switch color mode');
  // Before hydration the mode isn't known, so an empty box keeps the size.
  const icon =
    resolvedMode === 'dark' ? (
      <Icon icon={SunIcon} />
    ) : resolvedMode === 'light' ? (
      <Icon icon={MoonIcon} />
    ) : (
      <Box as="span" width="4" height="4" />
    );

  return (
    <IconButton
      {...props}
      // The toggle owns these, even if a caller bypasses the types.
      as={undefined}
      icon={icon}
      aria-label={name}
      variant={variant}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (resolvedMode) setMode(resolvedMode === 'dark' ? 'light' : 'dark');
      }}
    />
  );
}
