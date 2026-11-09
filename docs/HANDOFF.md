# Handoff: design-system-react

- **Date:** 2026-11-08

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/. The owner installed 0.1.0 from GitHub Packages in another project, which finishes Spec 01's registry check.
- **In review:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is built on `feat/v0.2-bento-and-forms`, from the plan `docs/superpowers/plans/2026-11-08-v0-2-bento-and-forms.md`. It adds `Card`, `Stat`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Button`, `IconButton`, `ToggleChip`, `ToggleChipGroup`, and `ColorModeToggle`, plus the Bento, Forms, and React Hook Form pages. `npm run check` passes. A fresh whole-branch review found two important issues and one re-graded to important, and all three are fixed with tests.
- **Accessibility:** the owner's screen reader pass on `Link`, `VisuallyHidden`, and `Icon` is done. v0.2's manual checks are listed under Next steps.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-06-v0-1-foundations/progress.md` and `.superpowers/sdd/2026-11-08-v0-2-bento-and-forms/progress.md`, which are local and gitignored. The v0.2 ones worth knowing without opening the file:

- `Field` learns each control's kind through an internal `useFieldControl(kind)` hook. `Select` and `RadioGroup` get a non-`label` label that focuses without activating. An unlabeled `Checkbox` or `Switch` gets a native label that toggles it, as a native label does.
- `required` sets `aria-required` only, on every control, never the native attribute on Base UI's hidden inputs, which would block submission with no visible message.
- Browser tests can emulate media through CDP (`cdp()` from `vitest/browser`): reduced motion, forced colors, and a coarse pointer are all tested that way now.
- `vite.config.ts` pre-bundles the `@base-ui/react` subpaths, because story tests failed when Vite found them mid-run.

## Open threads

1. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. The build reads each font file's `unicode-range` from its character map (`scripts/font-ranges.mjs`), so an `inter-ui` update needs no manual range work. A test pins the 4.1.1 ranges, so an update that changes them fails until someone reviews the new ones.
2. **`engines.node` is `>=22`.** The release script refuses to release after Node 22's end of life, April 30, 2027, until the floor and CI's Node matrix are raised.
3. **Deferred minors from the v0.2 review,** each a small change. Decide whether to take them before v0.3:
   - `Select` treats `value="toString"` or `"constructor"` as a known option. Build its labels with `Object.create(null)` and check with `Object.hasOwn`.
   - `Input disabled={false}` in a disabled `Field` stays disabled but loses the disabled styling.
   - The `Switch` knob moves with a physical `translateX`, which breaks if Spec 00's proposed RTL support lands.
   - `Select` group keys use the label, so duplicate group labels give duplicate React keys.
   - `Textarea` spreads its props `as object`, which hides type mismatches.
   - `verify-dist`'s client-module list is kept by hand. A rule that any module importing Base UI or hooks must start with `"use client"` would catch future misses.
   - The React Hook Form fixture and docs don't pass `field.ref` to `RadioGroup`.
4. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs to wrap it. The owner deferred this to v0.4. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`.

The resolved threads: Base UI is installed as `@base-ui/react` `^1.9.0` (v0.2), the registry check is done (above), and the owner chose to keep `ColorModeToggle`'s `variant` and `size` props, now documented in Spec 09.

## Next steps

1. **Review and merge the v0.2 PR.** CI and the visual baselines run on it. After the `update-baselines` workflow commits to a PR, CI on that commit fails with no jobs, because the bot pushes with `GITHUB_TOKEN`. Close and reopen the PR to run CI on the new baselines.
2. **Do v0.2's manual checks** (Spec 05 and Spec 09):
   - A screen reader pass on `Field`, `Select`, and `RadioGroup`, and on the other interactive pieces: an interactive `Card`, `Button`, `IconButton`, `Checkbox`, `Switch`, `ToggleChip`, and `ColorModeToggle`.
   - Forced-colors mode on every new component. The `ForcedColorsCheck` stories on `Card` and `Switch` are the starting points.
   - 200% browser text.
3. **Release v0.2.0** with `npm run release -- minor` after merging. Edit the generated notes to call out the breaking change: a full theme from `defineFullTheme` must now supply `size.checkbox`, `size.switch.width` and `.height`, and `size.chip.sm` and `.md`.
4. **Write the v0.3 plan** from Spec 10 (Navigation) and Spec 11 (Prose).

## Resume prompt

> Read `docs/HANDOFF.md`. v0.2 is in review. Continue from its next steps.
