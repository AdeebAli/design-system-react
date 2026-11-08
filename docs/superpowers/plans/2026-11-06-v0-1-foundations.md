# v0.1 Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@adeebali/design-system-react` v0.1: tooling and the release pipeline, tokens and Soft themes, the theme provider, `Box`, component conventions, `Icon`, and 13 layout and typography components.

**Architecture:** Vite library mode compiles vanilla-extract `.css.ts` files into one static `styles.css` and one ESM file per source module. Themes are CSS variables on the root element, in cascade layers, selected by `data-ds-mode`. Every component renders through `Box`, whose style props are sprinkles classes behind hand-written types.

**Tech Stack:** TypeScript (strict), React 19, vanilla-extract (css, sprinkles, recipes), Vite, Storybook, Vitest, Testing Library, axe, Playwright, npm.

**Spec:** `docs/specs/01-repo-and-tooling.md` through `docs/specs/07-icon.md`, with `docs/specs/00-overview.md` and ADRs 0001–0004. Read the task's spec before starting it. Exact values live there, and this plan doesn't repeat tables.

## Global Constraints

- Node is the current active LTS when Task 1 runs, pinned in `.nvmrc` and `engines.node`. Check it, don't assume it.
- ESM only. `react` and `react-dom` `^19` are peer dependencies. No `lucide-react` dependency. No Base UI is installed in v0.1, because nothing here is interactive beyond `ThemeProvider`.
- Style values come from `vars` only. Components never hardcode Soft values.
- CSS variable prefix is `ds`. Layer order is `ds.theme, ds.reset, ds.base, ds.components, ds.utilities`.
- Only `ThemeProvider` and `useColorMode` carry `"use client"`. Everything else in v0.1 must work in a server component.
- No browser globals during render. Development warnings go through one helper reading `process.env.NODE_ENV` inside `try`/`catch`.
- Work on branch `feat/v0.1-foundations`, committing per task. PR titles read as changelog entries. **Commits and PR bodies carry no co-author or generated-by lines**, per the owner's standing rule.
- No Dependabot or Renovate. No CHANGELOG.md. Never publish from a local machine.
- Don't change anything a spec doesn't ask for. If a spec can't be met as written, stop and raise it rather than working around it.

## Review Focus

Each has a test in the named task.

1. **Reduced motion with a locked mode (Task 5).** `prefers-reduced-motion` must give `0ms` durations with `data-ds-mode="dark"` too. Dark's selector is more specific than `:root`, so a naive `:root` rule silently loses.
2. **Tricky token names (Task 4).** `space['0.5']`, `font.size.2xl`, `fg.onAccent`, and `size.sidebarRail` must become `--ds-space-0_5`, `--ds-font-size-2xl`, `--ds-color-fg-on-accent`, and `--ds-size-sidebar-rail`. These names are public API.
3. **Bad stored mode or blocked storage (Tasks 7 and 8).** A stored `"purple"`, or a `localStorage` that throws, falls back to `defaultMode` in both the provider and the inline script, with no error.
4. **React Strict Mode (Task 7).** Double-run effects must leave `data-ds-mode` correct, and must not trigger the nested-provider warning.
5. **`null` and `undefined` style props (Task 9).** `padding={cond ? '4' : undefined}` and a `null` from data add no class and don't throw, including inside a responsive object.

---

### Task 1: Package, build, and lint

**Files:**
- Create: `package.json`, `.nvmrc`, `.editorconfig`, `.prettierrc`, `eslint.config.js`, `tsconfig.json`, `tsconfig.build.json`, `vite.config.ts`, `vite.lib.config.ts`, `vitest.config.ts`
- Create: `src/index.ts`, `src/components/Box/Box.tsx` (stub), `src/components/Box/Box.css.ts` (stub), `src/components/Box/index.ts`, `src/components/Box/Box.test.tsx`
- Create: `scripts/verify-dist.mjs`
- Modify: `.gitignore` (add `dist`, `storybook-static`, `*.tgz`, `test-results`)

