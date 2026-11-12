# Handoff: design-system-react

- **Date:** 2026-11-11

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** v0.1 (specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), v0.4 (Spec 12 Overlays, Spec 13 Data), and v0.4.1 (open threads 1, 2, 3, 8, 9), each merged and released, with Storybook at https://adeebali.github.io/design-system-react/.
- **v0.4.1 released:** PR #26 squash merged as `337db60`; `npm run release -- patch` made `a67ef89` and tag `v0.4.1`; release https://github.com/AdeebAli/design-system-react/releases/tag/v0.4.1.
- **Planned, not started,** each its own branch, PR, and release, in this order, each started only after the previous one is released:
  1. `docs/superpowers/plans/2026-11-11-v0-5-feedback-and-display.md` (v0.5, minor; 9 tasks): Spec 16, plus every new theme token for v0.5–v0.7.
  2. `docs/superpowers/plans/2026-11-11-v0-6-advanced-inputs.md` (v0.6, minor; 6 tasks): Spec 14.
  3. `docs/superpowers/plans/2026-11-11-v0-7-app-navigation.md` (v0.7, minor; 5 tasks): Spec 15.
  - v0.5–v0.7 are recommended subagent-driven, but the owner hasn't chosen yet (thread 10).
- **Next:** the owner chooses v0.5's execution method (thread 10), then the v0.5 build.

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

