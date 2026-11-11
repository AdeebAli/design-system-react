# Handoff: design-system-react

- **Date:** 2026-11-11

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** v0.1 (specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), each merged and released. v0.3.0 is `c0eb2a7`, with Storybook at https://adeebali.github.io/design-system-react/.
- **Built, in draft PR #24:** milestone v0.4, Spec 12 Overlays and Spec 13 Data, as Spec 00 sets it. The owner chose both specs over the old handoff's "Spec 12 only".
  - Where: branch `feat/v0.4-overlays-and-data` on `main` (`822d742`), pushed; draft PR https://github.com/AdeebAli/design-system-react/pull/24. The baselines workflow committed `15d3003`.
  - Plan: `docs/superpowers/plans/2026-11-10-v0-4-overlays-and-data.md`.
  - What it adds:
    - Overlays: `Dialog` (with `alert`), `Popover`, `Tooltip`/`TooltipProvider`, `Menu` (with submenus), and `Toast` (`ToastProvider`, `useToast`, `createToastManager`, `toast.promise`).
    - Data: `Table` and its parts, `DataTable`, `Pagination`, `Skeleton` and `EmptyState`.
    - The "Overlays" and "Data" overview pages, and Next/Vite fixture pages.
  - It ran with subagent-driven development. Every task had a spec and quality review, and a whole-branch review on Opus was followed by one fix wave and its re-review.
- **Waiting on the owner:** a fresh baselines run (the sticky first column changed), reviewing the screenshots, selecting **Approve workflows to run** on PR #24, and the manual checks. The owner's decisions on the three departures are built (`b949c17`, `32b5818`).

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
- **Visual baselines (carried from v0.2).** The workflow runs when the `update-baselines` label is added, with `--update-snapshots=changed`. After it commits to a PR, GitHub holds CI until the owner selects **Approve workflows to run**. Don't close and reopen the PR.

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

- Branch `feat/v0.4-overlays-and-data`: 45 commits, 156 files, +13,409/−24. The working tree is clean.
- New component folders under `src/components/`:
  - overlays: `Dialog`, `Popover`, `Tooltip`, `Menu`, `Toast`;
  - data: `Table`, `DataTable`, `Pagination`, `Skeleton`, `EmptyState`;
  - shared internals: `overlays/`.
- New overview pages: `Overlays.stories.tsx`, `Data.stories.tsx`, and `Overlays.browser.test.tsx`.
- New internal icons: `X`, `ChevronRight`, `ChevronLeft`, `ArrowUpDown`, `CircleCheck`, `CircleAlert`, `TriangleAlert`, `Info`.
- Changed: `ColorModeToggle` now accepts `ref`, `style` and button props, and composes your `onClick`.
- v0.3 minors fixed in `529457d`:
  - the Tabs `Indicator` under RTL;
  - `onValueChange(null)` no longer reaches the callback;
  - `client-modules.mjs` now detects namespace and default-plus-named imports;
  - `Prose` `kbd` uses a logical border;
  - docs note: `Prose` inside `NotProse` is unstyled.
- Config and scripts: `vite.config.ts` pre-bundles the new Base UI subpaths. `scripts/verify-dist.mjs` lists the server modules for Table, Pagination, Skeleton and EmptyState.
- Fixtures: `fixtures/next-app/app/(site)/{overlays,data}/`, `CustomersTable.tsx`, and `tests/fixtures/{overlays,data}.spec.ts`.
- Docs: new `docs/components.md` lists every exported component, grouped by spec, with a link to each spec. The README's "Components" section links to it (owner's call, replacing the partial "Overlays and data" table).
- `15d3003`: 264 new visual baselines from the workflow. No existing baseline changed.

## Verification

- **Checks on `f54334a`:** `npm ci && npm run check` exited 0.
  - Unit: 746 tests.
  - Stories and browser: 730 tests, with axe in both modes.
  - Fixtures: 64 passed, 22 skipped by design.
- **Checks on `0d6e742`, after the fix wave:** typecheck, lint, format:check, `npm test` (752 + 22 script tests), `test:stories` (749), build with verify-dist, and `test:fixtures` (64 passed, 22 skipped) all exited 0, as the fix report states. The only warning is Node's existing DEP0205.
- **Checks on `32b5818`, after the owner's decisions:** typecheck, lint, format:check, `npm test` (754), `test:stories` (751), build with verify-dist, and `test:fixtures` (64 passed, 22 skipped) all exited 0. The new sticky-width tests failed first (column 274–323px instead of 192px), and the StrictMode toast test fails without the grace.
- **Baselines:** the workflow (run 43108613699) passed 882 screenshot tests and committed `15d3003`.
- **Tests were seen failing.** Each new test failed before its fix, or failed when the code was broken on purpose. The evidence is in the per-task reports in the local `.superpowers/sdd/` folder.
- **Not verified:**
  - CI on the current head. The first run (`66711ee`, run 43108512040) passed static, unit and both package jobs; `stories` failed one test (open thread 7). CI on later commits waits for the owner to approve workflows. Trigger: next step 1.
  - The manual checks. Trigger: next step 2, and the PR checklist.
  - Installing 0.3.0 from GitHub Packages, carried forward. `gh` lacks `read:packages`. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **A TanStack v9 recipe.** The `DataTable` recipe targets TanStack Table v8 (8.21.3); npm's 9.x has no `useReactTable`. Trigger: the v0.5 plan must check v9's API against the registry and decide whether to switch or add a v9 recipe.
