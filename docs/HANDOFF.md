# Handoff: design-system-react

- **Date:** 2026-11-11

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** v0.1 (specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), each merged and released. v0.3.0 is `c0eb2a7`, with Storybook at https://adeebali.github.io/design-system-react/.
- **Built, not pushed:** milestone v0.4, Spec 12 Overlays and Spec 13 Data, as Spec 00 sets it. The owner chose both specs over the old handoff's "Spec 12 only".
  - Where: branch `feat/v0.4-overlays-and-data`, 45 commits on `main` (`822d742`), head `0d6e742`.
  - Plan: `docs/superpowers/plans/2026-11-10-v0-4-overlays-and-data.md`.
  - What it adds:
    - Overlays: `Dialog` (with `alert`), `Popover`, `Tooltip`/`TooltipProvider`, `Menu` (with submenus), and `Toast` (`ToastProvider`, `useToast`, `createToastManager`, `toast.promise`).
    - Data: `Table` and its parts, `DataTable`, `Pagination`, `Skeleton` and `EmptyState`.
    - The "Overlays" and "Data" overview pages, and Next/Vite fixture pages.
  - It ran with subagent-driven development. Every task had a spec and quality review, and a whole-branch review on Opus was followed by one fix wave and its re-review.
- **Waiting on the owner:** pushing, the draft PR, visual baselines, the manual checks, and the decisions in open thread 1. The project `CLAUDE.md` says pushes need a request, so nothing has been pushed.

## Decisions

Architecture decisions are in `docs/adr/`. Every v0.4 build decision, with what it costs if wrong, is a `Ruling:` line in `.superpowers/sdd/2026-11-10-v0-4-overlays-and-data/progress.md` (local, gitignored). That ledger also holds the deferred minor findings. Earlier milestones' ledgers sit beside it. The v0.4 decisions worth knowing without opening the ledger:

- **Text direction for Base UI comes from the document root.**
  - Base UI reads direction from React's `DirectionContext` (default `ltr`), not the DOM `dir`, for arrow keys, `side` start and end, and submenus.
  - `src/components/overlays/direction.tsx` provides it from `document.documentElement`, through a shared `MutationObserver`, and `Menu`, `Popover` and `Tooltip` use it.
  - A `dir` on a subtree isn't followed. The popups are portaled to `body`, so the root governs them anyway.
- **The popup gap is read at runtime.** `gapOffset` is `() => number` and reads the `space.1.5` variable from the root. Base UI 1.9.0's offset function gets only sizes, never the element. A theme override of `space.1.5` moves the gap.
- **`createToastManager` queues calls until a `ToastProvider` connects.**
  - Base UI subscribes in an effect that runs after children's effects. Without the queue, a toast added in a page's mount effect was lost.
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
- **Skeleton rows aren't capped.** Spec 13 says loading shows `pageSize` rows.
- **The TanStack recipe targets v8 (8.21.3).** npm's `latest` is 9.x, which has no `useReactTable`. It was checked against the real package, and no dependency was added.
- **Visual baselines (carried from v0.2).** The workflow runs when the `update-baselines` label is added, with `--update-snapshots=changed`. After it commits to a PR, GitHub holds CI until the owner selects **Approve workflows to run**. Don't close and reopen the PR.

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
- Fixtures: `fixtures/next-app/app/(site)/{overlays,data}/`, `CustomersTable.tsx`, and `tests/fixtures/{overlays,data}.spec.ts`. The README gains an "Overlays and data" section.

## Verification

- **Checks on `f54334a`:** `npm ci && npm run check` exited 0.
  - Unit: 746 tests.
  - Stories and browser: 730 tests, with axe in both modes.
  - Fixtures: 64 passed, 22 skipped by design.
