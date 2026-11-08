# Handoff: design-system-react

- **Date:** 2026-11-08

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17): tooling and the release pipeline, tokens and Soft themes, `ThemeProvider`, `Box`, component conventions, `Icon`, 13 layout and typography components, and the Foundations pages. Its plan was `docs/superpowers/plans/2026-11-06-v0-1-foundations.md`.
- **Not released yet:** the first release, `npm run release -- minor`, is the owner's.
- **Not started:** v0.2, which is Spec 08 (Bento) and Spec 09 (Forms).

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions from v0.1, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-06-v0-1-foundations/progress.md`, which is local and gitignored.

## Open threads

1. **The screen reader pass** on `Link`, `VisuallyHidden`, and `Icon` hasn't been recorded as done.
2. **Inter comes from `inter-ui` 4.1.1, pinned exactly,** because Fontsource's files drop `cv05` and `cv08`. `scripts/build-fonts.mjs` hardcodes each file's `unicode-range`, read from that version's character maps, so recompute them if the version changes.
3. **`engines.node` is `>=22`,** the oldest Node line still supported upstream. Raise it when Node 22 reaches end of life in April 2027.
4. **`.vitest/` isn't ignored.** A failing browser test writes screenshots there.
5. **Base UI arrives in v0.2.** Forms are the first interactive components, so ADR 0002's Base UI package and version are still unverified, as is whether it covers every component Spec 09 lists.

## Next steps

1. Release v0.1 with `npm run release -- minor` from a clean, up-to-date `main`. Then confirm the hosted Storybook is reachable, and install the package from GitHub Packages with a `read:packages` token (Spec 01).
2. Write the v0.2 implementation plan from Specs 08 and 09, asking the owner only questions whose answers change what gets built.

After the `update-baselines` workflow commits to a PR, CI on that commit fails with no jobs, because the bot pushes with `GITHUB_TOKEN`. Close and reopen the PR to run CI on the new baselines.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.1 is merged. Continue from its next steps.