**This session (2026-11-11), the v0.4.1 release:**
- PR #26 squash merged by the owner as `337db60`.
- `npm run release -- patch` on a clean, up-to-date `main`: all checks passed, then `a67ef89` (version 0.4.1 in `package.json` and `package-lock.json`), tag `v0.4.1`, push (the owner's ruleset bypass), and the GitHub release.
- Release notes: the script's `--generate-notes` produced only the PR list, though the old next step 1 said to use the draft in PR #26's body. With the owner's approval they were replaced by that draft (Fixes, Docs, Changes) plus the Full Changelog link, through `gh release edit v0.4.1`.
- This note, on branch `docs/handoff-v0.4.1`.

**The v0.4.1 build, branch `fix/v0.4.1-open-threads`, PR #26 (for reference):**
- `9874dac`: the four plans, the previous note, Spec 00's milestone table, and Specs 14–15's `Milestone` lines.
- `88e94d1`: `Tabs`, `RadioGroup`, `ToggleChipGroup` follow the root `dir`; new RTL tests (including new `RadioGroup` and `ToggleChipGroup` browser test files) and a `Select` centering test.
- `572367e`: `Table.css.ts` sticks only a one-row header; new tests and the `StickyTwoRowHeader` story; Spec 13 and the Table docs (one-row header, two `rowSpan` limits).
- `59e6ea6`: `TanStackRecipe.example.tsx`, the `TanStackRecipe` story, `@tanstack/react-table@9.3.1` devDependency, and `eslint.config.js` allowing devDependencies in `*.example.*`.
- `42c151f`: lockfile regenerated under `.nvmrc`'s Node (ruling 7).
- `f9f79c2`: the recipe story's ascending-order check (ruling 8).
- `72722d1`: visual baselines from the `update-visual-baselines` workflow (run 43160231650): the `TanStackRecipe` screenshots changed and `StickyTwoRowHeader` screenshots were added, 8 files, all reviewed. The first baselines run (43159502446) was rejected on push because `f9f79c2` had moved the branch, so it was dispatched again on the branch.
- The handoff (`docs/HANDOFF.md`), in the acceptance commit `3c38bc2`, updated in `9d053c9` and `ba6f37d`.
- `803580d`: `CLAUDE.md` prefixes Node commands with `nvm use` and asks for break-check ledger lines.
- `b8ac114`: `tsconfig.build.json` excludes `*.example.tsx`; the redundant `vite/client` reference is removed (owner's request after the review).
- `ce5a5f1`: the touch-emulation tests (`Input.touch.browser.test.tsx`, `Tooltip.touch.browser.test.tsx`) run in a new `browser-touch` Vitest project, which `test:stories` includes; `vitest.desktop-pointer.setup.ts` guards the `browser` project (owner's request to diagnose thread 7).
- Public API unchanged: `git diff v0.4.0 -- src/index.ts` is empty.

**v0.4.0 release (for reference):** PR #24 squash merged as `e6b254b`; `npm run release -- minor` made `9bd299b` and tag `v0.4.0`, with hand-edited release notes.

## Verification

**The v0.4.1 release:**
- `npm run release -- patch` on `337db60`: its `npm run check` passed (the script stops on any failure), ending with fixtures 64 passed and 22 skipped; then it pushed and created the release.
- CI on PR #26's head `803580d` (run 43173957869): all six jobs passed, including `stories` and `visual`. CI on `main` at `337db60` (run 43174978579): passed.
- `Publish release` (run 43176128833) and `Storybook release` (run 43176128836) on `a67ef89`: both succeeded.
- The owner reports both manual checks from PR #26 passed: the RTL keyboard spot check with VoiceOver, and VoiceOver and NVDA on `Table` › `StickyWithSpans` (thread 9c).
- The edited release notes, read back with `gh release view v0.4.1`, match the draft except for one trailing newline.
- The review covered all code up to `ce5a5f1`. After it: `ba6f37d` (handoff), `803580d` (`CLAUDE.md`), and `a67ef89` (version bump); none changes `src` or tests.

**The v0.4.1 build (for reference):**

- `npm ci && npm run check` on `42c151f`, under `.nvmrc`'s Node: exit 0. Unit 756/756, stories and browser 769/769 (axe in both modes), build and `verify-dist`, fixtures 64 passed and 22 skipped (tests scoped to one fixture app, as for v0.4.0). The only warnings were tooling deprecations (`eslint@9.39.5`, Node `module.register()`) and npm's install-scripts notice for `esbuild` and `fsevents`, none from this branch.
- After `f9f79c2`: typecheck, lint, format, and `test:stories` 769/769 again.
- CI on `3c38bc2` (run 43161220975): all six jobs passed, including `visual` with the new baselines.
- After `b8ac114`: typecheck, lint, format, the DataTable stories 20/20, and `npm run build` (`verify-dist: ok`, no TanStack in `dist`).
- Touch-test fix, in the CI image (Node 26, arm64; CI is x64): with only the guard added, the `browser` project failed 44 tests, every one with the guard's message. After the move, `browser` + `browser-touch` passed 4 of 4 runs (333/333) and `test:stories` passed 2 of 2 (769/769). Locally, `browser` + `browser-touch` passed 333/333.
- CI on `f9f79c2` (run 43160072395): `static`, `unit`, `stories`, `package (node nvmrc)`, and `package (node 22)` passed. `visual` failed only on the eight screenshots that `72722d1` then committed.
- Every new test was seen failing first, or was broken on purpose and seen failing: the RTL tests before the wrap; the two-row header test before the selector change; the corner tests with the corner selector broken; the `Select` centering test with `align="start"`; the recipe's sort checks with `sortedRowModel` removed; typecheck with `useReactTable`.
- **Independent review:** a fresh Opus reviewer on `5eda67e..42c151f` found it ready to merge (0 Critical, 0 Important, 4 Minor), and the same reviewer reviewed `f9f79c2` (OK). The same reviewer also reviewed `b8ac114` (OK), so the review covered all code up to `b8ac114`. It then reviewed the touch-test fix as `54df8ed` (no Critical or Important issues). `ce5a5f1`, the pushed form of that commit, differs only in two comments (its Minor: the isolation comes from a separate browser context per project, not a separate browser), so the review covers all code up to `ce5a5f1`. Not independently reviewed: `72722d1` (screenshots from the workflow run 43160231650, reviewed by eye) and the handoff commits.

**Not verified:**

- CI on the `a67ef89` push (run 43176126303) was still running when this note was written. Trigger: CI on this note's PR, which runs on top of `a67ef89`.
- Installing 0.4.x from GitHub Packages, and that 0.4.1 appears there (only the publish job's success was seen). `gh` lacks `read:packages`. Trigger: none; the v0.1 install proved the pipeline. (Carried forward.)
- The v0.5–v0.7 plans haven't had an independent review. Trigger: none before their builds; each branch gets a fresh whole-branch review before merge. (Carried forward.)

## Open threads

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
7. **One intermittent browser test, not diagnosed.**
   - `Table.browser.test.tsx` "scrollable scrolls by keyboard" (line 151) failed once in three local full runs (`scrollLeft` stayed 0) and passed otherwise. It predates the sticky change. In the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) it passed 5 of 5 runs of `Table.browser.test.tsx` alone and 2 full `test:stories` runs, and it passed on CI run 43127830011. Its one failure was on macOS under full-suite load. It failed again locally on `d219774`, and an instrumented copy caught one failure in three full runs: `ArrowRight` scrolled 40px, then `ArrowDown` reached the focused wrapper, wasn't prevented, with the page focused and visible, yet `scrollTop` stayed 0 for 2.5s. Ruled out: `ArrowDown` arriving during the `ArrowRight` scroll animation (pressing both back to back scrolls both).
   - It isn't explained by the v0.4.1 touch-emulation fix (`ce5a5f1`): that taint happens only on Linux, and this test's failures were on macOS. It passed in the v0.4.1 release's local `npm run check` and on CI for `803580d` and `337db60`. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. Nothing forces a diagnosis while it keeps passing.
10. **v0.5–v0.7 execution method.** The owner hasn't chosen (subagent-driven is recommended: about 2 agents per task plus a final review). Trigger: the start of each plan's build session.
11. **A deferred minor finding from v0.4.1's final review.** A two-row header still gets the sticky-header `scroll-padding-block-start` (`stickyHeaderPad`, `src/components/Table/Table.css.ts:44`), so a focused cell stops about one header row below the top while nothing sticks. Nothing is hidden. Trigger: none; pick it up when convenient. (Carried forward; the other two minors were resolved in `b8ac114`.)

12. **Release notes need a manual edit after every release.** `scripts/release.mjs` calls `gh release create --generate-notes`, which lists only PRs, so the drafted notes were applied by hand for v0.4.0 and again for v0.4.1 (`gh release edit`). Proposed fix: let the script take `--notes-file <path>` and pass it to `gh release create`. Trigger: the owner's decision before the v0.5 release; otherwise the v0.5 release needs the same manual edit.

Resolved this session:
- Thread 9c, `scope="row"` with `rowSpan`: the owner's VoiceOver and NVDA check on `Table` › `StickyWithSpans` passed, so the markup is kept and no `headers` docs are needed.
- Old unverified item, CI on `ce5a5f1` and the note's update: CI on PR #26's head `803580d` passed all six jobs (run 43173957869). The held run 43161001609 on `72722d1` is superseded.
- Old unverified item, the owner's manual checks: both passed (owner's report; thread 9c above and the RTL spot check).
- Old next step 1, merge and release: PR #26 merged as `337db60`; v0.4.1 released as `a67ef89`, with the drafted notes (see Changes).
- Old next step 2, the handoff update after the release: this note.

The list of threads resolved in the v0.4.1 build (1, 2, 3, 8, 9a–b, 7's hover failures, 11's other minors) is dropped here; it stays readable in `git show 337db60:docs/HANDOFF.md`.

Resolved lists from earlier notes (v0.4.0 release, v0.4 build, planning session) stay readable in `git show 5eda67e:docs/HANDOFF.md`.

## Next steps

1. The owner chooses v0.5's execution method (thread 10) and whether the release script should take the drafted notes (thread 12).
2. Build v0.5 from `docs/superpowers/plans/2026-11-11-v0-5-feedback-and-display.md` on its own branch and PR. Then v0.6 and v0.7, each started only after the previous one is released.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.4.1 is merged and released (tag `v0.4.1`, `a67ef89`). Confirm CI passed on this handoff's PR, then ask me how to execute the v0.5 plan (`docs/superpowers/plans/2026-11-11-v0-5-feedback-and-display.md`, thread 10) and whether to let `npm run release` take a notes file (thread 12), and start the v0.5 build on its own branch.
