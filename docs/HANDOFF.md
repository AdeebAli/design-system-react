# Handoff: design-system-react

- **Date:** 2026-11-09

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/. The owner installed 0.1.0 from GitHub Packages in another project, which finishes Spec 01's registry check.
- **Done:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is merged to `main` as `ffb1104` (PR #20) and released as v0.2.0 (`78202da`). It adds `Card`, `Stat`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Button`, `IconButton`, `ToggleChip`, `ToggleChipGroup`, and `ColorModeToggle`, plus the Bento, Forms, and React Hook Form pages. The release notes call out the breaking change: a full theme from `defineFullTheme` must now supply the `size.checkbox`, `size.switch`, and `size.chip` tokens.
- **Accessibility:** the owner's screen reader pass on `Link`, `VisuallyHidden`, and `Icon` is done, and v0.2's manual checks came out clean.
- **Next milestone:** v0.3 (Spec 10 Navigation, Spec 11 Prose). No plan yet.

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

- PR #20 merged as `ffb1104`, and its branch is deleted locally and on GitHub.
- `npm run release -- minor` made `78202da` (v0.2.0) and the `v0.2.0` tag and GitHub Release. The release's notes were edited to add the breaking change and a component summary above the generated list.
- This note is on branch `docs/handoff-after-v0.2.0`.

## Verification

- CI passes on `main` at `ffb1104` and at `78202da`.
- The Publish workflow logged `+ @adeebali/design-system-react@0.2.0`, and the Storybook workflow deployed: the live site's `index.json` lists the new stories.
- Every commit on PR #20 was reviewed (an Opus whole-branch review, then two Sonnet reviews of the later commits), and the owner reviewed the PR before merging.
- v0.2's manual checks (screen reader, forced colors, 200% text) came out clean, per the owner.
- **Not verified:** installing 0.2.0 from GitHub Packages into a project. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. The build reads each font file's `unicode-range` from its character map (`scripts/font-ranges.mjs`), so an `inter-ui` update needs no manual range work. Trigger: a test pins the 4.1.1 ranges, so an update that changes them fails until someone reviews the new ones.
2. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after Node 22's end of life, April 30, 2027, until the floor and CI's Node matrix are raised.
3. **Deferred minors from the v0.2 review,** each a small change. Trigger: the v0.3 plan (Next steps, item 1) decides each as a plan task or a drop.
   - `Select` treats `value="toString"` or `"constructor"` as a known option. Build its labels with `Object.create(null)` and check with `Object.hasOwn`.
   - `Input disabled={false}` in a disabled `Field` stays disabled but loses the disabled styling.
   - The `Switch` knob moves with a physical `translateX`, which breaks if Spec 00's proposed RTL support lands.
   - `Select` group keys use the label, so duplicate group labels give duplicate React keys.
   - `Textarea` spreads its props `as object`, which hides type mismatches.
   - `verify-dist`'s client-module list is kept by hand. A rule that any module importing Base UI or hooks must start with `"use client"` would catch future misses.
   - The React Hook Form fixture and docs don't pass `field.ref` to `RadioGroup`.
4. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs to wrap it. The owner deferred this to v0.4. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`.
5. **The repo's `handoff` skill is shadowed by the owner's personal one.** `.claude/skills/handoff/` saves to `docs/HANDOFF.md` by default, but Claude Code loads `~/.claude/skills/handoff/` when both exist, and that copy saves to the repo root. Until that changes, pass `docs/HANDOFF.md` as the argument. Trigger: none; the owner decides how to reconcile the two copies.
6. **PR preview deploys** of Storybook: options were Vercel (its GitHub app appears to be installed but not linked to this repo), subfolders on GitHub Pages from a `gh-pages` branch, or a CI artifact. Trigger: none; the owner hasn't chosen.

Resolved: Base UI is installed as `@base-ui/react` `^1.9.0` (v0.2); the registry check is done; the owner kept `ColorModeToggle`'s `variant` and `size`, now in Spec 09; PR #20 is reviewed and merged; v0.2's manual checks are done; v0.2.0 is released with the breaking change in its notes.

## Next steps

1. **Write the v0.3 plan** from Spec 10 (Navigation) and Spec 11 (Prose), and decide each deferred minor in open thread 3 as a plan task or a drop.
2. When a PR's visual baselines change, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the PR's merge box. Don't close and reopen the PR.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.2.0 is released. Write the v0.3 plan from Specs 10 and 11, deciding each deferred v0.2 minor in open thread 3.
