# Handoff: design-system-react

- **Date:** 2026-11-12

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done and released:** v0.1 (specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), v0.4 (Specs 12–13), and v0.4.1 (tag `v0.4.1`, `a67ef89`). Storybook is at https://adeebali.github.io/design-system-react/.
- **v0.5 built, not merged:** all 9 tasks of `docs/superpowers/plans/2026-11-11-v0-5-feedback-and-display.md` (Spec 16: `Alert`, `Spinner`, `Progress`, `Avatar`, `Divider`, `Drawer`) are committed on `feat/v0.5-feedback-and-display`, opened as a draft PR. `npm ci && npm run check` passes.
- **Waiting on:** the final Opus whole-branch review, the visual baselines run, the owner's manual checks, then merge and `npm run release -- minor`.
- **Planned, not started,** each after the previous release: v0.6 (`docs/superpowers/plans/2026-11-11-v0-6-advanced-inputs.md`, Spec 14) and v0.7 (`docs/superpowers/plans/2026-11-11-v0-7-app-navigation.md`, Spec 15).

## Decisions

Architecture decisions are in `docs/adr/`. Every v0.4 build ruling is listed under "v0.4 rulings" below, and the deferred minor findings under open thread 6. The per-task reports stay in the local, gitignored `.superpowers/sdd/2026-11-10-v0-4-overlays-and-data/`. The v0.4 decisions worth knowing first:

- **Text direction for Base UI comes from the document root.**
  - Base UI reads direction from React's `DirectionContext` (default `ltr`), not the DOM `dir`, for arrow keys, `side` start and end, and submenus.
  - `src/components/overlays/direction.tsx` provides it from `document.documentElement`, through a shared `MutationObserver`, and `Menu`, `Popover` and `Tooltip` use it.
  - A `dir` on a subtree isn't followed. The popups are portaled to `body`, so the root governs them anyway.
