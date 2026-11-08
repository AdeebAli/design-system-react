# Handoff: design-system-react

- **Date:** 2026-11-08

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17): tooling and the release pipeline, tokens and Soft themes, `ThemeProvider`, `Box`, component conventions, `Icon`, 13 layout and typography components, and the Foundations pages. Its plan was `docs/superpowers/plans/2026-11-06-v0-1-foundations.md`.
- **Released:** v0.1.0 (`f49377f`), published to GitHub Packages, with Storybook deployed at https://adeebali.github.io/design-system-react/.
- **Not started:** v0.2, which is Spec 08 (Bento) and Spec 09 (Forms).
- **Accessibility:** the owner's screen reader pass on `Link`, `VisuallyHidden`, and `Icon` is done.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions from v0.1, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-06-v0-1-foundations/progress.md`, which is local and gitignored.

## Open threads

1. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. The build reads each font file's `unicode-range` from its character map (`scripts/font-ranges.mjs`), so an `inter-ui` update needs no manual range work. A test pins the 4.1.1 ranges, so an update that changes them fails until someone reviews the new ones.
2. **`engines.node` is `>=22`.** The release script refuses to release after Node 22's end of life, April 30, 2027, until the floor and CI's Node matrix are raised.
3. **Base UI is verified** in ADR 0002: `@base-ui/react` 1.9.0 covers everything Spec 09 needs. v0.2 installs it.

## Next steps

1. Install `@adeebali/design-system-react@0.1.0` from GitHub Packages with a `read:packages` token, to finish Spec 01's registry check. It needs the owner's token.
2. Write the v0.2 implementation plan from Specs 08 and 09, asking the owner only questions whose answers change what gets built.

After the `update-baselines` workflow commits to a PR, CI on that commit fails with no jobs, because the bot pushes with `GITHUB_TOKEN`. Close and reopen the PR to run CI on the new baselines.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.1 is merged. Continue from its next steps.
