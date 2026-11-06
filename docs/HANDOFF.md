# Handoff: design-system-react planning

- **Date:** 2026-11-05

## Goal

Plan a personal React design system (`@adeebali/design-system-react`) by
breaking the work into discrete specs in `docs/`, interactively with the
owner, before any code is written.

## Status

- **Done:** repo created and pushed; ADRs 0001-0004 accepted; specs
  `00-overview`, `01-repo-and-tooling`, `02-tokens-and-themes`,
  `03-theme-provider`, `04-box-and-style-props`, `05-component-conventions`,
  `06-layout-and-typography`, `07-icon` (all of milestone v0.1's specs),
  `08-bento`, `09-forms`, and `10-navigation` **Accepted**. License is PolyForm Noncommercial 1.0.0.
- **In progress:** `11-prose`.
- **Blocked:** nothing.
- **No code written.** Planning only; no dependencies installed.

## Decisions

| Area | Decision | Rejected alternatives |
|---|---|---|
| Purpose | Foundation for all future projects (content sites + data tools); share parts, opinionated default look, fully overridable | — |
| Styling | vanilla-extract; static CSS at library build; Box via sprinkles, variants via recipes ([ADR 0001](adr/0001-styling-with-vanilla-extract.md)) | Tailwind, CSS Modules, Emotion, **Panda** (requires consumer build setup), StyleX |
| Box | Single `Box` primitive, by **composition** not class inheritance; layout props on all components, visual styling via variants/theme; token-only values | Exposing every Box prop on every component |
| Look | "Soft" bento: warm off-white, white cards, soft shadows, ~20px card radius, one indigo accent; chosen from mockups. Soft Dark also in v1 | Crisp (bordered, mono), Dark (lime accent) |
| Theming | Themes are CSS variables; contract covers all token categories; 3 levels (token overrides, full theme, per-instance). Color mode follows the OS, can be locked or toggled | — |
| Behavior | Base UI, wrapped behind our own API; consumers never import it ([ADR 0002](adr/0002-headless-primitives-with-base-ui.md)) | Radix (maintenance mode), React Aria (fallback only), in-house |
| Scope | Full kit, ~44 components, released in stages (v0.1 → v0.4 → v1.0) | Foundations-only or core-kit-only v1 |
| Non-goals | No charts; components don't manage form state or validation; React 19+ only; token-only style props | — |
| Distribution | GitHub Packages, `@adeebali` scope (lowercase) ([ADR 0003](adr/0003-distribution-and-release.md)) | Public npm |
| Release | Manual: `npm run release -- <bump>` → `npm version` tag → `gh release create --generate-notes` → Actions publishes on `release: published`. Notes live in GitHub Releases, no CHANGELOG.md | Changesets, release-please, semantic-release |
| Package manager | npm, plus lint rule and tarball fixture to catch phantom deps ([ADR 0004](adr/0004-npm-as-package-manager.md)) | pnpm, Yarn |
| Tooling (unchallenged defaults) | React 19 peer, strict TS, Vite library mode, Lucide icons, Storybook, Vitest + Testing Library + axe, Playwright visual regression | Phosphor, Tabler, Heroicons |

Items marked **(proposed)** in `00-overview.md` are the assistant's calls,
not owner-confirmed: typed theme override objects, no flash of the wrong
mode on SSR, responsive style props, React Aria as the gap fallback, CI
quality gates, browser targets, logical properties for RTL readiness,
`"use client"` split, 30-minute setup criterion, and milestone groupings.

## Changes

Branch `main`, **no commits yet**. All files are untracked:

```
.gitignore                                         (.superpowers/)
docs/adr/0001-styling-with-vanilla-extract.md
docs/adr/0002-headless-primitives-with-base-ui.md
docs/adr/0003-distribution-and-release.md
docs/adr/0004-npm-as-package-manager.md
docs/specs/00-overview.md
docs/HANDOFF.md
```

Mockups are in `.superpowers/brainstorm/` (gitignored). The visual companion
server was started on port 56598 and auto-exits after 4 hours idle.

## Verification

- `git status` confirms `.superpowers/` is ignored.
- `00-overview.md` reviewed by a Sonnet builder-check subagent. Of its 7
  questions, 5 were folded in as answered or proposed calls and 1 (staged
  release) was answered by the owner.
- Not verified: Base UI's current package name and version (ADR 0002 defers
  this to setup), and whether Base UI covers every listed interactive
  component.

## Open threads

- Owner approval of `docs/specs/00-overview.md`.
- Owner review of the **(proposed)** items in `00-overview.md`.
- Whether to commit the planning docs (not yet requested).

## Next steps

1. Get approval on `00-overview`, then set its Status to `Accepted`.
2. Draft `docs/specs/01-repo-and-tooling.md`: project structure, Vite + VE
   build, lint and import rules, Vitest/axe/Playwright, Storybook, CI gates,
   consumer fixture, release script, and publish workflow per ADR 0003.
3. For each spec: draft → builder check → bring only the questions that need
   the owner → update → owner approves → next spec. Record any new
   architectural decision as the next ADR (0005+).
4. Continue through specs 02–13 in index order.
5. After specs are approved, use `superpowers:writing-plans` to produce
   implementation plans, starting with milestone v0.1.

## Resume prompt

> We're planning a personal React design system in
> `~/projects/design-system-react` (`@adeebali/design-system-react`). Read
> `docs/HANDOFF.md`, `docs/specs/00-overview.md`, and `docs/adr/*` first.
> We're writing specs one at a time, interactively. Each spec is drafted,
> checked by a reviewer, then approved by me before moving on. No code yet.
> Next: confirm I've approved `00-overview` (mark it Accepted), then draft
> `docs/specs/01-repo-and-tooling.md`, asking me only the questions whose
> answers change what gets built.
