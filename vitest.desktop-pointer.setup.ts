import { beforeEach } from 'vitest';

// Headless Chromium on Linux (CI) has no mouse, so once a page has had CDP
// touch emulation, turning it off leaves `(hover: none)` and
// `(pointer: none)` for the rest of that page, and every later test in it
// loses its hover styles. Touch tests therefore run in the separate
// `browser-touch` project (`*.touch.browser.test.tsx`), whose pages no other
// project uses. This guard names the problem the moment a page has lost
// desktop pointer media.
beforeEach(() => {
  const lost = ['(hover: hover)', '(pointer: fine)'].filter(
    (query) => !matchMedia(query).matches,
  );
  if (lost.length > 0) {
    throw new Error(
      `This page no longer matches ${lost.join(' and ')}. A test that ran ` +
        'earlier in the same page turned on touch emulation, which Chromium ' +
        "on Linux can't undo. Move that test to a *.touch.browser.test.tsx file.",
    );
  }
});
