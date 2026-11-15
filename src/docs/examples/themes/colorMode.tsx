import type { ReactNode } from 'react';
import {
  ColorModeToggle,
  Select,
  ThemeProvider,
  useColorMode,
  type ColorMode,
} from '../../../index';

// Follows the system until someone chooses (the default).
export function FollowSystem({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// Always dark, such as for a media player. The stored choice is kept.
export function AlwaysDark({ children }: { children: ReactNode }) {
  return <ThemeProvider forcedMode="dark">{children}</ThemeProvider>;
}

// A light and dark toggle for a header.
export function HeaderToggle() {
  return <ColorModeToggle />;
}

const modes = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// A three-way choice, built on useColorMode.
export function ModeSetting() {
  const { mode, setMode, isForced } = useColorMode();
  if (isForced) return null;
  return (
    <Select
      aria-label="Color mode"
      options={modes}
      value={mode}
      onValueChange={(value) => {
        if (value) setMode(value as ColorMode);
      }}
    />
  );
}
