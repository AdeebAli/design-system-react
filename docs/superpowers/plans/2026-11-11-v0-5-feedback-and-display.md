# v0.5 Feedback and Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.5: `Spinner`, `Alert`, `Divider`, `Progress`, `Avatar`, and `Drawer` (Spec 16), plus every new theme token that v0.5–v0.7 need.

**Architecture:** Spec 16 comes first in the series, because v0.6's `FileUpload` needs `Progress` and v0.7's `Sidebar` needs `Drawer`. `Progress`, `Avatar`, and `Drawer` are `"use client"` wrappers over Base UI 1.9.0. `Drawer` reuses v0.4's `Dialog` patterns and overlay internals (`src/components/overlays/`). `Alert`, `Spinner`, and `Divider` are server-safe.

**Tech Stack:** As v0.4.1. There are no new dependencies.

**Spec:** `docs/specs/16-feedback-and-display.md`, with `docs/specs/05-component-conventions.md`, `docs/specs/02-tokens-and-themes.md` (Task 1), and `docs/specs/12-overlays.md` (`Dialog`'s rules, for `Drawer`). Read the task's spec section before starting it. Exact values (tokens, sizes, defaults, copy) live there, and this plan doesn't repeat the spec tables.

This is one of four plans that replace the single v0.5 plan (owner's split, 2026-11-11): `2026-11-11-v0-4-1-open-threads.md` → `2026-11-11-v0-5-feedback-and-display.md` → `2026-11-11-v0-6-advanced-inputs.md` → `2026-11-11-v0-7-app-navigation.md`. Each one is its own branch, PR, and release, in that order. Start one only after the previous one is released.

## Departures from the spec

None found while planning. One placement decision: Task 1 adds Spec 15's `size.sidebar` and `size.sidebarRail` now, two releases before `Sidebar` uses them. That way the theme contract breaks once, in v0.5.0, not again in v0.7.0. The cost is two tokens with no user until v0.7. If a task can't meet the spec as written, stop and raise it with the owner before building on it.

## Global Constraints

- Branch `feat/v0.5-feedback-and-display` from an up-to-date `main`, in the main checkout. One commit per task, and one PR. **No co-author or generated-by lines in commits or the PR body** (the owner's standing rule). The first commit is Task 1.
- Base UI 1.9.0 (installed and latest on npm, checked 2026-11-11) names, confirmed in the installed types:
  - `Drawer.{Root,Trigger,Portal,Backdrop,Viewport,Popup,Content,Title,Description,Close,VirtualKeyboardProvider}`. `Root`: `open`, `defaultOpen`, `onOpenChange`, `swipeDirection` (physical), `disablePointerDismissal`, `modal`. `Popup`: `initialFocus`, `finalFocus`.
  - `Avatar.{Root,Image,Fallback}`. `Image`: `keepMounted`, `onLoadingStatusChange`.
  - `Progress.{Root,Track,Indicator,Label,Value}`. `Root`: `value: number | null`, `max`.
- Server-safe modules (no `"use client"`, added to `verify-dist`'s `serverModules`): `Alert` (not its dismiss button file), `Spinner`, and `Divider`. All others begin with `"use client"`.
- No new internal icons. Reuse `X`, `Info`, `CircleCheck`, `CircleAlert`, and `TriangleAlert`.
- Only `src/components/**` imports Base UI, and `dist/index.d.ts` never mentions `base-ui` (existing check).
- Change handlers receive only the value (Spec 05).
- Style values come from `vars` only. Hover goes inside `@media (hover: hover)`. Only `opacity`, `transform`, and colors animate, on `motion.*` tokens. Use logical properties throughout, and forced-colors rules wherever the spec names them.
- Development warnings use `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix the problem.
- Viewport checks go in `*.browser.test.tsx` with `page.viewport(w, h)`. Media emulation (reduced motion, forced colors) goes through `cdp()`, as in v0.4. RTL tests set `document.documentElement.dir = 'rtl'` and restore it in `afterEach`.
- A test is written and seen failing before the code it covers. For code that already exists, break the code, watch the test fail, and restore it.
- Each component task also writes its stories file (every state, in both modes, plus the docs and recipes its spec's "Storybook" section names), and runs `npm run test:stories` before committing, so every story passes axe in both modes.
- Thread 7 (intermittent `Table`/`Button` browser tests): if either fails in CI or in `npm run check`, find the cause in the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) before rerunning.
- Don't change anything a spec or this plan doesn't ask for.

## Review Focus

Each one has a test in the named task.

1. **`Progress` with `value={150}` or `value={-5}` (Task 5).** The fill is clamped to the track (0–100%), and the page doesn't overflow.
2. **`Avatar` initials from messy names (Task 6).** `'  Ada   Park '` gives `'AP'`, `'👩‍💻 Dev'` gives `'👩‍💻D'` with the grapheme intact, and `'   '` renders no initials and doesn't throw.
3. **The root `dir` flips between two opens of a controlled `Drawer` with no trigger (Task 7).** The second open slides from the new start edge, and its swipe direction matches.

---

### Task 1: v0.5 tokens and contrast pairs

**Files:**
- Modify: `src/themes/{types.ts,softShared.ts,softLight.ts,softDark.ts,contrast.ts,contrast.test.ts,contract.test.ts}`, `docs/specs/02-tokens-and-themes.md` (the token and contrast tables)

**Interfaces:**
- Produces: `vars.color.bg.avatar.{1-6}` and `vars.color.fg.avatar.{1-6}` (per mode), the only new tokens in v0.5–v0.7.
- *Corrected during the build:* `size.sidebar`, `size.sidebarRail`, `size.avatar.*`, and `size.drawer.*` have been in the theme since v0.1 (`9c49e84`), with Spec 02's values. Task 1 adds tests for them, not the tokens.
- *Owner's decision during the build:* Box's `background` and `color` props leave out the nested avatar pairs (Spec 04 amended), and the Colors docs page gets an avatar-pairs table.

- [ ] **Step 1: Write the failing tests.** `contract.test.ts`: the new paths exist with the values above. `contrast.test.ts`: add `color.fg.avatar.{n}` on `color.bg.avatar.{n}` at 4.5 for n = 1–6, in both modes. Remove "except the avatar row" from `CONTRAST_PAIRS`'s comment.
- [ ] **Step 2: Run** `npx vitest run --project unit src/themes`. Expected: fail, because the tokens are missing.
- [ ] **Step 3: Implement.** Pick six distinct hues per mode (the builder's choice) that pass 4.5:1. Amend Spec 02's tables to list the new tokens and the avatar pair.
- [ ] **Step 4: Run** the Step 2 command and `npm run typecheck`. Expected: pass.
- [ ] **Step 5: Commit** `Add v0.5 size and avatar color tokens`.

### Task 2: `Spinner`

**Files:**
- Create: `src/components/Spinner/{Spinner.tsx,Spinner.css.ts,Spinner.test.tsx,Spinner.test-d.tsx,Spinner.browser.test.tsx,Spinner.stories.tsx,index.ts}`
- Modify: `src/components/Button/ButtonBase.tsx` (use the new `Spinner`), delete `src/components/Button/Spinner.tsx`, `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Produces: `Spinner`, `SpinnerProps` (`size?: 'sm' | 'md' | 'lg'` = `'md'`, `label?: string`, plus layout props). The root is a `span`.

- [ ] **Step 1: Write the failing tests.** `aria-hidden` without `label`. With `label`, `role="status"` and the label as text. `size` maps to `size.icon.*` (the computed width in the browser test). Browser: reduced motion leaves the animation stopped and the spinner visible. Both Button `loading` browser tests still pass, and the spinner is `currentColor`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Spinner`. Expected: fail, because the module is missing.
- [ ] **Step 3: Implement** by moving the drawing from `Button/Spinner.tsx`. `ButtonBase` renders `<Spinner size=… />` with its own hidden `loadingLabel` unchanged.
- [ ] **Step 4: Run** `npx vitest run --project unit src/components/{Spinner,Button} && npx vitest run --project browser src/components/{Spinner,Button}`. Expected: pass.
- [ ] **Step 5: Commit** `Add Spinner and use it in Button`.

### Task 3: `Alert`

**Files:**
- Create: `src/components/Alert/{Alert.tsx,AlertDismiss.tsx,Alert.css.ts,Alert.test.tsx,Alert.test-d.tsx,Alert.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (`Alert.js` server, `AlertDismiss.js` client)

**Interfaces:**
- Produces: `Alert`, `AlertProps` (`tone?: 'info' | 'success' | 'warning' | 'danger'` = `'info'`, `title?: ReactNode`, `icon?: ReactElement | null`, `action?: ReactNode`, `onDismiss?(): void`, `dismissLabel?` = `'Dismiss'`, `live?: 'off' | 'polite' | 'assertive'` = `'off'`, plus layout props). `AlertDismiss` (internal, `"use client"`) is an `IconButton` named `dismissLabel`.

- [ ] **Step 1: Write the failing tests.**
  - Each tone renders its icon (`Info`, `CircleCheck`, `TriangleAlert`, `CircleAlert`), and `icon={null}` renders none.
  - `onDismiss` adds a button named "Dismiss" that calls it.
  - `live` gives no role for `off`, `role="status"` for `polite`, and `role="alert"` for `assertive`.
  - `title` isn't a heading.
  - `data-tone` is set.
  - Type test: `tone="error"` is a type error.
  - Story tests: every tone passes axe in both modes.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Alert`. Expected: fail, because the module is missing.
- [ ] **Step 3: Implement** per Spec 16's `Alert` appearance.
- [ ] **Step 4: Run** the Step 2 command and `npm run test:stories -- Alert`. Expected: pass.
- [ ] **Step 5: Commit** `Add Alert`.

### Task 4: `Divider`

**Files:**
- Create: `src/components/Divider/{Divider.tsx,Divider.css.ts,Divider.test.tsx,Divider.test-d.tsx,Divider.browser.test.tsx,Divider.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Produces: `Divider`, `DividerProps`, a union: `{ orientation?: 'horizontal'; label?: ReactNode; decorative?: false } | { orientation?: 'horizontal'; decorative: true; label?: never } | { orientation: 'vertical'; label?: never; decorative?: boolean }`, plus layout props.

- [ ] **Step 1: Write the failing tests.**
  - Unit: the default renders an `hr`. `vertical` renders a `div` with `role="separator"` and `aria-orientation="vertical"`. `label` renders a `div role="separator"` containing the text. `decorative` sets `aria-hidden`.
  - Type tests: `label` with `vertical` is a type error, and `label` with `decorative` is a type error.
  - Browser: a vertical divider's height equals its `Inline` parent's height. At 320px, `label` is centered within 1px, and the page doesn't scroll horizontally.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Divider`. Expected: fail, because the module is missing.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Divider`. Expected: pass.
- [ ] **Step 5: Commit** `Add Divider`.

### Task 5: `Progress`

**Files:**
- Create: `src/components/Progress/{Progress.tsx,Progress.css.ts,Progress.test.tsx,Progress.test-d.tsx,Progress.browser.test.tsx,Progress.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Produces: `Progress`, `ProgressProps` (`value: number | null`, `max?` = `100`, `showValue?`, `size?: 'sm' | 'md'`, `tone?: 'accent' | 'success' | 'warning' | 'danger'`, and `{ label: ReactNode; 'aria-label'?: never } | { 'aria-label': string; label?: never }`, plus layout props). v0.6's `FileUpload` uses it.

- [ ] **Step 1: Write the failing tests.**
  - Unit: `value`/`max` set `aria-valuenow`/`aria-valuemax`, `null` omits `aria-valuenow` and sets `data-indeterminate`, `label` names the progressbar, and `aria-label` names it.
  - Type test: no name is a type error.
  - Browser: `value={150}` and `value={-5}` keep the indicator within the track, with no page overflow at 320px (Review Focus 1). Reduced motion turns the indeterminate state into a static partial fill that stays visible. Forced colors gives the track a 1px border.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Progress`. Expected: fail, because the module is missing.
- [ ] **Step 3: Implement** on `Progress.Root/Label/Value/Track/Indicator`, per Spec 16. Clamp the indicator's inline size with `min(100%, max(0%, …))` if Base UI doesn't.
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Progress`. Expected: pass.
- [ ] **Step 5: Commit** `Add Progress`.

### Task 6: `Avatar`

**Files:**
- Create: `src/components/Avatar/{Avatar.tsx,initials.ts,initials.test.ts,colorFromName.ts,colorFromName.test.ts,Avatar.css.ts,Avatar.test.tsx,Avatar.test-d.tsx,Avatar.browser.test.tsx,Avatar.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Produces:
  - `initials(name: string): string`.
  - `avatarColorIndex(name: string): 1 | 2 | 3 | 4 | 5 | 6`, a deterministic string hash.
  - `Avatar`, `AvatarProps` (`name: string`, `src?`, `size?: 'sm' | 'md' | 'lg' | 'xl'`, `shape?: 'circle' | 'square'`, `fallback?: ReactNode`, `decorative?`, `status?: 'online' | 'away' | 'busy' | 'offline'`, `statusLabels?: Partial<Record<AvatarStatus, string>>`, `colorFromName?`, `ref`, `className`, plus layout props).
  - `AvatarStatus`.

- [ ] **Step 1: Write the failing tests.**
  - `initials.test.ts`: `'Ada Park'` → `'AP'`, `'Ada'` → `'A'`, `'Ada Mae Park'` → `'AP'`, `'Đặng Văn'` → `'ĐV'`, `'김 민준'` → `'김민'`, and the Review Focus 2 cases.
  - `colorFromName.test.ts`: the same name gives the same index, and the indices for 50 sample names span all six.
  - Unit: the root has `role="img"` and `aria-label="Ada Park"`, or `"Ada Park, online"` with `status`. Its contents are `aria-hidden`. `decorative` sets `aria-hidden` on the root. `data-shape` is set. A failed image shows the initials.
  - Browser:
    - The server HTML (`renderToString`) contains the `img`.
    - A 404 `src` shows the initials, with the image at `visibility: hidden` or `opacity: 0`.
    - The root's rect is unchanged when an image loads.
    - Each status dot has a distinct shape, and its 3:1 contrast against `bg.canvas`, `bg.surface`, and `bg.raised` is computed from the rendered colors.
    - The six `colorFromName` pairs meet 4.5:1 in both modes.
    - The status dot sits at the bottom end corner in LTR and RTL.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Avatar`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.** `initials` uses `Intl.Segmenter(undefined, { granularity: 'grapheme' })` on the trimmed, whitespace-split words. Use `Avatar.Image keepMounted` with `data-loading`/`data-error` styles. Cut the dot's gap with a CSS mask, per Spec 16.
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Avatar`. Expected: pass.
- [ ] **Step 5: Commit** `Add Avatar`.

### Task 7: `Drawer` parts and side panels

**Files:**
- Create: `src/components/Drawer/{Drawer.tsx,DrawerTrigger.tsx,DrawerContent.tsx,DrawerTitle.tsx,DrawerDescription.tsx,DrawerClose.tsx,DrawerContext.ts,swipeDirection.ts,swipeDirection.test.ts,Drawer.css.ts,Drawer.test.tsx,Drawer.test-d.tsx,Drawer.browser.test.tsx,Drawer.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `OverlayTriggerProps`; `Dialog`'s naming and warning pattern (`DialogContext`'s `{alert, register, has}` shape, minus `alert`); `IconButton`, `XIcon`.
- Produces:
  - `Drawer`, `DrawerProps` (`open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`, `closeOnOutsideClick?` = `true`, `children`).
  - `DrawerTrigger` and `DrawerClose` (`OverlayTriggerProps`).
  - `DrawerContent`, `DrawerContentProps` (`side?: DrawerSide` = `'end'`, `size?: 'sm' | 'md' | 'lg'` = `'md'`, `showClose?` = `true`, `closeLabel?` = `'Close'`, `initialFocus?`/`finalFocus?: RefObject<HTMLElement | null>`, `dir?: 'ltr' | 'rtl'`, `aria-label?`, `className`, `style`).
  - `DrawerSide` (`'start' | 'end' | 'bottom'`). `DrawerTitle` (`h2`). `DrawerDescription` (`p`).
  - `toSwipeDirection(side: DrawerSide, dir: 'ltr' | 'rtl'): 'left' | 'right' | 'down'`.
  - v0.7's `Sidebar` relies on `side="start"`, controlled `open`, `finalFocus`, and `aria-label`.

- [ ] **Step 1: Write the failing tests.**
  - `swipeDirection.test.ts`: all six combinations.
  - Unit:
    - Controlled and uncontrolled, with boolean-only `onOpenChange`.
    - Parts render `h2`/`p`, and the title names the dialog.
    - Content isn't in the DOM while closed.
    - `data-open` and `data-side` are set.
    - Warnings: no title and no `aria-label`, and controlled with no `DrawerTrigger` and no `finalFocus`.
    - `closeOnOutsideClick={false}` maps to `disablePointerDismissal`.
  - Type test: `side="left"` and `size` with `side="bottom"` are type errors. If the latter needs a union on `side`, use one.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Drawer`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.** On opening, `DrawerContent` reads `dir ?? getComputedStyle(document.documentElement).direction`, passes `toSwipeDirection` to `Drawer.Root`, and sets `dir` on the popup. Render `Portal` → `Backdrop` → `Viewport` → `Popup` → `Content` → children → the close `IconButton` (last in the DOM). Side panels use `size.drawer.*` capped at `100vw - space.8`, the bleed, `inset-inline-*`, and enter and exit offsets that clear the border and shadow. The rest follows Spec 16's appearance.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests.**
  - `start` and `end` open on the correct physical edge in LTR and RTL, with and without a trigger. The root `dir` is flipped between two opens, and the second open follows it.
  - Focus is trapped, and the body doesn't scroll.
  - `Escape`, a backdrop click, and the close button each close it, and focus returns to the trigger or `finalFocus`.
  - At 320px, the panel is at most `320 − space.8` wide.
  - Reduced motion makes the transitions 0s, and the drawer still closes.
  - Nothing is visible once it's closed: `elementFromPoint` at the edge isn't the popup.

  Run `npx vitest run --project browser src/components/Drawer`.
- [ ] **Step 6: Commit** `Add Drawer`.

### Task 8: `Drawer` bottom sheet and overlays inside

**Files:**
- Modify: `src/components/Drawer/{DrawerContent.tsx,Drawer.css.ts,Drawer.browser.test.tsx,Drawer.stories.tsx}`, `src/components/Overlays.browser.test.tsx`, `src/components/Overlays.stories.tsx` (Drawer vs. Dialog)

**Interfaces:** None new.

- [ ] **Step 1: Write the failing browser tests.**

```tsx
it('a bottom drawer is as tall as its content, up to 85dvh, then scrolls inside');
it('a bottom drawer fills the width below md and is centered, at most size.dialog.lg, from md up');
it('a bottom drawer has a decorative grab handle and safe-area bottom padding');
// Overlays.browser.test.tsx
it('Menu and Select open above a Drawer and work inside it');
it('tall Drawer content scrolls inside the panel, not the page');
```

- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Drawer src/components/Overlays.browser.test.tsx`. Expected: the bottom tests fail. The cross-overlay tests may already pass. If so, break the popup `zIndex`, see them fail, and restore it.
- [ ] **Step 3: Implement** `side="bottom"`: `swipeDirection="down"`, `VirtualKeyboardProvider`, `radius.card` top corners, a handle with `aria-hidden`, and `padding-block-end: calc(space.6 + env(safe-area-inset-bottom))`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Stories** (each side, a filters panel, a bottom sheet with an input, Drawer vs. Dialog docs). Run `npm run test:stories`, then **commit** `Add Drawer bottom sheet`.

### Task 9: Docs, fixtures, and v0.5 acceptance

**Files:**
- Create: `src/components/Feedback.stories.tsx` (choosing between `Alert` and `Toast`, and between `Spinner`, `Skeleton`, and `Progress`, with no `style`/`className`), `fixtures/next-app/app/(site)/feedback/page.tsx` plus `'use client'` helpers as needed, `tests/fixtures/feedback.spec.ts`
- Modify: `src/components/overviewPages.test.ts`, `fixtures/vite-app/src/main.tsx`, `docs/components.md`, `docs/HANDOFF.md`

**Interfaces:** Consumes everything above.

- [ ] **Step 1: Write the failing fixture tests.** Next `/feedback`: the raw HTML contains a server-rendered `Alert`, `Spinner`, and `Divider`, plus `Progress`, an `Avatar` whose `img` is in the HTML, and a `Drawer` trigger. The drawer opens. There are no hydration warnings (reuse `color-mode.spec.ts`'s console check). Vite: an `Alert` and a `Drawer` render with styles. Run `npm run test:fixtures`. Expected: fail, because the page is missing.
- [ ] **Step 2: Add the page** until it passes.
- [ ] **Step 3: Overview page and docs.** Add `Feedback.stories.tsx` to `overviewPages.test.ts`'s no-`style`/`className` list. Add the six components to `docs/components.md`.
- [ ] **Step 4: Audit** (v0.4.1 resolved thread 3; rerun it for the handoff). Run `npm audit --json` and `npm view typescript-eslint version`. If a fixed `typescript-eslint` exists, upgrade it in this step and rerun `npm run lint`. Record the advisory count, severities, and versions for the handoff either way. If any advisory is in a runtime dependency or is `high`, stop and raise it.
- [ ] **Step 5: Acceptance.** Walk Spec 16's acceptance criteria and test lists, recording each item as passed (with its test name) or needing the owner. Run `npm ci && npm run check`. Expected: exit 0, every project ran, and no warnings.
- [ ] **Step 6: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the merge box. Don't close and reopen the PR. Expected: all CI jobs pass.
- [ ] **Step 7: Manual checks for the owner, in the PR body, not marked done:**
  - Screen reader passes on all six components.
  - Forced colors on all six.
  - Swiping a `Drawer` closed from each side on a real phone, and a bottom `Drawer` with an input and the on-screen keyboard.
- [ ] **Step 8: Release notes draft in the PR body,** for `npm run release -- minor`:
  - "Breaking changes": the new required theme tokens from Task 1, `color.{bg,fg}.avatar.{1-6}`. A project with its own full theme must add them, with the Soft values listed. (The size tokens shipped in v0.1.)
  - "New components": the six.
  - "Changes": Button's `loading` uses `Spinner`, which is internal only.
- [ ] **Step 9: Update `docs/HANDOFF.md` through the `handoff` skill,** as a reconciliation:
  - Threads 3 (rerun) and 4–7 carry forward with their triggers, plus anything v0.4.1 carried.
  - The next steps become the owner's manual checks, the merge, `npm run release -- minor`, and then the v0.6 plan.

  Commit `v0.5 acceptance and handoff`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks, merging, and releasing v0.5.0.