**Interfaces:**
- Produces: npm scripts `build`, `typecheck`, `lint`, `format`, `format:check`, `test`. A stub `Box` that renders a `div` with one vanilla-extract class. It's replaced in Task 9.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/Box/Box.test.tsx
it('renders a div with a compiled class', () => {
  render(<Box data-testid="b" />);
  expect(screen.getByTestId('b').tagName).toBe('DIV');
  expect(screen.getByTestId('b').className).not.toBe('');
});
```

- [ ] **Step 2: Run `npx vitest run src/components/Box` and confirm it fails**, because `Box` doesn't exist yet. Install dev dependencies first, at latest stable.

- [ ] **Step 3: Write the config files.** Use Spec 01's exact `tsconfig` options, package shape, and build options. `vite.config.ts` holds only the vanilla-extract and React plugins. `vite.lib.config.ts` adds `build.lib` (`formats: ['es']`, `cssFileName: 'styles'`), `cssCodeSplit: false`, `preserveModules`, `preserveModulesRoot: 'src'`, externals, a directive-preserving plugin, and `vite-plugin-dts` with `rollupTypes`.

- [ ] **Step 4: Write the ESLint config.** `typescript-eslint` type-aware `recommended` and `stylistic`, `react`, `react-hooks`, `jsx-a11y`, `import-x/no-extraneous-dependencies`, and `no-restricted-imports` allowing `@base-ui*` only under `src/components/**`.

- [ ] **Step 5: Write `scripts/verify-dist.mjs`.** It exits non-zero unless `dist/` has `index.js`, exactly one `.css` file (`styles.css`), one `index.d.ts` with no relative imports and no `base-ui` text, and a `components/Box/Box.js` that doesn't inline React. Also add a temporary `"use client"` probe module and assert its output begins with the directive, then delete the probe once Task 7's `ThemeProvider` takes over that assertion.

- [ ] **Step 6: Implement the stub and run everything**

Run: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && node scripts/verify-dist.mjs`
Expected: all pass. If Vite can't produce one CSS file with preserved modules and directives, stop: Spec 01's fallback is Rollup plus a new ADR, which needs the owner.

- [ ] **Step 7: Prove the lint rule.** Temporarily import an undeclared package, confirm `npm run lint` fails with `no-extraneous-dependencies`, then remove it.

- [ ] **Step 8: Commit** with message `Set up package, build, and lint`.

### Task 2: Storybook, story tests, visual tests, and fixtures

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`, `src/components/Box/Box.stories.tsx`, `playwright.config.ts`, `tests/visual/stories.spec.ts`, `scripts/test-fixtures.mjs`, `tests/fixtures/smoke.spec.ts`
- Create: `fixtures/vite-app/*`, `fixtures/next-app/*` (each with its own `package.json`)
- Modify: `package.json`, `vitest.config.ts` (a browser project for stories)

**Interfaces:**
- Consumes: the stub `Box`.
- Produces: scripts `dev`, `build:storybook`, `test:stories`, `test:visual`, `test:fixtures`, `check`. The toolbar sets `data-ds-mode` on the preview's root. Later tasks add stories and fixture pages only.

- [ ] **Step 1: Configure Storybook** with the React + Vite framework, `@storybook/addon-a11y`, and `@storybook/addon-vitest`. Set axe violations to fail. Run every story in both modes through `data-ds-mode`.

- [ ] **Step 2: Prove axe fails.** Add a temporary story with an unlabeled image link, run `npm run test:stories`, confirm it fails, then delete the story.

- [ ] **Step 3: Write `tests/visual/stories.spec.ts`.** Enumerate stories from `storybook-static/index.json`, and screenshot each across Chromium, light and dark, 1280×800 and 390×844, into `tests/visual/__screenshots__/`.

- [ ] **Step 4: Write the fixtures and `scripts/test-fixtures.mjs`.** The script builds, runs `npm pack`, runs `publint` and `attw --pack` ignoring CJS resolution modes, installs the tarball into each fixture, runs its typecheck and production build, and then the smoke test. `fixtures/vite-app` follows the README steps exactly. `fixtures/next-app` uses the App Router and renders from a server page.

- [ ] **Step 5: Write the smoke test**

```ts
// tests/fixtures/smoke.spec.ts: runs once per built fixture
test('renders with styles and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(fixtureUrl);
  await expect(page.getByTestId('stub')).toBeVisible();
  // The stub's class sets a known property. Task 5 changes this to a token value.
  expect(await page.getByTestId('stub').evaluate((e) => getComputedStyle(e).boxSizing)).toBe('border-box');
  expect(errors).toEqual([]);
});
```

- [ ] **Step 6: Run `npm run check`** and expect all to pass. Run `npm run test:visual` locally as a preview only, and don't commit its screenshots.

- [ ] **Step 7: Commit** with message `Add Storybook, story tests, visual tests, and consumer fixtures`.

### Task 3: CI, publish, release script, and README

**Files:**
- Create: `.github/workflows/ci.yml`, `publish.yml`, `storybook-pages.yml`, `update-visual-baselines.yml`, `scripts/release.mjs`, `scripts/release.test.mjs`, `README.md`
- Modify: `CLAUDE.md` (real commands; replace the "planning phase" text)

**Interfaces:**
- Consumes: all npm scripts from Tasks 1 and 2.
- Produces: `npm run release -- <patch|minor|major>`, and five required CI jobs named `static`, `unit`, `stories`, `visual`, `package`.

- [ ] **Step 1: Write the failing test for release preflight.** Export `parseBump(arg)` and `preflightFailures(state)` from `scripts/release.mjs`, as pure functions.

```js
assert.throws(() => parseBump('huge'));
assert.equal(parseBump('minor'), 'minor');
assert.deepEqual(preflightFailures({ ghAuthed: true, branch: 'main', clean: true, ahead: 0, behind: 0, ciSucceeded: true }), []);
assert.match(preflightFailures({ ghAuthed: true, branch: 'dev', clean: true, ahead: 0, behind: 0, ciSucceeded: true })[0], /main/);
assert.equal(preflightFailures({ ghAuthed: false, branch: 'dev', clean: false, ahead: 1, behind: 1, ciSucceeded: false }).length, 5);
```

- [ ] **Step 2: Run it and confirm it fails.** `node --test scripts/release.test.mjs`

- [ ] **Step 3: Implement `scripts/release.mjs`** with no dependencies, following Spec 01's seven steps. If a step after `npm version` fails, print the exact commands to finish or undo. It never deletes tags or force-pushes. Don't run it.

- [ ] **Step 4: Run it and confirm it passes.** Add `release.test.mjs` to `npm test`.

- [ ] **Step 5: Write the four workflows** from Spec 01's CI, Publish, and Storybook hosting sections. `ci.yml` runs on pull requests and pushes to `main`, with npm and Playwright caching and `concurrency` cancellation. The `visual` job and `update-visual-baselines.yml` both use the official Playwright container. `publish.yml` asserts the tag equals `v` + the `package.json` version. The `package` job also fails if `dist/index.d.ts` mentions `base-ui`, and writes `styles.css` and `Box` JavaScript sizes to the CI summary.

- [ ] **Step 6: Write the README** with Spec 01's six sections, including the manual Pages and ruleset settings. Update `CLAUDE.md`.

- [ ] **Step 7: Commit, push the branch, and open a draft PR.** Run `update-visual-baselines` on it, and review the committed baselines. Expected: all five CI jobs pass.

**Needs the owner, not done here:** the `main` ruleset, the Pages source setting, and the v0.0.1 dry-run release. These are outward-facing, so ask before each.

### Task 4: Theme contract, Soft values, and contrast test

**Files:**
- Create: `src/tokens/primitives.ts`, `src/tokens/breakpoints.ts`, `src/themes/contract.css.ts`, `src/themes/softLight.ts`, `src/themes/softDark.ts`, `src/themes/types.ts`, `src/themes/contrast.ts` (internal), `src/themes/contrast.test.ts`, `src/themes/contract.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `vars` (from `createGlobalThemeContract`), `ThemeTokens`, `softLight: ThemeTokens`, `softDark: ThemeTokens`, `tokens`, `breakpoints`, and internal `tokenToVarName(path: string[]): string`. Alias values are strings such as `'var(--ds-radius-xl)'`.

**Decision:** `color.bg.avatar.*` and `color.fg.avatar.*` are left out of the contract for now. Spec 02 sets their values when `Avatar` is built in v0.5, and adding them then is a minor release with a release note (Spec 05). All other Spec 02 tokens, including `size.dialog`, `size.drawer`, and `size.avatar`, go in now.

- [ ] **Step 1: Write the failing tests**

```ts
// contract.test.ts
it.each([
  [['space', '0.5'], '--ds-space-0_5'],
  [['font', 'size', '2xl'], '--ds-font-size-2xl'],
  [['color', 'fg', 'onAccent'], '--ds-color-fg-on-accent'],
  [['size', 'sidebarRail'], '--ds-size-sidebar-rail'],
  [['color', 'bg', 'accentSubtle'], '--ds-color-bg-accent-subtle'],
])('%j becomes %s', (path, name) => expect(tokenToVarName(path)).toBe(name));

it('points aliases at their targets', () => {
  expect(softLight.radius.control).toBe('var(--ds-radius-md)');
  expect(softLight.shadow.card).toBe('var(--ds-shadow-md)');
  expect(softDark.shadow.card).toBe('var(--ds-shadow-sm)');
  expect(softLight.color.focus).toBe('var(--ds-color-bg-accent)');
});
```

```ts
// contrast.test.ts
it.each([['softLight', softLight], ['softDark', softDark]])('%s meets every declared pair', (_, theme) => {
  expect(contrastFailures(theme, CONTRAST_PAIRS)).toEqual([]);
});
it('resolves aliases and parses rgb()', () => {
  expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
});
```

`CONTRAST_PAIRS` is exactly Spec 02's table, minus the avatar row, each pair with its 4.5 or 3 threshold.

- [ ] **Step 2: Run `npx vitest run src/themes` and confirm it fails.**

- [ ] **Step 3: Implement.** `tokenToVarName` is the `createGlobalThemeContract` mapper: join with `-`, kebab-case camelCase, and replace `.` with `_`. Copy Soft values verbatim from Spec 02. `contrast.ts` handles hex and `rgb()` only, and isn't exported from `src/index.ts`.

- [ ] **Step 4: Run it and confirm it passes.** If a declared pair fails, stop and report it. Don't change a Soft value on your own, because the owner chose them.

- [ ] **Step 5: Add the raw-value check.** Create `scripts/check-raw-values.mjs`, run by `npm run lint`, which fails on a color, `px` length, or shadow literal in `src/components/**/*.css.ts`. It allows `0`, `100%`, `1px`, `em`, `@media (forced-colors: active)` blocks, and the exempt `sprinkles.css.ts`. Test it against one temporary bad file.

- [ ] **Step 6: Commit** with message `Add theme contract and Soft themes`.

### Task 5: Global styles and fonts

**Files:**
- Create: `src/styles/layers.css.ts`, `src/styles/theme.css.ts`, `src/styles/reset.css.ts`, `src/styles/base.css.ts`, `src/styles/index.ts`, `src/styles/focus.css.ts`, `scripts/build-fonts.mjs`, `src/styles/styles.test.ts`
- Modify: `package.json` (`build` runs `build-fonts` after Vite), `.storybook/preview.tsx` (imports fontsource for dev), `scripts/verify-dist.mjs`, `tests/fixtures/smoke.spec.ts`

**Interfaces:**
- Consumes: `vars`, `softLight`, `softDark`.
- Produces: internal `layers.components` and `layers.utilities` names, and `focusRing` (a shared `style`: `2px` solid `vars.color.focus`, `2px` offset, on `:focus-visible`). The `theme.css.ts` selectors are Spec 03's: `:root`, `:root:not([data-ds-mode])` inside the dark media query, and `:root[data-ds-mode='dark']`.

**Decision:** fonts and the layer declaration are added by a post-build script. `scripts/build-fonts.mjs` copies latin and latin-ext woff2 files and OFL license files into `dist/fonts/`, then prepends the `@layer` order line, `@font-face` rules with relative URLs and `unicode-range`, and the metric-matched fallback faces to `dist/styles.css`. So the order line is always first, and Vite doesn't rename or inline the fonts.

- [ ] **Step 1: Write the failing tests** against the built CSS (`npm run build` first):

```ts
const css = readFileSync('dist/styles.css', 'utf8');
it('declares the layer order first', () => {
  expect(css.trimStart().startsWith('@layer ds.theme,ds.reset,ds.base,ds.components,ds.utilities')).toBe(true);
});
it('has fonts with relative URLs, and the files exist', () => {
  expect(css).toMatch(/url\(["']?\.\/fonts\//);
  expect(css).not.toMatch(/fonts\.googleapis/);
  expect(existsSync('dist/fonts')).toBe(true);
});
it('has Soft Dark variables twice, once per selector', () => {
  expect(css.split('--ds-color-bg-canvas:#141311').length - 1).toBe(2);
});
```

Add a browser story test, the Review Focus case:

```ts
// With prefers-reduced-motion: reduce emulated, for each of: no attribute, 'light', 'dark'
expect(getComputedStyle(document.documentElement).getPropertyValue('--ds-motion-duration-base').trim()).toBe('0ms');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Use `globalStyle` with `assignVars` inside `'@layer': { 'ds.theme': … }`. **Emit reduced motion last, with the selector `:root:not([data-ds-mode]), :root[data-ds-mode]`,** so its specificity ties with the mode rules and its order wins. Set `color-scheme` per theme. Follow Spec 02's reset list and `ds.base`, including `font-feature-settings`. Verify Inter's `cv05` and `cv08` tags against the installed version, and note any change in the PR.

- [ ] **Step 4: Run and confirm they pass.** Update the fixture smoke test to assert `getComputedStyle(body).backgroundColor` is Soft's canvas, and that no request leaves the app's origin.

- [ ] **Step 5: Commit** with message `Add global styles, cascade layers, and bundled fonts`.

### Task 6: `defineTheme`, `defineFullTheme`, and `themeToCss`

**Files:**
- Create: `src/theme/defineTheme.ts`, `src/theme/themeToCss.ts`, `src/theme/defineTheme.test.ts`, `src/theme/defineTheme.test-d.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `ThemeTokens`, `tokenToVarName`.
- Produces: `defineTheme(input: { shared?: ThemeOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }): Theme`, `defineFullTheme(input: { light: ThemeTokens; dark: ThemeTokens }): Theme`, `themeToCss(theme: Theme): string`, and types `Theme`, `ThemeOverrides`. `Theme` is opaque and serializable. No `"use client"`.

- [ ] **Step 1: Write the failing tests**

```ts
it('emits unlayered rules with mode selectors', () => {
  const css = themeToCss(defineTheme({ shared: { radius: { control: '8px' } }, light: { color: { bg: { accent: '#0f766e' } } } }));
  expect(css).toContain(':root{--ds-radius-control:8px}');
  expect(css).toContain(":root[data-ds-mode='light']{--ds-color-bg-accent:#0f766e}");
  expect(css).toMatch(/@media \(prefers-color-scheme: light\)\{:root:not\(\[data-ds-mode\]\)\{--ds-color-bg-accent:#0f766e\}\}/);
  expect(css).not.toContain('@layer');
});
it('keeps a light override out of the dark rules', () => {
  const css = themeToCss(defineTheme({ light: { color: { bg: { accent: '#0f766e' } } } }));
  expect(css).not.toContain("[data-ds-mode='dark']");
});
it.each(['red;}', '{', '<style>', 'a;b'])('rejects %s', (bad) => {
  expect(() => defineTheme({ shared: { radius: { control: bad } } })).toThrow();
});
```

```ts
// defineTheme.test-d.ts
defineTheme({ shared: { radius: { control: '8px' } } });
defineTheme({ shared: { zIndex: { modal: 10 } } });
// @ts-expect-error unknown token
defineTheme({ shared: { radius: { controll: '8px' } } });
// @ts-expect-error a number outside zIndex, font.weight, and font.lineHeight
defineTheme({ shared: { radius: { control: 8 } } });
// @ts-expect-error a missing token
defineFullTheme({ light: { color: {} }, dark: softDark });
```

- [ ] **Step 2: Run and confirm they fail.** `npx vitest run src/theme --typecheck`

- [ ] **Step 3: Implement.** Validation runs at define time, and rejects `{`, `}`, `;`, or `<`. Numbers are allowed only for `zIndex`, `font.weight`, and `font.lineHeight`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit** with message `Add typed theme overrides`.

### Task 7: `ThemeProvider` and `useColorMode`

**Files:**
- Create: `src/theme/ThemeProvider.tsx` (`"use client"`), `src/theme/colorModeStore.ts`, `src/theme/ThemeProvider.test.tsx`, `src/utils/warn.ts`, `src/utils/warn.test.ts`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (assert the output of `ThemeProvider` begins with `"use client"`, and remove the probe)

**Interfaces:**
- Consumes: `Theme`, `themeToCss`.
- Produces: `ThemeProvider` with Spec 03's props; `useColorMode(): { mode: ColorMode; resolvedMode: 'light' | 'dark' | undefined; setMode: (m: ColorMode) => void; isForced: boolean }`; `type ColorMode = 'system' | 'light' | 'dark'`; internal `warnOnce(key: string, message: string): void`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('stores system even when defaultMode is dark');
it('sets data-ds-mode for light and dark, and removes it for system');
it('restores the previous data-ds-mode on unmount', () => {
  document.documentElement.dataset.dsMode = 'light';
  const { unmount } = render(<ThemeProvider forcedMode="dark" />);
  expect(document.documentElement.dataset.dsMode).toBe('dark');
  unmount();
  expect(document.documentElement.dataset.dsMode).toBe('light');
});
it('keeps the right mode, with no warning, in StrictMode', () => {
  const warn = vi.spyOn(console, 'warn');
  render(<StrictMode><ThemeProvider defaultMode="dark" /></StrictMode>);
  expect(document.documentElement.dataset.dsMode).toBe('dark');
  expect(warn).not.toHaveBeenCalled();
});
it('warns once for a nested provider, and the inner one does nothing');
it('falls back to defaultMode for an invalid stored value', () => {
  localStorage.setItem('ds-color-mode', 'purple');
  render(<ThemeProvider defaultMode="dark"><Probe /></ThemeProvider>);
  expect(probe.mode).toBe('dark');
});
it('works when localStorage throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(() => render(<ThemeProvider><Probe /></ThemeProvider>)).not.toThrow();
});
it('updates from a storage event');
it('warns and does nothing on setMode when forced, with isForced true');
it('has resolvedMode undefined during server rendering', () => {
  expect(renderToString(<ThemeProvider><Probe /></ThemeProvider>)).toContain('resolved:undefined');
});
it('throws a clear error outside a provider');
it('renders overrides in a plain style element, unescaped, with the nonce', () => {
  const html = renderToString(<ThemeProvider theme={defineTheme({ shared: { font: { family: { sans: '"My Font", sans-serif' } } } })} nonce="n" />);
  expect(html).toContain('"My Font"');
  expect(html).toContain('nonce="n"');
});
it('re-renders only components calling the hook when the mode changes');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** with `useSyncExternalStore`, returning `undefined` for `resolvedMode` from its server snapshot. The provider renders no wrapper. Suppress transitions for one frame while switching. `warnOnce` follows Spec 05's rule.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit** with message `Add ThemeProvider and useColorMode`.

### Task 8: `ColorModeScript`, `getColorModeScript`, and fixture checks

**Files:**
- Create: `src/theme/colorModeScript.ts`, `src/theme/ColorModeScript.tsx`, `src/theme/colorModeScript.test.ts`, `tests/fixtures/color-mode.spec.ts`
- Modify: `src/index.ts`, `fixtures/vite-app/*`, `fixtures/next-app/*`, `README.md`

**Interfaces:**
- Produces: `getColorModeScript(options?: { defaultMode?: ColorMode; forcedMode?: 'light' | 'dark'; storageKey?: string }): string`; `ColorModeScript` with Spec 03's props. Neither has `"use client"`.

- [ ] **Step 1: Write the failing unit tests.** Run the returned string with `new Function` against a stubbed `document` and `localStorage`:

```ts
it.each([
  [{ stored: 'dark' }, 'dark'],
  [{ stored: 'system', defaultMode: 'dark' }, null],
  [{ stored: 'purple', defaultMode: 'light' }, 'light'],
  [{ storageThrows: true, defaultMode: 'dark' }, 'dark'],
  [{ stored: 'light', forcedMode: 'dark' }, 'dark'],
  [{}, null],
])('%j sets %s', (setup, expected) => expect(runScript(setup)).toBe(expected));
it('rejects a storageKey that would break out of the script', () => {
  expect(getColorModeScript({ storageKey: '</script>' })).not.toContain('</script>');
});
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** One small dependency-free string. Serialize options with `JSON.stringify`, then escape `<`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Wire the fixtures.** `next-app` calls `defineTheme` and renders `ColorModeScript` from a server component, with `suppressHydrationWarning`. `vite-app` injects `getColorModeScript` as the README shows. Both render a test-only portal.

- [ ] **Step 6: Write `tests/fixtures/color-mode.spec.ts`,** run for both fixtures, covering Spec 03's six browser checks:
  - With a stored `dark`, and the JS bundle blocked, the canvas is `#141311` at first paint.
  - Emulating `prefers-color-scheme` selects the mode, and updates live.
  - With JavaScript disabled, CSS alone follows the OS.
  - There are no hydration warnings in `next-app`.
  - The portaled element gets the theme's values.
  - Typed overrides appear unescaped in `next-app`'s server HTML.

- [ ] **Step 7: Run `npm run test:fixtures`** and expect it to pass.

- [ ] **Step 8: Commit** with message `Add ColorModeScript and verify no flash in fixtures`.

### Task 9: `Box`, sprinkles, and style prop types

**Files:**
- Create: `src/components/Box/sprinkles.css.ts`, `src/components/Box/types.ts`, `src/components/Box/Box.test-d.tsx`, `src/components/Box/Box.browser.stories.tsx`
- Modify: `src/components/Box/Box.tsx`, `Box.test.tsx`, `Box.stories.tsx`, `index.ts`, `src/index.ts`; delete `Box.css.ts`

**Interfaces:**
- Consumes: `vars`, `breakpoints`, the `ds.utilities` layer.
- Produces: `Box<E extends ElementType = 'div'>(props: BoxProps<E>)`; `BoxProps<E>`; `LayoutProps`; `Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T }`; `SpaceToken` and the other named token types; `box(props): string`.

- [ ] **Step 1: Write the failing type tests,** every bullet in Spec 04's "Type tests", including:

```tsx
<Box padding="4" />;
// @ts-expect-error arbitrary value
<Box padding="13px" />;
// @ts-expect-error unknown breakpoint
<Box padding={{ xxl: '4' }} />;
<Box as="a" href="/x" />;
// @ts-expect-error div has no href
<Box as="div" href="/x" />;
// @ts-expect-error width is a style prop
<Box as="img" width={640} />;
<Box as="img" alt="" htmlWidth={640} htmlHeight={360} width="full" />;
// @ts-expect-error div has no width attribute
<Box htmlWidth={640} />;
<Box as="ol" start={3} />;
expectTypeOf<BoxProps<'a'>['ref']>().toEqualTypeOf<Ref<HTMLAnchorElement> | undefined>();
```

- [ ] **Step 2: Write the failing unit tests**

```tsx
it('turns style props into classes, and forwards nothing', () => {
  render(<Box data-testid="b" padding="4" />);
  expect(el().getAttribute('padding')).toBeNull();
  expect(el().className).not.toBe('');
});
it('merges className and forwards style, data, and aria');
it('forwards ref, and as renders the right element');
it('renders htmlWidth as width');
it.each([undefined, null])('ignores %s without throwing', (value) => {
  expect(() => render(<Box padding={value as never} margin={{ md: value as never }} />)).not.toThrow();
  expect(el().className).toBe('');
});
it('passes as={Component} its className and props, and no style props', () => {
  const Probe = vi.fn((p) => <a {...p} />);
  render(<Box as={Probe} href="/x" padding="4" />);
  expect(Probe.mock.calls[0][0]).toMatchObject({ href: '/x' });
  expect(Probe.mock.calls[0][0]).not.toHaveProperty('padding');
});
```

- [ ] **Step 3: Run and confirm they fail.**

- [ ] **Step 4: Implement `sprinkles.css.ts`** with Spec 04's tables exactly, using `'@layer'`. Responsive conditions are `base`, `sm`, `md`, `lg`, `xl`, with no array form. Declare properties in the order all sides, axis, single side. Every value references `vars`, except listed keywords.

- [ ] **Step 5: Write `types.ts` by hand,** with TSDoc on each prop, one generic for `as`, and no overloads. Add the compile-time sync check: `Equals<keyof SprinkleProps, BoxStyleProp>` and value equality per prop.

- [ ] **Step 6: Implement `Box`.** It splits props with `sprinkles.properties`, filtering `null` and `undefined`, including inside responsive objects, and has no `"use client"`. Export `box` as the same filtered function.

- [ ] **Step 7: Run and confirm they pass.** `npm test`

- [ ] **Step 8: Write browser stories** for Spec 04's browser list: responsive values at breakpoints, `padding` beating a `ds.components` padding, unlayered CSS beating the prop, both precedence rules (`padding={{ md: '8' }} paddingX="2"` gives `padding: 8` from `md` up), and a token override changing a prop's result. Add the Box playground and All style props pages.

- [ ] **Step 9: Run `npm run test:stories && npm run test:fixtures`,** with `next-app` rendering `Box` from a server component. Expect them to pass. Record the size report in the CI summary, per Spec 04.

- [ ] **Step 10: Commit** with message `Add Box and token-only style props`.

### Task 10: Component conventions

**Files:**
- Create: `src/utils/cx.ts`, `src/utils/types.ts`, `src/utils/splitLayoutProps.ts`, `src/utils/recipe.ts`, `src/utils/utils.test.ts`, `src/utils/utils.test-d.ts`

**Interfaces:**
- Consumes: `LayoutProps`, `BoxProps`, `sprinkles.properties`.
- Produces (all internal):
  - `cx(...parts: (string | false | null | undefined)[]): string`
  - `ComponentProps<E, Own>` and `PolymorphicProps<E, Own>`
  - `splitLayoutProps<P>(props: P): [LayoutProps, Omit<P, keyof LayoutProps>]`
  - `layered(style: StyleRule): StyleRule`, wrapping a style in the `ds.components` layer for `style()` and `recipe()`

- [ ] **Step 1: Write the failing tests**

```ts
expect(cx('a', false, null, 'b')).toBe('a b');
const [layout, rest] = splitLayoutProps({ margin: '4', id: 'x', padding: '2' });
expect(layout).toEqual({ margin: '4' });
expect(rest).toEqual({ id: 'x', padding: '2' });
```

```ts
type P = ComponentProps<'span', { tone?: 'a' }>;
expectTypeOf<P>().toHaveProperty('margin');
expectTypeOf<P>().not.toHaveProperty('padding');
expectTypeOf<P>().not.toHaveProperty('color');
```

Add a compiled-CSS check that a `recipe()` built with `layered` keeps base, variant, and nested `@media` rules inside `@layer ds.components`.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Keep them internal, not exported from `src/index.ts`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit** with message `Add internal component helpers`.

### Task 11: `Icon`

**Files:**
- Create: `src/components/Icon/Icon.tsx`, `Icon.css.ts`, `Icon.stories.tsx`, `Icon.test.tsx`, `index.ts`, `src/components/Icon/internal/ExternalLink.tsx`, `src/components/Icon/internal/LICENSE-lucide.txt`
- Modify: `src/index.ts`, both fixtures (declare `lucide-react`), `scripts/test-fixtures.mjs`

**Interfaces:**
- Consumes: `Box`, `cx`, `layered`, `ComponentProps`.
- Produces: `Icon`, `IconProps`, `IconSize`, `IconTone`, internal `ExternalLinkIcon`. Task 14's `Link` uses `<Icon icon={ExternalLinkIcon} size="inherit" />`.

- [ ] **Step 1: Write the failing tests,** every bullet in Spec 07's Unit list, including:

```tsx
it('is decorative without a label', () => {
  render(<Icon icon={Svg} data-testid="i" />);
  expect(el()).toHaveAttribute('aria-hidden', 'true');
  expect(el()).not.toHaveAttribute('role');
  expect(el()).toHaveAttribute('focusable', 'false');
});
it('is named with a label', () => {
  render(<Icon icon={Svg} label="Close" data-testid="i" />);
  expect(el()).toHaveAttribute('role', 'img');
  expect(el()).toHaveAttribute('aria-label', 'Close');
  expect(el()).not.toHaveAttribute('aria-hidden');
});
it('never forwards size');
```

Add a type check that a Lucide icon is assignable to `icon`, and that `<Icon width="6" />` is an error. `lucide-react` is a dev dependency for this and stories only, so `dist` must not import it.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** It renders through `Box as={icon}` with a commented cast. CSS sets `size.icon.*`, with `1em` for `inherit`, plus `display: inline-block`, `flex-shrink: 0`, and `vertical-align`. It has no `"use client"`. Copy Lucide's external-link path with the ISC notice.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Write stories** for Spec 07's browser list and Storybook page, then run `npm run test:stories`.

- [ ] **Step 6: Extend fixtures.** `next-app` renders a Lucide icon from a server page. `vite-app` imports one icon, and `test-fixtures.mjs` asserts the build lacks a path marker from an unused icon. Assert `dist/index.d.ts` doesn't mention `lucide`. Run `npm run test:fixtures`.

- [ ] **Step 7: Commit** with message `Add Icon`.

### Task 12: Layout components

**Files:**
- Create: `src/components/{Flex,Stack,Inline,Grid,Container,Center,Inset}/` per Spec 01's folder layout (`Grid.css.ts` only for `autoRows`), `src/utils/withDefaultDisplay.ts`, `src/utils/testUtils.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Box`, `PolymorphicProps`, `layered`.
- Produces: seven components and `<Name>Props`. Internal `withDefaultDisplay(display: Responsive<Display> | undefined, fallback: Display): Responsive<Display>`. Test helper `expectSameClass(a: ReactElement, b: ReactElement): void`, which renders both and compares the class sets of `data-testid="c"`. Task 13 uses it too.

- [ ] **Step 1: Write the failing tests**

```ts
expect(withDefaultDisplay(undefined, 'flex')).toBe('flex');
expect(withDefaultDisplay('none', 'flex')).toBe('none');
expect(withDefaultDisplay({ md: 'none' }, 'flex')).toEqual({ base: 'flex', md: 'none' });
expect(withDefaultDisplay({ base: 'none', md: 'flex' }, 'flex')).toEqual({ base: 'none', md: 'flex' });
```

Then, per component, assert the props map to the same classes as the equivalent `Box`:

```tsx
expectSameClass(<Stack data-testid="c" />, <Box data-testid="c" display="flex" flexDirection="column" gap="3" />);
expectSameClass(<Inline data-testid="c" />, <Box data-testid="c" display="flex" gap="2" flexWrap="wrap" alignItems="center" />);
expectSameClass(<Grid columns="4" data-testid="c" />, <Box data-testid="c" display="grid" gridTemplateColumns="4" gap="3" />);
expectSameClass(<Container data-testid="c" />, <Box data-testid="c" maxWidth="container.lg" marginX="auto" paddingX={{ base: '4', md: '6' }} />);
expectSameClass(<Inset x="2" top="4" data-testid="c" />, <Box data-testid="c" paddingX="2" paddingTop="4" />);
```

Also cover `Center`'s `axis` and `inline`, each `as`, `Container size="prose"` and `"full"`, and `paddingX="0"`.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Each only composes `Box`, with no `"use client"`. Padding props on layout components, other than `Container`'s `paddingX`, are type errors.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Write stories** for Spec 06's browser list, and the Layout overview page with a bento `Grid`. Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add layout components`.

### Task 13: `Text` and `Heading`

**Files:**
- Create: `src/components/Text/typography.css.ts` (a small sprinkles set in `ds.utilities`, for `size` and `align`), `Text.tsx`, `Text.css.ts`, `Text.stories.tsx`, `Text.test.tsx`, `index.ts`; `src/components/Heading/*`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Box`, `warnOnce`, `layered`, `PolymorphicProps`, `ComponentProps`.
- Produces: `Text`, `TextProps`, `Heading`, `HeadingProps`, `FontSizeToken`, `TextTone`, `HeadingLevel`. `Link` in Task 14 doesn't reuse these, since it inherits its size.

- [ ] **Step 1: Write the failing tests**

```tsx
it('adds no size or weight class by default', () => {
  render(<Text data-testid="t" />);
  expect(el().className).toBe(textBaseClass);
});
it('warns once when truncate and lineClamp are both set, and lineClamp wins');
it.each([[1, 'H1'], [6, 'H6']])('level %s renders %s', (level, tag) => { /* … */ });
it('keeps the tag when size changes', () => {
  render(<Heading level={2} size="5xl">x</Heading>);
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
});
it('uses the level default size', () => {
  expectSameClass(<Heading level={3} data-testid="c" />, <Heading level={3} size="2xl" data-testid="c" />);
});
it('defaults to semibold');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Each `size` sets font size, line height, and letter spacing together, per Spec 06's table. `family` also sets font features: `sans` uses `font.features.sans`, and `mono` and `prose` use `normal`. `tone` values are `muted`, `accent`, and the four statuses. Neither has `"use client"`. `Heading` doesn't accept `as`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Write stories,** including `<Text as="span">` inside a larger `Heading`, `truncate` and `lineClamp` with `as="span"`, and the Typography page. Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add Text and Heading`.

### Task 14: `Link`, `Code`, `Kbd`, and `VisuallyHidden`

**Files:**
- Create: `src/components/{Link,Code,Kbd,VisuallyHidden}/` per Spec 01's folder layout
- Modify: `src/index.ts`, `fixtures/next-app/*`

**Interfaces:**
- Consumes: `Box`, `Icon`, `ExternalLinkIcon`, `focusRing`, `PolymorphicProps`, `ComponentProps`.
- Produces: four components, `<Name>Props`, and `LinkTone`. Later specs use `VisuallyHidden` and `Link`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('external sets target, rel, and hidden text', () => {
  render(<Link href="/x" external>Docs</Link>);
  const a = screen.getByRole('link', { name: 'Docs (opens in a new tab)' });
  expect(a).toHaveAttribute('target', '_blank');
  expect(a).toHaveAttribute('rel', 'noopener noreferrer');
});
it('explicit target and rel override external');
it('externalLabel changes the hidden text');
it('renders as a router link', () => {
  const Router = (p) => <a data-router {...p} />;
  render(<Link as={Router} href="/x">x</Link>);
  expect(screen.getByRole('link')).toHaveAttribute('data-router');
});
it('renders code and kbd elements');
it('VisuallyHidden is a span, in the accessibility tree, and as="a" works');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.**
  - `Link` sets `color` for both tones, with `neutral` using `color: inherit`.
  - `Code` is `max(var(--ds-font-size-xs), 0.88em)`, and has the `pre &` rule from Spec 06.
  - `Kbd` is `max(var(--ds-font-size-xs), 0.8em)`, with the thicker bottom edge.
  - `VisuallyHidden` uses `position: absolute`, a `1px` box, and `clip-path`. `focusable` removes these on `:focus`.
  - None has `"use client"`. `Code` and `Kbd` don't accept `as`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Write stories** for Spec 06's remaining browser list: `Code` and `Kbd` on an inverse surface and never below 12px, `focusable` visible on focus, and `Link`'s focus ring and contrast. `next-app` renders one layout and one typography component from a server page. Run `npm run test:stories && npm run test:fixtures`.

- [ ] **Step 6: Commit** with message `Add Link, Code, Kbd, and VisuallyHidden`.

### Task 15: Foundation docs and milestone acceptance

**Files:**
- Create: `src/styles/foundations/{Colors,Typography,Spacing,Radii,Shadows,Motion}.mdx`
- Modify: `README.md`, `CLAUDE.md`, `docs/HANDOFF.md`

**Interfaces:**
- Consumes: everything above. Produces nothing new.

- [ ] **Step 1: Write the Foundations pages** from Spec 02's Storybook section, including swatches with contrast values for both themes.

- [ ] **Step 2: Add a test for Spec 02's accent criterion.** A story with plain CSS `--ds-color-bg-accent` override asserts that `Link`, accent text, and the focus ring change. Selected states and buttons wait for later specs, so note that gap in the PR.

- [ ] **Step 3: Audit against each spec.** Walk the Acceptance criteria of Specs 01–07, and record each as passed, or as needing the owner. Run:

`npm ci && npm run check`

Expected: all pass on a fresh clone. Run the type-hover checks by hand in an editor: hovering `padding` shows `Responsive<SpaceToken>` and its doc comment.

- [ ] **Step 4: Regenerate baselines** by running `update-visual-baselines` on the branch, and review the diff. Expected: all five CI jobs pass on the PR.

- [ ] **Step 5: Do the manual checks Spec 05 requires:** forced colors, 200% text, and a screen reader pass on `Link`, `VisuallyHidden`, and `Icon`. Report anything not done rather than marking it complete.

- [ ] **Step 6: Commit** with message `Add foundation docs`, then mark the PR ready for the owner.

**Needs the owner, not done here:** merging the PR, the first real release (`npm run release -- minor`), and confirming the hosted Storybook is reachable.
