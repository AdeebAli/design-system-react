import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { expect } from 'vitest';

function classesOf(element: ReactElement): string[] {
  const { unmount } = render(element);
  const classes = [...screen.getByTestId('c').classList].sort();
  unmount();
  return classes;
}

/** Renders both elements and compares the classes of `data-testid="c"`. */
export function expectSameClass(a: ReactElement, b: ReactElement): void {
  expect(classesOf(a)).toEqual(classesOf(b));
}