- **Checks on `0d6e742`, after the fix wave:** typecheck, lint, format:check, `npm test` (752 + 22 script tests), `test:stories` (749), build with verify-dist, and `test:fixtures` (64 passed, 22 skipped) all exited 0, as the fix report states. The only warning is Node's existing DEP0205.
- **Tests were seen failing.** Each new test failed before its fix, or failed when the code was broken on purpose. The evidence is in the per-task reports in the ledger folder.
- **Not verified:**
  - CI and visual baselines on the v0.4 branch. Trigger: next step 1.
  - The manual checks. Trigger: next step 2, and the PR checklist.
  - Installing 0.3.0 from GitHub Packages, carried forward. `gh` lacks `read:packages`. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **Owner decisions from v0.4.** Trigger: the PR's "Departures from the spec" section, which must list each one before merge.
   - **Sticky first column versus focus (Spec 13 lines 63 and 301).**
     - Chrome ignores `max-inline-size` on auto-layout table cells, so the `scroll-padding` reserve (about 12rem) can't bound the column. Measured: a 543px first column fully hid a focused cell of about 110px.
     - The docs tell you to keep row headers short. The options:
       - (a) a fixed-width token for the sticky column;
       - (b) a small client measuring component inside the server `Table` (Spec 13 rejected measuring for `scrollable`);
       - (c) accept the limit and amend Spec 13.
   - **Toast queue semantics.** Calls made while no provider is connected also queue after an unmount, and replay on the next mount. A stale danger toast could reappear. The queue is also unbounded if no provider ever mounts. Spec 12's "Outside React" line (around line 243) doesn't describe the queue. The options:
     - document it and amend Spec 12;
     - drop the queue on disconnect once a provider has connected;
     - cap the queue.
   - **`Tooltip` with `delay={0}`:** a touch tap flashes it open for one frame. With the default delay, a tap never opens it. Spec 12 says tooltips don't appear on touch.
   - **The README** lists only the ten v0.4 components. There was no component list before. Decide whether you want a full list.
   - **A TanStack v9 recipe**, if you want one alongside the v8 recipe.
2. **RTL arrow keys and positioning in v0.3 widgets.** Base UI's composite root and Select read direction from React context, so `Tabs`, `RadioGroup`, `ToggleChipGroup` and `Select` (keys, and probably `Select`'s `side` positioning) likely behave as LTR under `dir="rtl"`. This isn't fixed, because it's v0.3 code you didn't ask to change. The fix is the shared `overlays/direction.tsx` provider. Trigger: the v0.5 plan must add an RTL keyboard and positioning test for each and decide the fix.
3. **11 moderate `npm audit` advisories, dev tooling only (`glob` and `minimatch` through `typescript-eslint`).** As of 2026-11-11, 8.72.2 is the latest and is still in the affected range, and 8.72.1 is installed. Triggers: CI fails if an advisory reaches runtime dependencies or rises to high; the v0.5 plan must rerun `npm audit` and upgrade once a fix exists. (Carried forward.)
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **The repo's `handoff` skill is shadowed by the owner's personal one.** Recommendation: delete `.claude/skills/handoff/`, and have the project `CLAUDE.md` say to pass `docs/HANDOFF.md`. Trigger: none; the owner decides. (Carried forward.)
7. **PR preview deploys of Storybook.** Recommendation: `gh-pages` subfolders from the existing `storybook-pages` workflow. Trigger: none; the owner decides. (Carried forward.)
8. **Deferred minor findings from v0.4.** The final review found none blocking. They include:
   - the Dialog close button scrolling out of view in tall content;
   - 4-digit page numbers sitting flush in `Pagination`;
   - `client-modules.mjs` not detecting a bare `import React from 'react'` used as `React.useState`;
   - test-strength polish.

   They're listed in the ledger as `minor (deferred)` lines. Trigger: none; pick from the ledger when convenient.

Resolved since the last note:
- Old thread 1, the deferred v0.3 minors: fixed in `529457d` with tests, except that a bare default React import is still undetected (now thread 8).
- Old thread 3, `ColorModeToggle` props: fixed in `e36012e` and `6cc0515`, including a test that wraps it in a `Tooltip` and a test with a forced `ThemeProvider`.
- Old next step 1, writing the v0.4 plan: written (`f9b3cfe`) and executed. Old thread 2's audit rerun ran (thread 3).

## Next steps

1. **Push and open the draft PR** for `feat/v0.4-overlays-and-data`. The PR body needs:
   - a "Departures from the spec" section (open thread 1);
   - the manual-check checklist (next step 2).

   Then add the `update-baselines` label, review the committed screenshots, and select **Approve workflows to run**. Expected: all CI jobs pass.
2. **Manual checks** (the owner):
   - a screen reader pass on each overlay, on tables, sorting and selection, and on danger toasts reached with `F6`;
   - forced colors on all ten components, including the Popover arrow;
   - Dialog scroll lock with classic scrollbars, checking for no layout shift;
   - the sticky first-column reserve in Firefox and Safari;
   - Tooltip touch with `delay={0}`.
3. Decide each item in open thread 1. Amend Specs 12 and 13 in the same PR for any departure you accept.
4. Squash-merge, then run `npm run release -- minor` for v0.4.0, and edit the release notes.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.4 (Spec 12 Overlays and Spec 13 Data) is built on `feat/v0.4-overlays-and-data` and reviewed, but not pushed. Wait for the owner's go-ahead to push and open the draft PR with the departures and the manual-check checklist, then handle the baselines, the owner's decisions in open thread 1, the merge, and the v0.4.0 release.
