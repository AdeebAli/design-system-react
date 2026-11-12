# v0.4.1 Open Threads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.4.1, a patch that acts on the handoff's open threads 1, 2, 3, 8, and 9. It also amends Spec 00's milestones for the owner's split of v0.5 into three releases.

**Architecture:** These are fixes and docs on existing code. The v0.3 widgets reuse v0.4's `OverlayDirection` (`src/components/overlays/direction.tsx`), and `Table`'s sticky selector narrows to one-row headers. The TanStack recipe becomes a typechecked example file.

**Tech Stack:** As v0.4. `@base-ui/react` stays at `^1.9.0` (installed 1.9.0; latest on npm 1.9.0, checked 2026-11-11). There are no new runtime dependencies. One new devDependency: `@tanstack/react-table@9.3.1` (thread 1; npm `latest`, published 2026-10-12, read from the package itself).

**Spec:** `docs/specs/13-data.md` (Tasks 2–3), `docs/specs/09-forms.md` and `docs/specs/10-navigation.md` (Task 1), and `docs/specs/05-component-conventions.md`.

This is one of four plans that replace the single v0.5 plan (owner's split, 2026-11-11): `2026-11-11-v0-4-1-open-threads.md` → `2026-11-11-v0-5-feedback-and-display.md` → `2026-11-11-v0-6-advanced-inputs.md` → `2026-11-11-v0-7-app-navigation.md`. Each one is its own branch, PR, and release, in that order. Start one only after the previous one is released.

## Decisions on the open threads

The owner chose these on 2026-11-11.

| Thread | Decision | Task |
|---|---|---|
| 1. TanStack v9 | Replace the v8 recipe with a v9 one (`useTable` + `tableFeatures`, checked against the 9.3.1 tarball), as a real `.tsx` example that `npm run typecheck` covers, with `@tanstack/react-table@9.3.1` as a devDependency only | 3 |
| 2. RTL in v0.3 widgets | Add an RTL keyboard (and, for `Select`, positioning) test to `Tabs`, `RadioGroup`, `ToggleChipGroup`, and `Select`. Wrap each one whose test fails in `OverlayDirection`. A widget whose test passes keeps the test, with no code change | 1 |
| 3. `npm audit` | Rerun at acceptance. As of 2026-11-11: 11 moderate, all dev (`typescript-eslint` 8.72.1 installed, 8.72.2 latest and still affected; `@storybook/react-vite`; `@microsoft/api-extractor`). Each later plan reruns it too | 4 |
| 8. Multi-row sticky headers | Only a one-row header sticks (`thead > tr:only-child > *`). A multi-row header scrolls normally. Spec 13 and the docs say so | 2 |
| 9. First-column `rowSpan` | (a) the selected bar on a `spanned` row can scroll under the sticky cell, and (b) the spanning cell follows only its own row's hover and selection: document both in Spec 13 and the Table docs. (c) `scope="row"` with `rowSpan` is correct HTML, so keep it. The owner's screen reader check on `StickyWithSpans` decides whether the docs should recommend `headers` | 2, 4 |

## Departures from the spec

The owner accepted these on 2026-11-11. Each is amended in the commit named.

- **`stickyHeader` sticks a one-row header only** (thread 8; Spec 13, in Task 2). Spec 13 doesn't limit it. Cost if built: a grouped two-row header doesn't stick. Cost if not: the second row covers the first, and focus can hide under it (WCAG 2.4.11).
- **Two documented `rowSpan` limits** (thread 9 a and b; Spec 13, in Task 2). Cost: while the table is scrolled sideways, a covered row's selection shows only as color.
- **Milestones** (Spec 00's table, plus the `Milestone` line of Specs 14–16, in the first commit): v0.5 is Spec 16, v0.6 is Spec 14, and v0.7 is Spec 15, with v1.0 unchanged. Cost: three release cycles instead of one. In exchange, `Drawer`, `Alert`, and the rest reach projects sooner, and each release is smaller to review.

If a task can't meet a spec as written, stop and raise it with the owner before building on it.

## Global Constraints

- Branch `fix/v0.4.1-open-threads` from an up-to-date `main`, in the main checkout. One commit per task, and one PR. **No co-author or generated-by lines in commits or the PR body** (the owner's standing rule). The first commit adds all four plans and amends Spec 00's milestone table and Specs 14–16's `Milestone` lines.
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

1. **The root `dir` changes after a widget mounts (Task 1).** A `Tabs` rendered in LTR, with the root then switched to `rtl`, uses `ArrowLeft` to move to the next tab without remounting. `OverlayDirection` observes the root, so this should hold. The test proves it.
2. **A one-row header with `stickyFirstColumn` (Task 2).** After the selector change, the corner cell still sticks on both axes and sits above the header row and the first column. The existing corner test must still pass, so it was seen passing before and after.

---

### Task 1: RTL direction in v0.3 widgets (thread 2)

**Files:**
- Modify: `src/components/{Tabs,RadioGroup,ToggleChipGroup,Select}/*.browser.test.tsx`, plus the component file of each widget whose test fails

**Interfaces:** None new. It consumes `OverlayDirection`.

- [ ] **Step 1: Write the tests.** Under `dir="rtl"` on the root:
  - `Tabs`: `it('ArrowLeft moves to the next tab in RTL')`.
  - `RadioGroup`: `it('ArrowLeft checks the next radio in RTL')`.
  - `ToggleChipGroup`: `it('ArrowLeft moves focus to the next chip in RTL')`.
  - `Select`: `it('the popup aligns to the trigger inline-start edge in RTL')`, which compares the popup's right edge with the trigger's within 1px.
  - A paired LTR assertion in each test confirms that `ArrowRight` moves forward in LTR.
  - `Tabs`: `it('follows a root dir change after mount')` (Review Focus 1).
- [ ] **Step 2: Run** `npx vitest run --project browser src/components/{Tabs,RadioGroup,ToggleChipGroup,Select}`. Record which tests fail and why. Expected: the failures show LTR movement or placement under RTL. A test that passes here stays as a regression test: break its direction (wrap the widget in `<DirectionProvider direction="ltr">`), see it fail, and restore it.
- [ ] **Step 3: Implement.** Wrap each failing widget's Base UI root in `OverlayDirection`.
- [ ] **Step 4: Run** the Step 2 command. Expected: all pass, including the existing LTR tests.
- [ ] **Step 5: Commit** `Follow document direction in Tabs, RadioGroup, ToggleChipGroup, and Select`. The commit body lists which widgets changed.

### Task 2: Table header and span limits (threads 8 and 9)

**Files:**
- Modify: `src/components/Table/{Table.css.ts,Table.browser.test.tsx,Table.stories.tsx}`, `docs/specs/13-data.md`

**Interfaces:** None new.

- [ ] **Step 1: Reproduce in the browser.** Add a story with a two-row `TableHead` under `stickyHeader`. Write `it('a two-row header does not stick; neither row covers the other')`: after scrolling the wrapper 200px, the second header row's top is less than 0 relative to the wrapper (it scrolled away), and `elementFromPoint` at row 1's center inside the scrolled area isn't a row-2 cell. Write `it('a one-row header still sticks')`. Run `npx vitest run --project browser src/components/Table`. Expected: the two-row test fails with row 2 stuck at the top. If row 2 doesn't stick, record that thread 8 didn't reproduce, and ask the owner before changing CSS.
- [ ] **Step 2: Implement.** Change `headerCells` (and the corner selector) to `thead > tr:only-child > *`. Leave `stickyHeaderPad` unchanged: with no sticky row, the one-row reserve only adds scroll padding.
- [ ] **Step 3: Run** the Step 1 command. Expected: pass, including every existing sticky test.
- [ ] **Step 4: Thread 9 docs.** Check (a) and (b) on the `StickyWithSpans` story in the browser, and record what's seen. Then add two lines each to Spec 13 (the `stickyFirstColumn` paragraph) and the Table docs: a covered row's bar scrolls under the sticky spanning cell, and the spanning cell follows only its own row's hover and selected color. Add Spec 13's one-row `stickyHeader` sentence. If (a) or (b) doesn't reproduce, say so instead of documenting it.
- [ ] **Step 5: Commit** `Stick only one-row table headers; document rowSpan limits`.

### Task 3: TanStack Table v9 recipe (thread 1)

**Files:**
- Create: `src/components/DataTable/TanStackRecipe.example.tsx`
- Modify: `src/components/DataTable/DataTable.stories.tsx`, `package.json`, `package-lock.json`, the `import/no-extraneous-dependencies` config if it rejects `*.example.tsx`

**Interfaces:**
- Produces: `TanStackRecipe.example.tsx` default-exports `function CustomersTable()`. It uses `useTable({ features: tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: { alphanumeric: sortFn_alphanumeric } }), columns, data })` from `@tanstack/react-table`, and renders the `Table` parts with `TableSortHeader`.

- [ ] **Step 1:** `npm i -D -E @tanstack/react-table@9.3.1`. Confirm `npm ls @tanstack/react-table` shows 9.3.1.
- [ ] **Step 2: Write the example and the story.** The story renders `CustomersTable` live and shows its source through `?raw`. Update the docs text to say v9 (`npm i @tanstack/react-table`). Remove the v8 string.
- [ ] **Step 3: Prove it's typechecked.** Rename `useTable` to `useReactTable` in the example, run `npm run typecheck`, and see it fail on that import. Then restore it.
- [ ] **Step 4: Run** `npm run typecheck && npm run lint && npx vitest run --project 'stories-*' src/components/DataTable`, then `npm run build`. Expected: pass, and `grep -c tanstack dist/index.js` prints 0.
- [ ] **Step 5: Commit** `Move the DataTable recipe to TanStack Table v9`.

### Task 4: v0.4.1 acceptance

**Files:**
- Modify: `docs/HANDOFF.md`

**Interfaces:** Consumes everything above.

- [ ] **Step 1: Audit (thread 3).** Run `npm audit --json` and `npm view typescript-eslint version`. If a fixed `typescript-eslint` exists, upgrade it in this step and rerun `npm run lint`. Record the advisory count, severities, and versions for the handoff either way. If any advisory is in a runtime dependency or is `high`, stop and raise it.
- [ ] **Step 2: Acceptance.** Walk the thread decisions above, recording each item as passed (with its test name) or needing the owner. Run `npm ci && npm run check`. Expected: exit 0, every project ran, and no warnings.
- [ ] **Step 3: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the merge box. Don't close and reopen the PR. Expected: all CI jobs pass.
- [ ] **Step 4: Manual checks for the owner, in the PR body, not marked done:**
  - An RTL keyboard spot check of the widgets Task 1 changed, with VoiceOver.
  - VoiceOver and NVDA on the `StickyWithSpans` story (thread 9c). If either announces the spanning row header for its first row only, the follow-up is documenting `headers` in the Table docs.
- [ ] **Step 5: Release notes draft in the PR body,** for `npm run release -- patch`:
  - "Fixes": the Task 1 widgets now follow the document's text direction, and `stickyHeader` sticks only a one-row header (Task 2).
  - "Docs": the TanStack Table recipe targets v9 (Task 3), and the documented `rowSpan` limits.
  - "Changes": none to the public API. Confirm with `git diff v0.4.0 -- src/index.ts`, which should be empty.
- [ ] **Step 6: Update `docs/HANDOFF.md` through the `handoff` skill,** as a reconciliation:
  - Threads 1, 2, 3 (or carried with the Step 1 versions), and 8 are resolved, with commits. Thread 9 is resolved except 9c, which carries forward with the owner's screen reader check as its trigger.
  - Threads 4–7 carry forward with their triggers.
  - The next steps become the owner's manual checks, the merge, `npm run release -- patch`, and then the v0.5 plan.

  Commit `v0.4.1 acceptance and handoff`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks, merging, and releasing v0.4.1.
