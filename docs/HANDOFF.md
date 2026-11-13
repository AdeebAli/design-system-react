# Handoff: design-system-react

- **Date:** 2026-11-12

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 (Specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), v0.4 (Specs 12–13), v0.4.1, and v0.5.0 (Spec 16). Storybook is at https://adeebali.github.io/design-system-react/.
- **v0.6 is built, not merged.** Spec 14 (`Combobox`, `MultiSelect`, `FileUpload`) from `docs/superpowers/plans/2026-11-11-v0-6-advanced-inputs.md` is on `feat/v0.6-advanced-inputs`, draft PR #31 (https://github.com/AdeebAli/design-system-react/pull/31). Its visual baselines are committed (`f97a736`, `0cbc263`). CI on those commits waits for the owner to select **Approve workflows to run**.
- **Next:** the owner approves the workflows, does the manual checks in PR #31, and merges; then `npm run release -- minor`; then v0.7 (`docs/superpowers/plans/2026-11-11-v0-7-app-navigation.md`, Spec 15).

## Decisions

Architecture decisions are in `docs/adr/`. The decisions and rulings from v0.4, v0.4.1, and v0.5 (Base UI direction from the document root, the runtime popup gap, the toast queue, the DataTable rulings, the sticky first column, the labeled `Divider` as plain text, and others) are unchanged and listed in full in `git show c1b6c3d:docs/HANDOFF.md`. The v0.6 build's ledger, with every ruling and break-check, is `.superpowers/sdd/2026-11-11-v0-6-advanced-inputs/progress.md` (local, gitignored).

### v0.6 decisions (owner, 2026-11-12)