2. **RTL arrow keys and positioning in v0.3 widgets.** Base UI's composite root and Select read direction from React context, so `Tabs`, `RadioGroup`, `ToggleChipGroup` and `Select` (keys, and probably `Select`'s `side` positioning) likely behave as LTR under `dir="rtl"`. This isn't fixed, because it's v0.3 code you didn't ask to change. The fix is the shared `overlays/direction.tsx` provider. Trigger: the v0.5 plan must add an RTL keyboard and positioning test for each and decide the fix.
3. **11 moderate `npm audit` advisories, dev tooling only (`glob` and `minimatch` through `typescript-eslint`).** As of 2026-11-11, 8.72.2 is the latest and is still in the affected range, and 8.72.1 is installed. Triggers: CI fails if an advisory reaches runtime dependencies or rises to high; the v0.5 plan must rerun `npm audit` and upgrade once a fix exists. (Carried forward.)
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings from v0.4.** The final review found none blocking. Trigger: none; pick from this list when convenient.
   - Dialog: the close button scrolls out of view in tall content (`Dialog.css.ts`); the `closeOnOutsideClick` + `alert` warning fires while closed; `React.*` types used without an import in `DialogTitle`/`DialogDescription`; an unexplained `- 1` in the full-width browser test.
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
7. **Timing-sensitive browser tests.** Toast swipe in LTR (`src/components/Toast/Toast.browser.test.tsx:177-196`). On run 43108512040, `in ltr a bottom-end toast is swiped away toward the right edge only` timed out: the toast was still there after 3s. It passed 5 of 5 times alone and in 2 full `npm run test:stories` runs locally, so it looks timing-dependent on the CI runner, after the RTL case and a 600ms pause. Also, `Table.browser.test.tsx` "scrollable scrolls by keyboard" (line 151) failed once in three local full runs (`scrollLeft` stayed 0) and passed otherwise; it predates the sticky change. Neither is diagnosed. Trigger: the CI run after the owner approves workflows; if either fails again, find the cause before merge.

Resolved since the last note:
- Old thread 1, the owner's decisions: sticky column (a) built in `b949c17`; the toast queue drops after unmount and Tooltip `delay={0}` is documented in `32b5818`, with Specs 12 and 13 amended; README resolved below; the TanStack v9 recipe is now thread 1 with a v0.5 trigger.
- The README list: the owner chose a full list in a separate doc (`docs/components.md`).
- Old next step 1, push and draft PR: done (PR #24), and the baselines are committed (`15d3003`).
- Old thread 1, the deferred v0.3 minors: fixed in `529457d` with tests, except that a bare default React import is still undetected (now thread 6).
- Old thread 3, `ColorModeToggle` props: fixed in `e36012e` and `6cc0515`, including a test that wraps it in a `Tooltip` and a test with a forced `ThemeProvider`.
- Old next step 1, writing the v0.4 plan: written (`f9b3cfe`) and executed. Old thread 2's audit rerun ran (thread 3).

## Next steps

1. **On PR #24:** remove and re-add the `update-baselines` label (the sticky first column changed), review the updated screenshots, then select **Approve workflows to run**. Expected: all CI jobs pass; if a timing-sensitive test fails again, fix it first (open thread 7).
2. **Manual checks** (the owner):
   - a screen reader pass on each overlay, on tables, sorting and selection, and on danger toasts reached with `F6`;
   - forced colors on all ten components, including the Popover arrow;
   - Dialog scroll lock with classic scrollbars, checking for no layout shift;
   - the sticky first column's fixed width in Firefox and Safari, with a long row header;
   - Tooltip touch with `delay={0}`.
3. Squash-merge, then run `npm run release -- minor` for v0.4.0, and edit the release notes.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.4 (Spec 12 Overlays and Spec 13 Data) is in draft PR #24 with baselines committed. The owner's decisions are built. Rerun baselines, check CI once the owner approves workflows (open thread 7 if a timing-sensitive test fails), then the merge and the v0.4.0 release.
