import { Source } from '@storybook/addon-docs/blocks';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { vars } from '../../themes/contract.css';

// Docs-only blocks (Spec 18, "Left to the builder"): a Do is a live example,
// a Don't is always a code snippet, never a live render.

const panel = (color: string): CSSProperties => ({
  borderBlockStart: `3px solid ${color}`,
  paddingBlockStart: vars.space['3'],
  minWidth: 0,
});

const label = (color: string): CSSProperties => ({
  margin: `0 0 ${vars.space['3']}`,
  color,
  fontWeight: vars.font.weight.semibold,
});

/** A row of Do and Don't panels, side by side when there's room. */
export function DoDont({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        gap: vars.space['6'],
        marginBlock: vars.space['6'],
      }}
    >
      {children}
    </div>
  );
}

/** What to do, shown live or as text. */
export function Do({ children }: { children: ReactNode }) {
  return (
    <div style={panel(vars.color.fg.success)}>
      <p style={label(vars.color.fg.success)}>Do</p>
      {children}
    </div>
  );
}

/** What not to do, as a code snippet. */
export function Dont({
  code,
  language = 'tsx',
}: {
  code: string;
  language?: ComponentProps<typeof Source>['language'];
}) {
  return (
    <div style={panel(vars.color.fg.danger)}>
      <p style={label(vars.color.fg.danger)}>Don’t</p>
      <Source code={code} language={language} dark={false} />
    </div>
  );
}
