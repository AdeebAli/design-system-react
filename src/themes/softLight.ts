import { tokens } from '../tokens/primitives';
import { softShared } from './softShared';
import type { ThemeTokens } from './types';

const { neutral, indigo, status } = tokens;

/** The Soft Light theme's values. */
export const softLight: ThemeTokens = {
  ...softShared,
  color: {
    bg: {
      canvas: neutral[75],
      surface: neutral[0],
      raised: neutral[0],
      sunken: neutral[50],
      muted: neutral[150],
      mutedHover: neutral[200],
      accent: indigo[600],
      accentHover: indigo[700],
      accentSubtle: indigo[50],
      success: status.success.light,
      warning: status.warning.light,
      danger: status.danger.light,
      info: status.info.light,
      successSubtle: status.success.lightSubtle,
      warningSubtle: status.warning.lightSubtle,
      dangerSubtle: status.danger.lightSubtle,
      infoSubtle: status.info.lightSubtle,
      dangerHover: status.danger.lightHover,
      inverse: neutral[875],
      disabled: neutral[150],
    },
    fg: {
      default: neutral[875],
      muted: neutral[600],
      subtle: neutral[500],
      accent: 'var(--ds-color-bg-accent)',
      onAccent: neutral[0],
      success: status.success.light,
      warning: status.warning.light,
      danger: status.danger.light,
      info: status.info.light,
      onStatus: neutral[0],
      inverse: neutral[100],
      disabled: neutral[500],
    },
    border: {
      subtle: neutral[200],
      control: neutral[520],
      surface: 'transparent',
      danger: status.danger.light,
      disabled: neutral[200],
    },
    focus: 'var(--ds-color-bg-accent)',
    overlay: 'rgb(29 27 24 / 0.40)',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgb(29 27 24 / 0.05)',
    md: '0 1px 2px rgb(29 27 24 / 0.04), 0 4px 12px rgb(29 27 24 / 0.05)',
    lg: '0 2px 4px rgb(29 27 24 / 0.04), 0 12px 32px rgb(29 27 24 / 0.10)',
    xl: '0 4px 8px rgb(29 27 24 / 0.05), 0 24px 64px rgb(29 27 24 / 0.16)',
    card: 'var(--ds-shadow-md)',
    cardHover: 'var(--ds-shadow-lg)',
    raised: 'var(--ds-shadow-lg)',
    dialog: 'var(--ds-shadow-xl)',
  },
};
