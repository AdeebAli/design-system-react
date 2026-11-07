# Handoff: design-system-react

- **Date:** 2026-11-07

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted. Milestone v0.1 (specs 01–07) is being built from `docs/superpowers/plans/2026-11-06-v0-1-foundations.md`.

## Status

- **Done:** all 15 plan tasks are committed on `feat/v0.1-foundations`, for draft PR #17: tooling, tokens and Soft themes, `ThemeProvider`, `Box`, conventions, `Icon`, 13 layout and typography components, and the Foundations pages.
- **Waiting on:** visual baselines and CI on PR #17.
- **Not started:** v0.2. The first real release is the owner's.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-06-v0-1-foundations/progress.md`, which is local and gitignored.

## Open threads

1. **Inter comes from `inter-ui` 4.1.1, pinned exactly,** because Fontsource's files drop `cv05` and `cv08`. `scripts/build-fonts.mjs` hardcodes each file's `unicode-range`, read from that version's character maps, so recompute them if the version changes.
2. **`fixtures/next-app/tsconfig.tsbuildinfo` is tracked,** and every fixture run rewrites it, so the tree stays dirty.
3. **`.vitest/` isn't ignored.** A failing browser test writes screenshots there.

## Next steps

1. Push the branch, add the `update-baselines` label to PR #17, and review the baseline diff. Expect all five CI jobs to pass.
2. Do the screen reader pass on `Link`, `VisuallyHidden`, and `Icon`.
3. Mark PR #17 ready, merge it, and run `npm run release -- minor`. Then confirm the hosted Storybook is reachable.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.1 is built on `feat/v0.1-foundations` (PR #17). Continue from its next steps.