- **Execution was inline,** with one final Opus whole-branch review (owner's choice; rejected: hybrid, fully subagent-driven). Code changed after that review twice, and each change got its own fresh read-only Sonnet review (see Verification).
- **Spec 14 amended, three times:**
  - `Combobox` has no wrapper blur handler. Base UI 1.9.0 restores the selected label when the popup closes, and browser tests pin it. Rejected: the wrapper's own blur handler, which would duplicate Base UI's.
  - `MultiSelect searchable` cancels only the close after a pick. In Base UI 1.9.0 that also keeps the filter, and a browser test pins it. Rejected: also cancelling the filter clear, which would be dead code today.
  - `FileUpload` has a new `labels.announce` (`'{name}: {status}'`) so translations can order status announcements. Rejected: a fixed "name: status" order.

### v0.6 rulings (where Spec 14 is silent; cost if wrong)

- **`Combobox`:**
  - The chevron trigger is `aria-hidden` and out of the Tab order. Outside a `Field`, Base UI leaves it unnamed, and the input opens the list by keyboard. Cost: a new label key if it should be announced.
  - A change to the same value isn't reported. Base UI sends `null` when typed text is deleted with nothing selected.
  - No `Combobox.Empty`, because the status element shows "No results". A second live region would announce it twice.
  - `labels.loading` is `'Loading'`, matching `Button`.
- **Shared popup:** `SearchPopup` and `useOptionSearch` (in `src/components/Combobox/`) are shared by `Combobox` and `MultiSelect searchable`. `useOptionSearch` also takes the component name, which its warnings use.
- **`MultiSelect`:**
  - In the default mode, unknown values show the raw value, with no warning.
  - `searchable` has no chevron, since Spec 14 says the control is "chips and an input".
  - The wrapper sets `data-popup-open` on the chips itself, because Base UI doesn't.
  - Base UI hides everything outside an open popup from assistive tech, chips included. The PR's screen reader check covers it.
- **`FileUpload`:**
  - Without `multiple`, a drop of several files keeps the first accepted file and rejects the rest as `count`.
  - Rejected files don't count toward `maxFiles`.
  - The button variant uses Button's outline/neutral/md look.
  - The prompt and button text aren't `aria-hidden`; the input's name is the `Field` label.
  - Announcements are derived during render, not in an effect, and are keyed so repeated text is announced again.
  - A file picked before hydration is adopted into the list (`useEffectEvent`).
  - Sizes use 1024-byte steps with one decimal.
- **Search control styles:** `Combobox`'s input group and `MultiSelect searchable`'s chips and input have complete styles, not overrides of `Input`'s wrapper. Two classes in one cascade layer resolve by stylesheet order, which differed between the Storybook build (4px padding) and the test runner (12px). Found in the baseline screenshots. Any future same-layer override has the same hazard.
- **Disabled `FileUpload` story:** axe's `color-contrast` rule is off in that story only. Disabled text is exempt (WCAG 1.4.3), but axe sees only the hidden input as disabled.
- **Owner approval:** push, the PR, and this handoff waited for the owner's approval (CLAUDE.md).

## Changes

On branch `feat/v0.6-advanced-inputs` (from `main` at `c1b6c3d`), draft PR #31:
- `492a41c` `Combobox` (plus `@base-ui/react/combobox` in `vite.config.ts` `optimizeDeps`).
- `9fe738c` `MultiSelect`.
- `e83b497` `MultiSelect searchable` (and the shared `SearchPopup`).
- `e95fcc2` `FileUpload`, and the internal `Upload` icon.
- `a12fb40` the file list and status (`File` and `CircleX` icons, `formatSize`).
- `9808468` docs, fixtures, and appearance tests:
  - `docs/components.md`, `src/components/ReactHookForm.mdx`, and the `Overview/Advanced inputs` page.
  - The Next.js `/inputs` page and the Vite `Combobox`, tested in `tests/fixtures/inputs.spec.ts`.
- `48d150c` final review fixes: early picks, a consumer `onChange`, disabled drops, re-announcements, `$` in labels, stale removal focus.
- `14a0e6e` `labels.announce` and the Spec 14 amendments.
- `75f7cfc` second review fixes, and the search control padding order.
- `f97a736` and `0cbc263` visual baselines, from the workflow.
- This note.

## Verification

- `npm ci && npm run check`, exit 0 on `9808468`:
  - unit 1013
  - stories and browser 1064, axe in both modes
  - `verify-dist: ok`
  - fixtures 70 passed, 28 skipped
- `npm run check`, exit 0 on `75f7cfc`:
  - unit 124 files, 1021 tests
  - stories and browser 171 files, 1075 tests
  - `verify-dist: ok`
  - fixtures 70 passed, 28 skipped
  - Only known warnings: npm's install-scripts notice and arethetypeswrong's ignored lines.
- **Break-checks:** every new assertion was seen failing with the code it checks broken, each on its own line. The ledger lists each one.
  - Break-checks found and removed dead code: `File.type` lowercasing, a forced-colors `CanvasText` border, `itemToStringLabel` on the searchable root, and a `minmax(0, …)` grid column.
  - Vacuous tests were fixed: a warning key used up by an earlier test, invalid and disabled checks that only passed inside a `Field`, a `searchable={false}` DOM-attribute check.
- **Fixtures:** each `/inputs` server-HTML assertion was checked against the real served HTML, with its target removed. The hydration (no console errors) test and the Vite filter test weren't broken separately; that would need a broken tarball.
- **`npm audit` (thread 3 rerun):** 11 moderate, 0 high, 0 critical, all dev-only (minimatch via api-extractor and `typescript-eslint`, glob via Storybook docgen). Same as v0.5. `typescript-eslint` 8.72.2, the latest, is still in the affected range (`<=8.72.2`), so it wasn't upgraded.
- **Reviews:**
  - The final Opus whole-branch review of `c1b6c3d..9808468`: ready after fixes. I re-graded four findings to Important (early pick lost on hydration, consumer `onChange`, disabled drop opening the file, replacement not announced) and fixed them, plus two Minors, in `48d150c`, each with a test seen failing first.
  - A fresh Sonnet review of `9808468..14a0e6e`: ready, with 3 Minors, fixed in `75f7cfc`.
  - A fresh Sonnet review of `14a0e6e..75f7cfc`: ready with nits, with 2 Minors and 2 nits, deferred (thread 6).
  - **The reviews cover all code up to `75f7cfc`.** After it come only the baseline commits and this note.
- **Visual baselines:** reviewed the Advanced inputs form, the `FileUpload` statuses, `Combobox` open and clearable, and `MultiSelect searchable` in both modes.

**Not verified:**

- **The PR #31 manual checks**, none done. Trigger: the PR checklist, before merge.
  - A screen reader pass on all three components, including chips and status announcements on a popup's first open.
  - Touch and forced colors on all three.
  - `FileUpload` on iOS and Android, with `capture`.
  - Voice control on the `FileUpload` button variant.
  - Forced colors on the six v0.5 components.
- **CI on the baseline commits** (`f97a736`, `0cbc263`). It waits for the owner's **Approve workflows to run**. Trigger: that approval, before merge. CI on `14a0e6e` failed only in `visual`, from the missing baselines (126, all new stories or the grown React Hook Form docs page).
- **Base UI behaviors the wrappers don't own** can't be broken in wrapper code, so they rest on Base UI and its tests: `Escape` closes, `Backspace` removes the last chip, `data-popup-open` and `data-selected` on options. Trigger: none; any Base UI upgrade reruns the suite.
- **Whether browsers send drag events to a disabled file input** isn't checked. The disabled-drop test dispatches on the root. Trigger: the manual touch and drop checks in PR #31.
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. Carried forward.
- **Installing 0.5.x or 0.6.x from GitHub Packages.** Trigger: none; the v0.1 install proved the pipeline. Carried forward.
- **The v0.7 plan hasn't had an independent review.** Trigger: none before its build; the branch gets a whole-branch review before merge. Carried forward. The v0.6 half is resolved.

## Open threads

4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings.** Trigger: none; pick from this list when convenient. (Carried forward from v0.4 and v0.5. The full v0.4 list is in `git show c1b6c3d:docs/HANDOFF.md`.)
   - **v0.6, from the third review:**
     - `MultiSelect searchable`'s chip wrapper ends at `space.1`, against `space.3` for `Input`, so typed text runs to about 5px from the right border (`src/components/MultiSelect/MultiSelect.css.ts`, `chips`).
     - Its block padding subtracts `borderWidth.thin`, while `Input.control` hardcodes `1px`. A theme with another `borderWidth.thin` miscomputes the small content height; `minHeight` still holds the control height.
     - A declined removal followed by the parent removing that same file still moves focus (`src/components/FileUpload/FileUpload.tsx`, the `removing` ref).
     - No test pins the searchable small height with a chip present, the chips input's disabled cursor, or the chip wrapper's focus ring.
   - **v0.6, set aside by the final review:**
     - `onSearch` also fires for Base UI's own input syncs.
     - Reopening with a value shows every option seen, ungrouped (Base UI).
     - Inline `selectedOptions` rebuilds items each render (performance only).
     - A form reset doesn't clear the `FileUpload` list.
     - Non-file drags highlight the dropzone.
     - Switching `searchable` at runtime remounts the component.
   - **v0.5:** Dialog and Drawer close buttons scroll away in tall content. Before hydration, an avatar image with transparent areas shows initials through them. `Alert`'s `hasContent` lets `true` and `[]` through. `Divider`'s ref type accepts a div ref. The bottom sheet keeps its safe-area padding with the keyboard up. A provider test waits a fixed 300ms.
   - **v0.4:** Popover, overlay foundations, Tooltip, Menu, Toast, Table, Pagination, EmptyState and Skeleton, DataTable, earlier tasks, and fixtures. See the old note.
7. **One intermittent browser test, not diagnosed:** `Table.browser.test.tsx` "scrollable scrolls by keyboard". It failed only on macOS under full-suite load. It passed in every `npm run check` and CI run this session. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. (Carried forward; details in the old note.)
10. **v0.7 execution method.** v0.6 was inline with a final Opus review, then a fresh review of each later code commit. Trigger: the start of the v0.7 build session. (Carried forward; the v0.6 half is resolved.)
11. **A two-row header still gets the sticky-header `scroll-padding-block-start`** (`src/components/Table/Table.css.ts:44`), so a focused cell stops about one header row below the top. Nothing is hidden. Trigger: none; pick it up when convenient. (Carried forward.)

**Resolved this session:**
- Old next step 1: PR #30 (the v0.5.0 handoff) passed CI and was merged as `c1b6c3d`. That also resolves the old unverified item about CI on the `bbd81d9` push.
- Old next step 2 and thread 10's v0.6 half: v0.6 was built inline (above).
- Old unverified item: the v0.6 plan's independent review was replaced by the whole-branch reviews above.
- Old unverified item: forced colors on the v0.5 components is now a checkbox in PR #31.

## Next steps

1. On PR #31, select **Approve workflows to run**, and confirm CI passes on `0cbc263` and on this note's commit. Don't close and reopen the PR.
2. Do the manual checks in PR #31's checklist.
3. Mark PR #31 ready, if it isn't already, and squash merge it.
4. On a clean, up-to-date `main`, run `npm run release -- minor`, then apply the "Release notes draft" from PR #31's body with `gh release edit v0.6.0`.
5. Update this note, then start v0.7 from `docs/superpowers/plans/2026-11-11-v0-7-app-navigation.md` (Spec 15), asking the owner for the execution method (thread 10).

## Resume prompt

> Read `docs/HANDOFF.md`. v0.6 (Combobox, MultiSelect, FileUpload) is in draft PR #31 with baselines committed. Check whether I've approved the workflows and done the manual checks, then help me merge and run `npm run release -- minor`, apply the release notes from the PR body, update the handoff, and ask me how to execute v0.7.