- **The popup gap is read at runtime.** `gapOffset` is `() => number` and reads the `space.1.5` variable from the root. Base UI 1.9.0's offset function gets only sizes, never the element. A theme override of `space.1.5` moves the gap.
- **`createToastManager` queues calls until a `ToastProvider` first connects** (owner's decision; Spec 12 amended).
  - Base UI subscribes in an effect that runs after children's effects. Without the queue, a toast added in a page's mount effect was lost.
  - Once a provider has connected, calls made while it's unmounted are dropped, with a development warning on `add`, so a stale toast can't reappear. An unmount and remount within one task, such as StrictMode's, keeps the queue (a `setTimeout` grace). Rejected: replaying after any remount (stale toasts), and a size cap.
  - Toasts follow these rules:
    - The provider's `duration` goes to Base UI's `timeout`.
    - `update` derives the timeout from the toast's merged tone, action and duration.
    - If `toast.promise`'s `success` function throws, the toast settles as the error state.
- **The danger toast root keeps Base UI's `aria-hidden` until focused.** It's announced through Base UI's hidden `role="alert"`. Screen reader users reach it with `F6`, which the docs say. Rejected: `aria-hidden={false}` on the root, which risked a double announcement.
- **Open-menu stories turn off only axe `aria-hidden-focus`.** Base UI's focus-guard spans trip it. Popover and Dialog pass only because axe treats any visible `role="dialog"` as modal.
- **The `DataTable` selected count is one `role="status"` element** that shows the count from the first render. Rejected: a visible `aria-hidden` count plus an empty live region, which hid the count from screen reader users.
- **`DataTable` paging survives bad input.**
  - `NaN`/`Infinity` values for `totalRows`, `pageSize` and `page` are handled, after a security review found a set-state loop and a negative-slice bug.
  - An invalid `locale` falls back to the default collator, with a warning.
  - Mixed number and string columns put numbers first in both directions, and `NaN` sorts like `null`.
  - Clicks inside popups portaled from a cell don't toggle the row.
- **The sticky first column has a fixed width** (owner's decision, option (a); Spec 13 amended): half of `size.dialog.sm` (12rem in Soft), with `overflow-wrap: anywhere`, so the `scroll-padding` reserve always covers it and a focused cell is never hidden (WCAG 2.4.11). Chrome ignores `max-width` on cells, so `width` + `min-width` + `border-box` set it; each is mutation-checked. Rejected: (b) measuring the column, since a measured column can be wider than the scroll area and still hide focus (shown in a throwaway demo: 608px column in a 360px area); (c) accepting the limit, which fails 2.4.11.
- **`Tooltip` `delay={0}` can flash for one frame on a touch tap** (owner accepted; Spec 12 and the Tooltip docs say so).
- **Skeleton rows aren't capped.** Spec 13 says loading shows `pageSize` rows.
- **The TanStack recipe targets v8 (8.21.3).** npm's `latest` is 9.x, which has no `useReactTable`. It was checked against the real package, and no dependency was added.
- **Rows a first-column `rowSpan` covers are marked with `TableRow`'s `spanned`** (owner's choice, Spec 13 amended, `d219774`). The spanning cell sticks; marked rows' first cells don't. It replaced a CSS `:has()` version (`e59510c`, the owner's first choice) after a second review and measurement showed it made reordering a 2,000-row sticky table about ten times slower (146ms against 15ms), capped spans at 10 rows, and un-stuck later row headers when a covered row had its own second-column span. Rejected: going back to documenting the limit, and keeping the `:has()` version with its costs documented.
- **Toast text stays selectable** (owner's call). With a mouse, dragging from selected toast text drags the text instead of swiping; making it unselectable would stop people copying an error message. Spec 12 defines swipe for touch, which doesn't select text.
- **Visual baselines (carried from v0.2).** The workflow runs when the `update-baselines` label is added, with `--update-snapshots=changed`. After it commits to a PR, GitHub holds CI until the owner selects **Approve workflows to run**. Don't close and reopen the PR.

### v0.5 planning decisions (owner, 2026-11-11)

- **v0.5 is split into v0.4.1, v0.5, v0.6, and v0.7** (the owner's choice; 21 tasks were too many for one plan). Spec 16 goes first, because `FileUpload` needs `Progress` and `Sidebar` needs `Drawer`. Spec 00's milestone table and Specs 14–16's `Milestone` lines are amended in v0.4.1's first commit.
  - Rejected: 4 PRs with one v0.5.0 release, and 3 releases with the threads folded into v0.5.
- **Thread 1:** a TanStack v9 recipe (`useTable` + `tableFeatures`, read from the 9.3.1 package itself) as a typechecked `TanStackRecipe.example.tsx`, with `@tanstack/react-table@9.3.1` as a devDependency only.
  - Rejected: a docs-only v9 recipe (it can drift again), and keeping v8 alongside v9.
- **Thread 2:** add an RTL test for `Tabs`, `RadioGroup`, `ToggleChipGroup`, and `Select`, and wrap each one whose test fails in `OverlayDirection`.
  - Rejected: tests and docs only.
- **Thread 8:** only a one-row `TableHead` sticks (`thead > tr:only-child > *`), and a multi-row header scrolls normally. Spec 13 is amended.
  - Rejected: making the whole `thead` sticky, which needs a new `headerRows` prop to keep focus clear (WCAG 2.4.11); documenting only.
- **Thread 9:** document (a) the selected bar on a `spanned` row scrolling under the sticky spanning cell, and (b) the spanning cell following only its own row's hover and selection. Spec 13 is amended. (c) `scope="row"` with `rowSpan` is kept as correct HTML.
  - Rejected: a new `selected` prop on cells.
- **All new theme tokens ship in v0.5** (`size.sidebar`, `size.sidebarRail`, `size.avatar.*`, `size.drawer.*`, `color.{bg,fg}.avatar.{1-6}`), so custom full themes break once. v0.5.0's notes need a "Breaking changes" section. This was my call, listed in the v0.5 plan's departures, and the owner can still move the `Sidebar` tokens to v0.7.
- **Facts checked while planning (2026-11-11):**
  - `@base-ui/react` 1.9.0 is still the latest, and it has every part and prop Specs 14–16 name (including `Combobox` `filteredItems`/`createItems`, `Drawer` `swipeDirection`/`VirtualKeyboardProvider`, `Avatar.Image` `keepMounted`, `Accordion` `hiddenUntilFound`).
  - `@tanstack/react-table` latest is 9.3.1.
  - `npm audit`: still 11 moderate, all dev-only.

### v0.5 decisions and rulings (2026-11-12)

The ledger, with every break-check line, is `.superpowers/sdd/2026-11-12-v0-5-feedback-and-display/progress.md` (local, gitignored).

- **Execution was hybrid** (owner): Tasks 1–6 and 9 inline; Tasks 7–8 (Drawer) by a fresh Sonnet implementer each, each followed by a fresh read-only Sonnet reviewer; a final Opus whole-branch review before merge. Task 8's implementer ran about 10 hours, mostly break-checks; nobody checked on it while it ran. Next time, look in on a long agent.
- **Release notes stay manual** (owner: "manual was fine"). PR #28 (`--notes-file` for the release script) was closed unmerged. After each release, apply the PR body's draft with `gh release edit`.
- **Box's `background` and `color` don't take the avatar pairs** (owner; Spec 04 amended). Rejected: exposing them on every Box.
- **Avatar status shapes** (owner, asked when found; Spec 16 amended): Spec 16 gave `away` and `offline` the same ring, against its own "own shape" rule. `away` is a ring with its lower half filled; `offline` is a hollow ring. Rejected: a crescent for `away`.
- **The new theme tokens are only `color.{bg,fg}.avatar.{1-6}`.** The size tokens the plan listed already shipped in v0.1; the plan was corrected.
- **The labeled `Divider` keeps Spec 16's markup,** though Chrome's accessibility tree gives the separator no name and treats "or" as a child. The owner's screen reader check decides whether it changes.
- **A tall bottom sheet shrinks by the keyboard's height** (`maxBlockSize: calc(85dvh - var(--drawer-keyboard-inset, 0rem) + bleed)`), found by Task 8's review: lifted by a 300px keyboard, its top was at −180px. The fallback needs a unit, since a unitless `0` makes the `calc()` invalid.
- **Rulings where the spec is silent** (cost if wrong):
  - `Avatar`: initials uppercased with `toUpperCase`, not the host's locale, so server and client agree (the final review found a Turkish-locale hydration mismatch); dot sizes 6/8/12/16px with rings a quarter of the dot; busy bar in `fg.onStatus`; forced colors draws dots in `CanvasText`. `initials` and the color hash are internal. Cost: a token or constant each.
  - `Drawer`: bleed `space.12` and exit offset width plus `space.8` (a theme with a larger shadow shows a sliver while closing); a `drawer-no-close` warning, as Dialog has; direction is read when the drawer opens, not tracked while open; `toSwipeDirection` isn't exported.
  - Bottom sheet: below `md` (48rem) it fills the width, so between 44rem (`size.dialog.lg`) and 48rem it's wider than 44rem. That's Spec 16 read literally; dropping one media query changes it. The handle is `space.10` by `space.1` in `border.control`. `--drawer-keyboard-inset` is applied as `inset-block-end` (Base UI supplies no styles).
  - The Next.js fixture test doesn't press Escape: a server page can't break that step alone, so it couldn't be seen failing. Escape is covered in `Drawer.browser.test.tsx`.

### v0.4.1 decisions and rulings

Made during the v0.4.1 build where the plan or spec was silent or wrong, each with what it costs if wrong. The ledger is `.superpowers/sdd/2026-11-11-v0-4-1-open-threads/progress.md` (local, gitignored).

1. **`Select` has no RTL bug, so it wasn't changed.** Its popup is centered on the trigger (Base UI's default `align`, with `alignItemWithTrigger={false}`), and Base UI reads direction only in the align-with-trigger path. The plan's test ("aligns to the trigger inline-start edge") assumed start alignment and failed in LTR too. It became "the popup centers on the trigger in RTL as in LTR". Cost: if the owner wants `Select` start-aligned, that's a visible change Spec 09 doesn't ask for.
2. `RadioGroup` and `ToggleChipGroup` got new `*.browser.test.tsx` files. Each RTL test also checks `ArrowRight` in LTR. Cost: none.
3. The two-row header test measures the sticky cells, not the `tr`: a `tr`'s box scrolls even when its cells stick, so measuring it passed vacuously. Cost: none.
4. The sticky corner selector drops the `spanned` exclusion, since an only row can't be covered by a span. Breaking the selector fails both corner tests. Cost: none.
5. Group header cells use the default `scope="col"`. `TableHeader` doesn't allow `scope="colgroup"`, and adding it would be an API change nobody asked for. Cost: group headers are announced as columns, not column groups.
6. The `TanStackRecipe` story renders the example file itself and checks that it really sorts (ascending second row, descending first row); this replaced the hand-built demo. The shown source swaps `'../Table'` for `'@adeebali/design-system-react'`. Cost: the file and the docs differ by one import path.
7. `npm ci` failed on Task 3's lockfile because the install ran without `nvm use` (npm 11.6.2 instead of 11.20.0), which dropped the optional `@emnapi/core` and `@emnapi/runtime` entries. It was regenerated under `.nvmrc`'s Node (`42c151f`). Cost: none.
8. The final review's Minor 2 (the ascending-sort assertion couldn't fail) was re-graded and fixed (`f9f79c2`), per the owner's rule that an assertion must be able to fail. Cost: one commit.
9. Set aside from the review: a `thead` with a hidden extra `tr` won't stick (a safe fallback); a two-row header combined with `stickyFirstColumn` and a header `rowSpan` sticks the second row's first cell unless it's marked `spanned` (this predates the branch); a `dir` on a subtree isn't followed (by design). Cost: those cases behave as described.

### v0.4 rulings

Calls made during the build where the spec was silent, each with what it costs if wrong. Superseded ones are marked.

1. Built on a branch in the main checkout, not a worktree, as in v0.1–v0.3. Cost: none.
2. `toast.promise`'s `loading` also accepts a no-argument function. Cost: a slightly wider type.
3. `gapOffset` reads `--ds-space-1_5` from the document root; Base UI 1.9.0's offset function gets only sizes. Cost: a theme scoped to a subtree doesn't move the gap.
4. Dialog scroll lock is tested by a stand-in (no position change, wheel doesn't scroll); the headless runner hides scrollbars. The no-layout-shift check is manual. Cost: a regression could ship until that check.
5. `DialogContext` is `{alert, register, has}`, not the plan's shape, as lint forced. Cost: none outside Dialog.
6. A long `DialogTitle` running under the close button was fixed instead of deferred. Cost: one fix round.
7. Dialog's warning-text assertions and type-test mutation checks were folded into that round. Cost: one round.
8. Tooltip uses logical `maxInlineSize`; a stale border comment was fixed and a hover mutation check added. Cost: one round.
9. `ColorModeToggle` sets its own icon, name and variant after the passed props, with a type assertion and a mutation-checked `preventDefault` test. Cost: one round.
10. `Tooltip` `delay={0}` flashes for one frame on touch; accepted as Base UI behavior; the owner accepted it and it is documented. Cost: the flash, for anyone who sets `delay={0}`.
11. The v0.3 RTL keyboard bug isn't fixed in v0.4 (open thread 2). Cost: those widgets keep it until v0.5.
12. `Menu` takes direction from the document root, not a subtree. Cost: a subtree `dir` is ignored.
13. The provider's toast duration goes to Base UI's `timeout`, since Base UI starts timers in `addToast`. Cost: none.
14. The danger toast root keeps Base UI's `aria-hidden`; its stories disable only axe `aria-hidden-focus`. Cost: screen reader users reach it with `F6`; the manual check covers it.
15. Toast browser tests moved to the `toast.promise` task. Cost: none.
16. `update(id, {tone})` recomputes the timeout; moved forward a task. Cost: none.
17. *Superseded by 35:* toasts added before the provider mounts are dropped.
18. `update` derives the timeout from the toast's merged state. Cost: none.
19. A loading toast keeps its spinner on a title-only update, and a throwing state function no longer leaves it stuck. Cost: one round.
20. If `success` throws, the toast settles as the error state. Cost: the `error` function may receive a non-promise error.
21. Table's vacuous wrapper test, missing `hoverable`/`size` tests, and the double-border check were carried into the sticky Table task. Cost: none.
22. The plan's `stickyCell` class was superseded by data attributes on `table`. Cost: none.
23. Implementers stopped running concurrently on shared files after Skeleton's export edits were lost. Cost: time.
24. Skeleton's vacuous width test, a `lines` NaN guard, and removing unrequested `flexShrink`/`minWidth` were folded into a fix. Cost: one round.
25. *Supersedes a first-column width cap that never worked:* keep a token-derived `scroll-padding-inline-start` reserve and document the limit. *Superseded by the owner's option (a), a fixed column width.*
26. `DataTable` sets `aria-busy` on its outer element, not Table's wrapper. Cost: a Table wrapper-props hook if "wrapper" is read literally.
27. Mixed number and string columns sort numbers first in both directions. Cost: the owner may prefer another order.
28. Three of the four security-review findings were fixed (`NaN` totals, negative page slice, invalid locale). Skeleton rows aren't capped: Spec 13 says `pageSize` rows. Cost: a huge `pageSize` renders that many rows.
29. `NaN` sorts like `null`, last in both directions. Cost: none.
30. Rejected the split selection count; one `role="status"` shows the count from first render. Cost: one round.
31. `NaN`-as-`null` counts as an extension where Spec 13 is silent, not a departure. Cost: none.
32. Task 17 stopped before the push; the controller wrote the handoff. Cost: CI came later.
33. *Superseded by the owner's README decision:* keep the partial "Overlays and data" README section.
34. Popover and Tooltip use the shared direction provider (Spec 12 requires `start`/`end` to follow direction); v0.3 widgets stay out of scope. Cost: open thread 2.
35. *Supersedes 17:* the toast manager queues calls until `ToastProvider` connects. *Narrowed by the owner's decision: dropped after the provider has connected and gone.*
36. The TanStack recipe targets v8, checked against the registry tarball, with no new devDependency. Cost: the recipe isn't typechecked in CI.
37. The local workspace (task reports) is kept, not deleted. Cost: local disk.

## Changes

**v0.5, branch `feat/v0.5-feedback-and-display`** (11 commits on `main` at `f902386`):
- `0f0d1c2` avatar color tokens (themes, contrast, Box types, Colors docs, Specs 02 and 04); `b1a6dbb` `Spinner`, used by `Button`; `0a12eb1` `Alert` (server component, client `AlertDismiss`); `7b28ae4` `Divider`; `9d47a9f` `Progress`, plus `src/baseUiDeps.test.ts` (every Base UI entry in `vite.config.ts` `optimizeDeps`); `e1d4287` `Avatar` (Spec 16 amended); `633b159` `Drawer`; `51e50f6` the bottom sheet; `7fde5db` its keyboard fix and test renames from the Task 8 review; `da3de1e` the `Overview/Feedback` page, the Next.js `/feedback` page, Vite fixture additions, `tests/fixtures/feedback.spec.ts`, and `docs/components.md`; `329e66d` a lint fix.
- `scripts/verify-dist.mjs` checks `Spinner`, `Alert`, and `Divider` have no `"use client"`, and `AlertDismiss` has it.
- This note, in the same PR.

The v0.4.1 release and build details are in `git show f902386:docs/HANDOFF.md`.

## Verification

- `npm ci && npm run check` on `da3de1e` plus the lint fix in `329e66d`, under `.nvmrc`'s Node: exit 0. Unit 881/881 with type tests, script tests 22/22, stories and browser 949/949 (axe in both modes), `verify-dist: ok`, fixtures 67 passed and 25 skipped (tests scoped to one app). The only warnings are the known tooling deprecations (`eslint@9.39.5`, Node `module.register()`) and npm's install-scripts notice.
- Every new assertion was seen failing on its own line, or deleted when it couldn't fail; the ledger lists each one. The fixture tests failed first without the pages; each HTML assertion was checked against the real `/feedback` HTML with its target removed.
- `npm audit` (thread 3 rerun): 11 moderate, 0 high, 0 critical, all dev-only (minimatch via api-extractor and `typescript-eslint`, glob via Storybook). Same as v0.4.1. `typescript-eslint` 8.72.2, the latest, is still in the advisory range, so it wasn't upgraded.
- **Independent review:** fresh read-only Sonnet reviewers covered `633b159` (Task 7) and `51e50f6` (Task 8). The final Opus whole-branch review covered everything up to `706a127`: ready after fixes, 0 Critical, 2 Important, 5 Minor, all fixed in the next commit, each with a test seen failing:
  - `Avatar`'s fallback painted over the server-rendered image before hydration; the fallback now comes first in the DOM, and a test checks the image is on top of server HTML that isn't hydrated.
  - `debug-storybook.log` had been committed in `0f0d1c2`; removed and ignored.
  - `Progress`: the radius test asserts `radius.full` (9999px), and a new test covers the RTL indeterminate animation.
  - `initials` no longer depends on the host's locale.
  - `Alert` renders no empty wrapper for `false` or `''`.
  - `Divider`'s `ref` is `Ref<HTMLElement>`, since it's an `hr` by default; ref forwarding is tested for each kind.
- A fresh read-only Sonnet reviewer covered that fix commit, `79931e8`: ready, with three nits recorded under thread 6. The review covers all code up to `79931e8`; later commits are docs only.

**Not verified:**

- The owner's manual checks (screen reader on all six, including the labeled `Divider`; forced colors; swiping a `Drawer` closed on a real phone; a bottom `Drawer` with the on-screen keyboard). Trigger: the checklist in the v0.5 PR body, before merge.
- CI and visual baselines for the branch. Trigger: the draft PR with the `update-baselines` label; the owner selects **Approve workflows to run** after the baselines commit.
- "A failed image shows initials after hydration" (Spec 16) is tested with a client render, not a hydrated page. Trigger: none; the owner can ask for a fixture test.
- Installing 0.4.x from GitHub Packages. Trigger: none; the v0.1 install proved the pipeline. (Carried forward.)
- The v0.6 and v0.7 plans haven't had an independent review. Trigger: none before their builds; each branch gets a whole-branch review before merge. (Carried forward.)

## Open threads

4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings from v0.4, plus Drawer.** Trigger: none; pick from this list when convenient. (Carried forward, with Drawer added.)
   - Dialog and Drawer: the close button scrolls out of view in tall content (`Dialog.css.ts`, `Drawer.css.ts`); Drawer matches Dialog on purpose. Dialog: the `closeOnOutsideClick` + `alert` warning fires while closed; `React.*` types used without an import in `DialogTitle`/`DialogDescription`; an unexplained `- 1` in the full-width browser test.
   - From the review of `79931e8`: before hydration, an avatar image with transparent areas shows the initials through them (opaque photos are fine); `Alert`'s `hasContent` lets `true` and `[]` through, rendering an empty part; `Divider`'s `Ref<HTMLElement>` also accepts a `RefObject<HTMLDivElement>`, which then holds an `hr`.
   - Drawer: the bottom sheet keeps its safe-area padding while the keyboard is up (up to about 34px extra on an iPhone); the provider test waits a fixed 300ms before asserting the variable is absent on a side panel.
   - Popover: arrow offsets use physical `left`/`right`; the rotated arrow shadow's direction; the shadow clip uses `space.12`; weak tests (`lastMessage` reads `calls[0]`, layout props, no `aria-labelledby` test); a redundant `Omit<children>` in `PopoverTitle`.
   - Overlay foundations: the `gapOffset` comment should say a subtree theme isn't followed; RTL and non-bottom popup motion is untested; non-null assertions on the `var()` regex.
   - Tooltip: the provider test's 700ms timeout is close to the 600ms default.
   - Menu: the `control.sm` term in `Menu.css.ts` is a no-op under Soft; `MenuLinkItem` `startIcon`/`disabled` untested; a value cast in `MenuRadioGroup`; the direction cache can miss a `dir` change between render and first subscribe.
   - Toast: stories lacked tones and positions (since added); a weak action-close-order test; no browser test of an action toast timing out with a duration.
   - Table: `TableSortHeader` `as` is typed only for `href`; caption padding uses the two-value form; the Menu-above-sticky test doesn't isolate `isolation`; the `stickyBackground` class is emitted on every table; the partial-cover test asserts only "not fully covered".
   - Pagination: a local `page` class duplicates ButtonBase's `square`; overrides win by import order; 4-digit page numbers sit flush; weak `pageRange` tests.
   - EmptyState and Skeleton: tests compare class names only; `gap="3"` isn't in the spec.
   - DataTable: `pageSize <= 0` unguarded; an uncommented uncontrolled clamp; test gaps (`defaultPage`, skeleton count with `totalRows`); the routing test doesn't check inline `maxHeight`; a wrapped two-line row header is about 3px shorter than in `Table`; `aria-labelledby` ignores a title in cell content; the interactive-content warning checks only at mount.
   - Earlier tasks: a vacuous null-assertion loop in `Tabs.test.tsx`; `client-modules.mjs` misses a bare `import React from 'react'` used as `React.useState`; a `ColorModeToggle` forced-theme test that does little.
   - Fixtures: the Vite Table style check sits in `overlays.spec.ts`; no fixture test triggers a toast; the fixture sort link doesn't sort.
7. **One intermittent browser test, not diagnosed.**
   - `Table.browser.test.tsx` "scrollable scrolls by keyboard" (line 151) failed once in three local full runs (`scrollLeft` stayed 0) and passed otherwise. It predates the sticky change. In the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) it passed 5 of 5 runs of `Table.browser.test.tsx` alone and 2 full `test:stories` runs, and it passed on CI run 43127830011. Its one failure was on macOS under full-suite load. It failed again locally on `d219774`, and an instrumented copy caught one failure in three full runs: `ArrowRight` scrolled 40px, then `ArrowDown` reached the focused wrapper, wasn't prevented, with the page focused and visible, yet `scrollTop` stayed 0 for 2.5s. Ruled out: `ArrowDown` arriving during the `ArrowRight` scroll animation (pressing both back to back scrolls both).
   - It isn't explained by the v0.4.1 touch-emulation fix (`ce5a5f1`): that taint happens only on Linux, and this test's failures were on macOS. It passed in the v0.4.1 release's local `npm run check` and on CI for `803580d` and `337db60`. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. Nothing forces a diagnosis while it keeps passing.
10. **v0.6 and v0.7 execution method.** v0.5 was hybrid. Trigger: the start of each plan's build session. (Carried forward, narrowed.)
11. **A deferred minor finding from v0.4.1's final review.** A two-row header still gets the sticky-header `scroll-padding-block-start` (`stickyHeaderPad`, `src/components/Table/Table.css.ts:44`), so a focused cell stops about one header row below the top while nothing sticks. Nothing is hidden. Trigger: none; pick it up when convenient. (Carried forward; the other two minors were resolved in `b8ac114`.)

Resolved this session:
- Thread 12, release notes: the owner keeps editing them by hand; PR #28 closed unmerged.
- Thread 10 for v0.5: hybrid (see v0.5 decisions).
- Thread 3 rerun: audit unchanged (see Verification).
- Old unverified item, CI on the `a67ef89` push: CI on PR #27 (run 43176892793), which ran on top of it, passed.
- Old next steps 1 and 2: the owner chose (thread 10, thread 12), and v0.5 is built.

Resolved lists from earlier notes stay readable in `git show f902386:docs/HANDOFF.md` and `git show 5eda67e:docs/HANDOFF.md`.

## Next steps

1. Confirm CI passes on the PR head. The baselines (`89b1498`) are committed and reviewed by eye.
2. If GitHub holds CI after a bot commit, the owner selects **Approve workflows to run**.
3. The owner does the manual checks in the PR body.
4. Mark the PR ready, squash merge, then `npm run release -- minor` and apply the PR body's release notes with `gh release edit v0.5.0`.
5. Update this note after the release, then start v0.6.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.5 is built on `feat/v0.5-feedback-and-display` with a draft PR open. The final review and its fixes are done and reviewed. Check CI on the PR head. Then ask me about the manual checks before merge and the v0.5.0 release.
