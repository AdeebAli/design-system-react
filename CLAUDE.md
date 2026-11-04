# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Personal React design system, published as `@adeebali/design-system-react`. The repo is in the **planning phase**: no code, no `package.json`, no dependencies. There are no build, lint, or test commands yet. Spec 01 (repo and tooling) will define them; update this file when it does.

Read these first:
- `docs/HANDOFF.md`: current status, decisions with rejected alternatives, open threads, next steps.
- `docs/specs/00-overview.md`: goals, non-goals, the theming contract, v1 scope, milestones, and the spec index.
- `docs/adr/0001`–`0004`: accepted architecture decisions.

## Planning workflow

- Specs live in `docs/specs/NN-name.md` and are written one at a time, in index order (00–13). Each one goes: draft → reviewer/builder check → bring the owner only the questions whose answers change what gets built → update → owner approves (Status `Draft` → `Accepted`) → next spec.
- Record new architectural decisions as the next ADR (`docs/adr/0005-…`), using the existing ADR format (Status, Date, Context, Decision, Alternatives considered, Consequences).
- Items marked **(proposed)** in specs are the assistant's calls and not owner-confirmed. Don't treat them as settled.
- Implementation plans come only after the specs are approved, starting with milestone v0.1 (specs 01–07).
- Brainstorm mockups live in `.superpowers/` (gitignored).

## Architecture constraints (from the ADRs and spec 00)

- **Styling is vanilla-extract** (ADR 0001). Tokens and themes use `createThemeContract`/`createTheme` and compile to CSS custom properties. Box style props come from sprinkles and variants from recipes. Styles go in `.css.ts` files. All CSS compiles at library build time into one static `styles.css`, so consumers need no bundler plugin.
- **Everything goes through tokens.** Compiled classes reference CSS variables only. Components never hardcode values specific to the Soft theme (e.g., tile shadow and border are both tokens, so a bordered theme needs no component changes). Style props accept tokens only. Arbitrary values go through `style`/`className`.
- **A single `Box` primitive, used by composition.** Every component accepts layout props (margin, width, flex/grid placement). Visual styling comes from variants and the theme, not from exposing every Box prop.
- **Base UI supplies interactive behavior** (ADR 0002). Wrap it behind this library's own component names and typed props. Consumers never import Base UI. Non-interactive components don't use it. If Base UI can't cover a component, the proposed fallback is React Aria for that component only, recorded in a new ADR.
- **Theming has three levels:** token overrides, a full theme, and per-instance `className`/`style`. Color mode follows the OS by default and can be locked or toggled.
- **Non-goals:** charts, form state and validation (`Field` only displays labels, hints, and errors), React versions below 19, non-DOM targets.
- **Accessibility target:** WCAG 2.2 AA in both light and dark modes.

## Tooling decisions (to be set up in spec 01)

- npm, with `package-lock.json` committed and `npm ci` in CI. Node is pinned via `.nvmrc` and `engines` (ADR 0004). To catch phantom dependencies: a lint rule (`import/no-extraneous-dependencies`) plus a consumer fixture app that installs the packed tarball.
- Strict TypeScript, React 19 as a peer dependency, Vite library mode, Lucide icons (wrapped by `Icon`), Storybook, Vitest + Testing Library + axe, Playwright visual regression.
- Release (ADR 0003): `npm run release -- <patch|minor|major>` checks that the branch is a clean, up-to-date `main`, runs all checks, then `npm version`, `git push --follow-tags`, and `gh release create --generate-notes`. A GitHub Actions workflow on `release: published` publishes to GitHub Packages. Never publish from a local machine. There is no CHANGELOG.md; release notes live in GitHub Releases.
