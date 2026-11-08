import { tokens } from '../tokens/primitives';
import { softShared } from './softShared';
import type { ThemeTokens } from './types';

const { neutral, indigo, status } = tokens;

/** The Soft Dark theme's values. */
export const softDark: ThemeTokens = {
  ...softShared,
  color: {
    bg: {
      canvas: neutral[950],
      surface: neutral[850],
      raised: neutral[800],
      sunken: neutral[900],
      muted: neutral[750],
      mutedHover: neutral[700],
      accent: indigo[400],
      accentHover: indigo[300],
      accentSubtle: indigo[950],
      success: status.success.dark,
      warning: status.warning.dark,
      danger: status.danger.dark,
      info: status.info.dark,
      successSubtle: status.success.darkSubtle,
      warningSubtle: status.warning.darkSubtle,
      dangerSubtle: status.danger.darkSubtle,
      infoSubtle: status.info.darkSubtle,
      dangerHover: status.danger.darkHover,
      inverse: neutral[100],
      disabled: neutral[825],
    },
    fg: {
      default: neutral[100],
      muted: neutral[400],
      subtle: neutral[500],
      accent: 'var(--ds-color-bg-accent)',
      onAccent: neutral[950],
      success: status.success.dark,
      warning: status.warning.dark,
      danger: status.danger.dark,
      info: status.info.dark,
      onStatus: neutral[950],
      inverse: neutral[875],
      disabled: neutral[500],
    },
    border: {
      subtle: neutral[775],
      control: neutral[530],
      surface: 'rgb(255 255 255 / 0.05)',
      danger: status.danger.dark,
      disabled: neutral[775],
    },
    focus: 'var(--ds-color-bg-accent)',
    overlay: 'rgb(0 0 0 / 0.60)',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgb(0 0 0 / 0.30)',
    md: '0 1px 2px rgb(0 0 0 / 0.30), 0 4px 12px rgb(0 0 0 / 0.25)',
    lg: '0 2px 4px rgb(0 0 0 / 0.35), 0 12px 32px rgb(0 0 0 / 0.45)',
    xl: '0 4px 8px rgb(0 0 0 / 0.40), 0 24px 64px rgb(0 0 0 / 0.55)',
    card: 'var(--ds-shadow-sm)',
    cardHover: 'var(--ds-shadow-lg)',
    raised: 'var(--ds-shadow-lg)',
    dialog: 'var(--ds-shadow-xl)',
  },
};
