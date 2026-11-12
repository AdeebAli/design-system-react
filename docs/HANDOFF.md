# Handoff: design-system-react

- **Date:** 2026-11-11

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** v0.1 (specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), and v0.4 (Spec 12 Overlays, Spec 13 Data), each merged and released, with Storybook at https://adeebali.github.io/design-system-react/.
  - v0.4 is merged as `e6b254b` (PR #24) and released as v0.4.0 (`9bd299b`). It adds `Dialog`, `Popover`, `Tooltip`/`TooltipProvider`, `Menu`, the toast API (`ToastProvider`, `useToast`, `createToastManager`, `toast.promise`), `Table`, `DataTable`, `Pagination`, `Skeleton`, `EmptyState`, the "Overlays" and "Data" overview pages, and `docs/components.md`.
  - The plan was `docs/superpowers/plans/2026-11-10-v0-4-overlays-and-data.md`.
- **Next:** the v0.5 plan. Not started.

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

- PR #24 squash merged as `e6b254b`.
- `npm run release -- minor` made `9bd299b` (v0.4.0) and tag `v0.4.0` on `main`, and created the GitHub Release. The push bypassed the `main` rules (PR required, status checks) as the release script's direct push always has.
- Release notes edited by hand: "New components" (overlays, data, `docs/components.md`), "Changes" (`ColorModeToggle` props), "Fixes" (`Tabs` RTL indicator and `onValueChange(null)`, `Prose` `kbd` border), then the generated changelog. No breaking-changes section: `git diff v0.3.0 v0.4.0 -- src/index.ts` only adds exports, and the only pre-v0.4 source changed is `ColorModeToggle`, `Tabs`, and `Prose` (additive or fixes).
- This note, on its own branch and PR (as #21 and #23 did).
- v0.4 work, for reference: new component folders for the overlays and data components plus shared `src/components/overlays/`; eight new internal icons; Specs 12 and 13 amended; fixture pages `fixtures/next-app/app/(site)/{overlays,data}/` with `tests/fixtures/{overlays,data}.spec.ts`.

## Verification

- The release script's checks (`npm run check`) passed before it tagged, including fixtures 64 passed, 22 skipped (tests scoped to one fixture app). So did both intermittent tests in open thread 7, this time.
- CI passed on `e6b254b`, all six jobs (run 43145785349).
- Publish run 43146843828 succeeded; its log shows `+ @adeebali/design-system-react@0.4.0`.
- https://adeebali.github.io/design-system-react/ returns 200.
- Before the merge: four `/code-review` rounds, the last covering `c326d01`; checks and CI on the PR's head passed (details in PR #24 and the v0.4 ledger in `.superpowers/sdd/`). The owner did the manual checks on 2026-11-11.
- **Not verified:**
  - CI on `9bd299b` was still running when this note was written (the `storybook-pages` run succeeded). `9bd299b` changes only the version in `package.json` and `package-lock.json`. Trigger: the PR for this note shows the `main` status; check it before merging.
  - Installing 0.4.0 from GitHub Packages. `gh` lacks `read:packages`. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

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
7. **Intermittent browser tests, not diagnosed.**
   - `Table.browser.test.tsx` "scrollable scrolls by keyboard" (line 151) failed once in three local full runs (`scrollLeft` stayed 0) and passed otherwise. It predates the sticky change. In the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) it passed 5 of 5 runs of `Table.browser.test.tsx` alone and 2 full `test:stories` runs, and it passed on CI run 43127830011. Its one failure was on macOS under full-suite load. It failed again locally on `d219774`, and an instrumented copy caught one failure in three full runs: `ArrowRight` scrolled 40px, then `ArrowDown` reached the focused wrapper, wasn't prevented, with the page focused and visible, yet `scrollTop` stayed 0 for 2.5s. Ruled out: `ArrowDown` arriving during the `ArrowRight` scroll animation (pressing both back to back scrolls both).
   - `Button.browser.test.tsx` "hover changes a solid button to the hover token" (line 50) failed once on CI run 43127830011: after the hover, the background stayed `rgb(79, 70, 229)` instead of `rgb(67, 56, 202)`. The rerun passed, the full `test:stories` passed 751 of 751 twice in the CI image, and it hadn't failed in the previous 15 failed CI runs. Ruled out: touch emulation from `Input` and `Tooltip` tests leaking into other files (files run in parallel, but the setting didn't carry over, and hover worked right after it was turned off).
   - Both passed in the v0.4.0 release's `npm run check` and in CI on `e6b254b`. Trigger: CI on every PR and the v0.5 release's `npm run check`; if either fails, find the cause before rerunning. Nothing forces a diagnosis while they keep passing.
