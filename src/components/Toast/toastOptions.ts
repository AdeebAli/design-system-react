import type { ReactNode } from 'react';

/** What a toast means. Never the only signal: the title carries the meaning. */
export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Where the toast list sits on screen. */
export type ToastPosition =
  'bottom-end' | 'bottom-start' | 'bottom' | 'top-end' | 'top-start' | 'top';

/** What a toast shows and how long it stays. */
export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  /** @default 'neutral' */
  tone?: ToastTone;
  /** A button in the toast. It closes the toast after `onClick` runs. */
  action?: { label: ReactNode; onClick: () => void };
  /**
   * How long it stays, in ms. `0` keeps it open. Unset, a toast with an
   * `action` or `tone="danger"` stays, and others use the provider's `duration`.
   */
  duration?: number;
  id?: string;
}

/** Kept on each toast for rendering. */
export interface ToastData {
  tone: ToastTone;
  /** A `promise` toast still waiting: shows a spinner. */
  loading?: boolean;
  /** The options as given, so `update` can work out the timeout from the merged state. */
  given: Pick<ToastOptions, 'tone' | 'action' | 'duration'>;
}

/**
 * Maps this library's options to Base UI's. Without `providerDuration`, an
 * ordinary toast gets no `timeout`, so the provider's own `timeout` applies.
 */
export function toBaseOptions(
  o: ToastOptions,
  providerDuration?: number,
  loading?: boolean,
) {
  const tone = o.tone ?? 'neutral';
  const stays = tone === 'danger' || o.action !== undefined;
  const timeout = o.duration ?? (stays ? 0 : providerDuration);
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    type: tone,
    priority: tone === 'danger' ? ('high' as const) : ('low' as const),
    timeout,
    actionProps: o.action
      ? { children: o.action.label, onClick: o.action.onClick }
      : undefined,
    data: {
      tone,
      ...(loading ? { loading } : {}),
      given: { tone: o.tone, action: o.action, duration: o.duration },
    } satisfies ToastData,
  };
}
