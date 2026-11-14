# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal React design system, published as `@adeebali/design-system-react`. Current status, open threads, and next steps live only in `docs/HANDOFF.md`, not here.

Update `docs/HANDOFF.md` through the `handoff` skill, never by hand, so every open thread keeps a trigger.

## Commands

Node comes from `.nvmrc`, so run `nvm use` first. Claude's shell doesn't keep state between commands, and nvm's default may be another Node, so prefix every `node`, `npm`, and `npx` command with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.

- `npm run dev`: Storybook.
- `npm run build`: library build into `dist/`, then `scripts/verify-dist.mjs`.
- `npm run typecheck`, `npm run lint`, `npm run format:check`.
- `npm test`: unit, behavior, type, and script tests. For one file: `npx vitest run --project unit src/components/Box`.
- `npm run test:stories`: every story as a browser test, with axe in both modes.
- `npm run test:fixtures`: packs the tarball and tests it in `fixtures/vite-app` and `fixtures/next-app`.
- `npm run test:visual`: local runs are a preview only. Baselines come only from the `update-visual-baselines` workflow.
- `npm run check`: everything except `test:visual`.

Read these first:
- `docs/HANDOFF.md`: current status, decisions with rejected alternatives, open threads, next steps.
- `docs/specs/00-overview.md`: goals, non-goals, the theming contract, v1 scope, milestones, and the spec index.
- `docs/adr/0001`–`0004`: accepted architecture decisions.

## Planning workflow

- Specs live in `docs/specs/NN-name.md` and are written one at a time, in index order. Each one goes: draft → reviewer/builder check → bring the owner only the questions whose answers change what gets built → update → owner approves (Status `Draft` → `Accepted`) → next spec.
- When a spec is accepted, commit it on a branch, open a PR, squash merge it, delete the branch, then start the next spec. Don't ask first. This covers accepted specs only; other commits and pushes need a request. If the spec adds or reorders a milestone, update `docs/HANDOFF.md`'s next steps in the same PR, through the `handoff` skill.
- Record new architectural decisions as the next ADR (`docs/adr/0005-…`), using the existing ADR format (Status, Date, Context, Decision, Alternatives considered, Consequences).
- Items marked **(proposed)** in specs are the assistant's calls and not owner-confirmed. Don't treat them as settled.
- Implementation plans come only after the specs are approved.
- Every plan's Global Constraints require each break-check to be ledgered as `<assertion file:line>: broke <what>, failed at <file:line>`. A break that fails at another line doesn't prove that assertion.
- Every plan's Global Constraints require each ruling to be ledgered as `Ruling: <decision> — Spec: "<the line it touches>" | Spec silent (searched: <terms>) — <cost if wrong>`. If a quoted line says something the decision changes, it's a departure, not a ruling: ask the owner before building on it.
- Fixture assertions are break-checked too. For a server-HTML assertion, save the real served HTML, remove the asserted target from the element it belongs to (not a lookalike elsewhere on the page), and check that the assertion passes on the real HTML and fails on the stripped copy. For a browser fixture test, build a tarball with that one behavior broken and see the test fail.
- Brainstorm mockups live in `.superpowers/` (gitignored).
- A subagent may act as a fresh reviewer of a finished branch or plan, such as the final whole-branch review in `superpowers:executing-plans`. This is an exception to the owner's general limits on subagents. Give it read-only work, and validate its findings before acting on them.

## Architecture constraints (from the ADRs and spec 00)

- **Styling is vanilla-extract** (ADR 0001). Tokens and themes use `createThemeContract`/`createTheme` and compile to CSS custom properties. Box style props come from sprinkles and variants from recipes. Styles go in `.css.ts` files. All CSS compiles at library build time into one static `styles.css`, so consumers need no bundler plugin.
- **Everything goes through tokens.** Compiled classes reference CSS variables only. Components never hardcode values specific to the Soft theme (e.g., card shadow and border are both tokens, so a bordered theme needs no component changes). Style props accept tokens only. Arbitrary values go through `style`/`className`.
- **A single `Box` primitive, used by composition.** Every component accepts layout props (margin, width, flex/grid placement). Visual styling comes from variants and the theme, not from exposing every Box prop.
- **Base UI supplies interactive behavior** (ADR 0002). Wrap it behind this library's own component names and typed props. Consumers never import Base UI. Non-interactive components don't use it. If Base UI can't cover a component, the proposed fallback is React Aria for that component only, recorded in a new ADR.
- **Theming has three levels:** token overrides, a full theme, and per-instance `className`/`style`. Color mode follows the OS by default and can be locked or toggled.
- **Non-goals:** charts, form state and validation (`Field` only displays labels, hints, and errors), React versions below 19, non-DOM targets.
- **Icons:** `Icon` accepts any SVG component. Lucide is recommended, but this package doesn't depend on it: projects install `lucide-react` themselves, and internal icons are copied in as small SVG components with Lucide's ISC notice (spec 07).
- **Accessibility target:** WCAG 2.2 AA in both light and dark modes.

## Tooling decisions (spec 01)

- npm, with `package-lock.json` committed and `npm ci` in CI. Development and CI use the Node in `.nvmrc`. `engines.node` is the oldest version consumers may use (`>=22`, the oldest Node line still supported upstream), and CI also runs the package job on it (ADR 0004). To catch phantom dependencies: a lint rule (`import/no-extraneous-dependencies`) plus a consumer fixture app that installs the packed tarball.
- Strict TypeScript, React 19 as a peer dependency, Vite library mode, Storybook, Vitest + Testing Library + axe, Playwright visual regression.
- Release (ADR 0003): `npm run release -- <patch|minor|major>` checks that the branch is a clean, up-to-date `main`, runs all checks, then `npm version`, `git push --follow-tags`, and `gh release create --generate-notes`. A GitHub Actions workflow on `release: published` publishes to GitHub Packages. Never publish from a local machine. There is no CHANGELOG.md; release notes live in GitHub Releases.
