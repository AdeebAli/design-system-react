import { tokens } from '../tokens/primitives';
import type { ThemeTokens } from './types';

/** Soft values that are the same in both modes. */
export const softShared: Omit<ThemeTokens, 'color' | 'shadow'> = {
  font: {
    family: tokens.fontFamily,
    features: { sans: '"cv05", "cv08"' },
    size: tokens.fontSize,
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    lineHeight: { tight: '1.15', snug: '1.3', normal: '1.5', relaxed: '1.65' },
    letterSpacing: {
      tighter: '-0.025em',
      tight: '-0.015em',
      normal: '0',
      wide: '0.07em',
    },
  },
  space: tokens.space,
  size: {
    control: { sm: '1.75rem', md: '2.25rem', lg: '2.75rem' },
    icon: { sm: '0.875rem', md: '1rem', lg: '1.25rem' },
    container: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
    prose: '68ch',
    dialog: { sm: '24rem', md: '32rem', lg: '44rem' },
    sidebar: '15rem',
    sidebarRail: '3.5rem',
    drawer: { sm: '20rem', md: '28rem', lg: '40rem' },
    avatar: { sm: '1.5rem', md: '2rem', lg: '2.5rem', xl: '4rem' },
  },
  radius: {
    none: '0',
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
    card: 'var(--ds-radius-xl)',
    control: 'var(--ds-radius-md)',
  },
  borderWidth: { thin: '1px', thick: '2px' },
  motion: {
    duration: { fast: '120ms', base: '200ms', slow: '320ms' },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      enter: 'cubic-bezier(0, 0, 0, 1)',
      exit: 'cubic-bezier(0.3, 0, 1, 1)',
    },
  },
  zIndex: {
    base: '0',
    sticky: '100',
    dropdown: '1000',
    overlay: '1100',
    modal: '1200',
    popover: '1300',
    toast: '1400',
    tooltip: '1500',
  },
};
