# Handoff: design-system-react

- **Date:** 2026-11-09

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/. The owner installed 0.1.0 from GitHub Packages in another project, which finishes Spec 01's registry check.
- **In review:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is PR #20, branch `feat/v0.2-bento-and-forms`, from the plan `docs/superpowers/plans/2026-11-08-v0-2-bento-and-forms.md`. It adds `Card`, `Stat`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Button`, `IconButton`, `ToggleChip`, `ToggleChipGroup`, and `ColorModeToggle`, plus the Bento, Forms, and React Hook Form pages.
- **Since the whole-branch review:** size tokens for the checkbox, switch, and chips; a `Field` label toggles an unlabeled `Checkbox` or `Switch`; a long `Badge` truncates, including in a grid cell; `ColorModeToggle` keeps `variant` and `size`, now in Spec 09; Vitest's on-disk module cache is off; the `handoff` skill ships in `.claude/skills/`.
- **Accessibility:** the owner's screen reader pass on `Link`, `VisuallyHidden`, and `Icon` is done. v0.2's manual checks are under Next steps.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-06-v0-1-foundations/progress.md` and `.superpowers/sdd/2026-11-08-v0-2-bento-and-forms/progress.md`, which are local and gitignored. The v0.2 ones worth knowing without opening the file:

- `Field` learns each control's kind through an internal `useFieldControl(kind)` hook. `Select` and `RadioGroup` get a non-`label` label that focuses without activating. An unlabeled `Checkbox` or `Switch` gets a native label that toggles it, as a native label does.
- `required` sets `aria-required` only, on every control, never the native attribute on Base UI's hidden inputs, which would block submission with no visible message.
- The check mark, radio dot, and switch knob derive from `size.checkbox` and `size.switch` instead of having their own tokens, so a resized track always fits its knob. A theme must keep the switch at least as wide as it is tall (Spec 09).
- **Visual baselines:** after the `update-baselines` workflow commits to a PR, GitHub holds CI on that commit for approval, because the commit is pushed with `GITHUB_TOKEN` (GitHub's rule since June 2026, documented on its `GITHUB_TOKEN` page). The owner approves it manually with **Approve workflows to run** in the PR's merge box. Rejected: pushing with a GitHub App or personal access token, which would run CI unattended but needs a stored secret. Closing and reopening the PR, the old workaround, only killed the held run and started a new one.
- `vitest.config.ts` sets `fsModuleCache: false`, because the cache kept serving a stale theme contract after `shape.ts` changed.
- Browser tests can emulate media through CDP (`cdp()` from `vitest/browser`): reduced motion, forced colors, and a coarse pointer are all tested that way.
- `vite.config.ts` pre-bundles the `@base-ui/react` subpaths, because story tests failed when Vite found them mid-run.

## Changes

- **Branch:** `feat/v0.2-bento-and-forms`, PR #20, head `3bfe2e9`: 385 files, +7,831 −30, of which 252 files are baseline screenshots.
- The last seven commits were rewritten to remove a `Co-Authored-By` trailer and force-pushed. Their file contents are unchanged.
- The v0.2 plan's baseline step and this note describe approving the held CI run, and `Badge.browser.test.tsx` has a flex-row truncation test.

## Verification

- `npm run check` passes on the branch's final code, and CI passes on all six jobs at `3bfe2e9`.
- **Reviews:** an Opus whole-branch review ran at `58571f3`, and its three findings are fixed with tests in `6b3b285`. A Sonnet review of `94e8d93..4e3cf76` found only minors, and the two worth taking are done. A Sonnet review of the remaining commits (`6b3b285`, `94e8d93`, `e62aa85`, `3bfe2e9`) found no Critical or Important issues. Every commit on the branch has now been reviewed.
- **`Badge` truncation** is tested in a block container, a flex row, and a grid cell. The flex test fails only with both `maxWidth: '100%'` and `minWidth: 0` removed, because either one keeps a flex item inside its row. The grid test fails with `minWidth: 0` removed.
- **Checked and left alone:** a disabled control's hint doesn't dim, inside a `Field` or out. All cases render `fg.muted`, which matches Spec 09.
- **Not verified:** v0.2's manual checks (Next steps, item 2).

## Open threads

1. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. The build reads each font file's `unicode-range` from its character map (`scripts/font-ranges.mjs`), so an `inter-ui` update needs no manual range work. Trigger: a test pins the 4.1.1 ranges, so an update that changes them fails until someone reviews the new ones.
2. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after Node 22's end of life, April 30, 2027, until the floor and CI's Node matrix are raised.
3. **Deferred minors from the v0.2 review,** each a small change. Trigger: the v0.3 plan (Next steps, item 4) decides each as a plan task or a drop.
   - `Select` treats `value="toString"` or `"constructor"` as a known option. Build its labels with `Object.create(null)` and check with `Object.hasOwn`.
   - `Input disabled={false}` in a disabled `Field` stays disabled but loses the disabled styling.
   - The `Switch` knob moves with a physical `translateX`, which breaks if Spec 00's proposed RTL support lands.
   - `Select` group keys use the label, so duplicate group labels give duplicate React keys.
   - `Textarea` spreads its props `as object`, which hides type mismatches.
   - `verify-dist`'s client-module list is kept by hand. A rule that any module importing Base UI or hooks must start with `"use client"` would catch future misses.
   - The React Hook Form fixture and docs don't pass `field.ref` to `RadioGroup`.
4. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs to wrap it. The owner deferred this to v0.4. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`.

Resolved threads: Base UI is installed as `@base-ui/react` `^1.9.0` (v0.2), the registry check is done (above), the owner chose to keep `ColorModeToggle`'s `variant` and `size` props, now documented in Spec 09, and the repo's `handoff` skill now saves to `docs/HANDOFF.md` by default.

## Next steps

1. **Review and merge PR #20.** If the visual baselines change, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the PR's merge box. Don't close and reopen the PR.
2. **Do v0.2's manual checks** (Spec 05 and Spec 09) before releasing:
   - A screen reader pass on `Field`, `Select`, and `RadioGroup`, and on the other interactive pieces: an interactive `Card`, `Button`, `IconButton`, `Checkbox`, `Switch`, `ToggleChip`, and `ColorModeToggle`.
   - Forced-colors mode on every new component. The `ForcedColorsCheck` stories on `Card` and `Switch` are the starting points.
   - 200% browser text.
3. **Release v0.2.0** with `npm run release -- minor` after merging. Edit the generated notes to call out the breaking change: a full theme from `defineFullTheme` must now supply `size.checkbox`, `size.switch.width` and `.height`, and `size.chip.sm` and `.md`.
4. **Write the v0.3 plan** from Spec 10 (Navigation) and Spec 11 (Prose), and decide each deferred minor in open thread 3 as a plan task or a drop.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.2 is PR #20, in review with CI passing. Continue from its next steps: merge after review, do the manual checks, release v0.2.0, then plan v0.3.