8. **Multi-row sticky headers (reported by the third review, not yet checked in a browser).** With `stickyHeader`, every header row sticks at the top, so a second `TableHead` row sits over the first, and `scroll-padding-block-start` reserves one row, so focus can land under the second (WCAG 2.4.11). Spec 13 doesn't say whether multi-row headers are supported. It predates `spanned`. Trigger: the v0.5 plan must decide support or document the limit.
9. **Tables with a first-column `rowSpan`** (from the fourth review, `/code-review` on `1a411fd..c326d01`; none checked in a browser yet):
   - The selected-row bar on a `spanned` row is drawn on its first cell, which is in the second column, so with `stickyFirstColumn` it scrolls under the sticky spanning cell.
   - Hover and selection repaint the spanning cell only from its own (first) row, not from the rows it covers.
   - A row header over several rows uses `scope="row"` with `rowSpan`; the reviewer says some screen readers then announce it for its first row only, and `TableHeader` doesn't allow `scope="rowgroup"`.
   - Triggers: the v0.5 plan must decide each; the screen reader point needs a check with VoiceOver and NVDA on the `StickyWithSpans` story.

Resolved since the last note:
- Old next step 1, merge PR #24 and release v0.4.0 with edited notes: merged as `e6b254b`, released as `9bd299b`, published, notes edited (see Changes and Verification). The intermittent tests passed in its check (thread 7).
- Old unverified items, CI on `932828d` and later, and on `e59510c`: CI passed on the squash-merged `e6b254b`, including `visual`.
- Old unverified item, installing 0.3.0: superseded by the same item for 0.4.0.

Resolved during v0.4, before the merge:
- Old next step 1, baselines and approving workflows: done; CI passes on `44881b4`.
- Old next step 2, the manual checks: done by the owner.
- Thread 7's Toast swipe failure: not timing. The wrong-way mouse drag selected part of the title, and on Linux the next press landed on that selection, which started a native text drag and cancelled the pointer (seen as `dragstart` then `pointercancel` in the CI image). The test now clears the selection before each drag (`17a4508`).
- Old thread 1, the owner's decisions: sticky column (a) built in `b949c17`; the toast queue drops after unmount and Tooltip `delay={0}` is documented in `32b5818`, with Specs 12 and 13 amended; README resolved below; the TanStack v9 recipe is now thread 1 with a v0.5 trigger.
- The README list: the owner chose a full list in a separate doc (`docs/components.md`).
- Old next step 1, push and draft PR: done (PR #24), and the baselines are committed (`15d3003`).
- Old thread 1, the deferred v0.3 minors: fixed in `529457d` with tests, except that a bare default React import is still undetected (now thread 6).
- Old thread 3, `ColorModeToggle` props: fixed in `e36012e` and `6cc0515`, including a test that wraps it in a `Tooltip` and a test with a forced `ThemeProvider`.
- Old next step 1, writing the v0.4 plan: written (`f9b3cfe`) and executed. Old thread 2's audit rerun ran (thread 3).

## Next steps

1. Write the v0.5 plan. It must act on the triggers in open threads 1 (TanStack v9), 2 (RTL in v0.3 widgets), 3 (`npm audit`), 8 (multi-row sticky headers), and 9 (`rowSpan` tables).

## Resume prompt

> Read `docs/HANDOFF.md`. v0.4.0 (Overlays and Data) is merged, released, and published. Write the v0.5 implementation plan, acting on the triggers in open threads 1, 2, 3, 8, and 9.
