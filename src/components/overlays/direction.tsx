'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useSyncExternalStore, type ReactNode } from 'react';

export type Direction = 'ltr' | 'rtl';

const readDirection = (): Direction =>
  getComputedStyle(document.documentElement).direction === 'rtl'
    ? 'rtl'
    : 'ltr';

// One shared observer, with the direction cached so renders don't read styles.
// The cache is dropped when the last subscriber unmounts, so it can't go stale.
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
let cached: Direction | undefined;

function subscribeDirection(listener: () => void) {
  if (listeners.size === 0) {
    // A `dir` change between render and subscribe wasn't observed, so refresh
    // the cache. React re-checks the snapshot after subscribing and re-renders.
    cached = readDirection();
    observer = new MutationObserver(() => {
      cached = readDirection();
      listeners.forEach((l) => l());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      cached = undefined;
    }
  };
}

const getDirection = (): Direction => (cached ??= readDirection());

/**
 * The text direction of the document root, updated when its `dir` changes.
 * A `dir` on a subtree isn't followed.
 */
export function useDirection(): Direction {
  return useSyncExternalStore(
    subscribeDirection,
    getDirection,
    (): Direction => 'ltr',
  );
}

/**
 * Base UI maps `inline-start`/`inline-end` and the submenu arrow keys from a
 * React context, not from the DOM, so every overlay is wrapped in this.
 */
export function OverlayDirection({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider direction={useDirection()}>{children}</DirectionProvider>
  );
}
