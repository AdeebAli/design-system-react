# Handoff: design-system-react

- **Date:** 2026-11-09

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/.
- **Done:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is merged as `ffb1104` (PR #20) and released as v0.2.0 (`78202da`).
- **In review:** milestone v0.3 (Spec 10 Navigation, Spec 11 Prose) is built on `feat/v0.3-navigation-and-prose`, in draft PR #22. It adds `NavBar`, `NavBarLink`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`, `Prose`, `NotProse`, the "Navigation and prose" overview page, and the "Markdown and MDX" docs. It also fixes the deferred v0.2 minors. The plan is `docs/superpowers/plans/2026-11-09-v0-3-navigation-and-prose.md`.
- **Blocked on the owner:** two decisions (open threads 1 and 2), the manual checks, approving the baseline run, merging, and releasing v0.3.0.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-09-v0-3-navigation-and-prose/progress.md` (local and gitignored), and the v0.1 and v0.2 ledgers beside it. The v0.3 ones worth knowing without opening the file:

- **`NavBar` structure:**
  - `Collapsible.Root` renders the `nav`, which is one CSS grid. Below `md`, the menu button (`IconButton variant="ghost"`) sits after `actions`.
  - From `md` up, CSS overrides the closed panel's `hidden`, so links show without JavaScript.
  - The active bar is a `::after` border, so forced colors keeps it.
- **`NavBar` `Escape` handling:** it acts only when the panel is open, the event isn't `defaultPrevented`, and `event.currentTarget` (the `nav`) contains the target.
  - Rejected: a `ref` on the `nav`, because a consumer's `ref` overrode it and silently disabled `Escape`.
  - Base UI's `Select` handles `Escape` natively, so the tests use a portaled input and a cancelling control instead.
- **`NavBar` focus after a link click:** the panel closes, and focus moves to the menu button only if `checkVisibility()` says it's shown.
- **Sticky `NavBar` with the menu open:** below `md`, the open panel is capped at the viewport height minus the bar, and scrolls, so links stay reachable at 320×256 (WCAG 1.4.10).
- **`Tabs` marker handoff:** `TabsList` always renders Base UI's `Indicator` without `renderBeforeHydration`, because that option injects an inline script, which breaks strict CSP. One `:has()` rule turns off the CSS marker once the `Indicator` is shown.
  - The list has `scroll-padding-inline`, so a tab scrolled into view keeps its focus ring. A test caught the clipping.
- **`Prose` rules:** every descendant rule goes through `scoped()` in `Prose.css.ts`, so the `NotProse` exclusion can't be forgotten, and the `:not()` goes before pseudo-elements. Heading `scroll-margin` comes from `NavBar.css.ts`'s exported `stickyClearance`, which is computed from tokens.
- **Spreading props onto Base UI parts:** where a Base UI part is typed for another element (`Field.Control` for an input; `Collapsible.Root`, `Tabs.*`), the element's own props go on the `render` element. Rejected for `Textarea` alone: Base UI's `Field.Control` reads `id`, `name`, `value`, `defaultValue`, and `autoFocus` from its own props, so those go to it directly. A controlled `Textarea` broke when they didn't.
- **Client-module check:** `scripts/client-modules.mjs` derives which `dist` modules need `"use client"` from their imports: Base UI, a `use*` hook, or `createContext`. Barrels that only re-export are exempt. The hand-kept list is gone, and `serverModules` remains as the inverse check.
- **Pre-bundling:** `vite.config.ts` pre-bundles `@base-ui/react/collapsible` and `/tabs`, as v0.2 did for the others.
- **Visual baselines (carried from v0.2):** after the `update-baselines` workflow commits to a PR, GitHub holds CI on that commit for approval, because the commit is pushed with `GITHUB_TOKEN`. Approve it with **Approve workflows to run** in the PR's merge box. Rejected: a GitHub App or personal token, which needs a stored secret. Don't close and reopen the PR.

## Changes

- Branch `feat/v0.3-navigation-and-prose`, 10 commits from `517068d` (the plan) to `67d7362` (the review fixes), plus this note. 58 files changed. Pushed, with draft PR #22 labeled `update-baselines`.
- New: `src/components/{NavBar,Tabs,Prose}/`, `src/components/Navigation.stories.tsx`, `src/components/Prose/MarkdownAndMdx.mdx`, `src/components/Icon/internal/Menu.tsx`, `scripts/client-modules.mjs` and its test, `tests/fixtures/navigation.spec.ts`, `fixtures/next-app/app/{SiteNav.tsx,NextLink.tsx,blog/page.tsx}`.
- Changed: `Select`, `Input`, `Textarea`, the `Switch` knob (`Checkbox/choice.css.ts`), `ReactHookForm.mdx`, `utils/withDefaultDisplay.ts` (adds `withDefault`), `scripts/verify-dist.mjs`, `vite.config.ts`, and both fixtures.

## Verification

- `npm ci && npm run check` exits 0 at `67d7362`:
  - unit 426 passed
  - script tests 20 passed
  - browser and story tests 460 passed, with axe in both modes
  - `verify-dist` ok
  - fixtures 50 passed
- Each new test was seen failing first, or the code was broken on purpose to confirm it fails (ledger).
- A fresh Opus reviewer read the whole branch. Its three must-fix findings are fixed in `67d7362`, each with a test that failed first. Its five minors are open thread 3.
- The Spec 10 and 11 acceptance audit is in PR #22's body: every automated item passes, and the manual ones are the owner's.
- **Not verified:**
  - CI on PR #22 and the visual baselines. Trigger: the `update-baselines` run on PR #22, then the owner's approval of the held run.
  - Screen reader, forced colors, and 200% text on `NavBar`, `Tabs`, and `Prose`. Trigger: the checklist in PR #22, before merging.
  - Installing 0.2.0 from GitHub Packages. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **Departure from Spec 10 (owner decision): `next/link` in a server component.** In Next 16, a server component's `next/link` resolves to `next/dist/client/app-dir/link.react-server.js`, a plain function, so `as={NextLink}` can't cross into the client `NavBarLink`.
   - **Now:** the fixture and docs use a one-line `'use client'` re-export (`fixtures/next-app/app/NextLink.tsx`).
   - **Alternative:** `NavBar` closes the panel through a delegated click on its `ul`, which makes `NavBarLink` server-safe, so `as={NextLink}` works with no extra file. The cost is losing the "outside a NavBar" warning.
   - Trigger: PR #22 can't merge until the owner picks one, and Spec 10 is amended in the same PR.
2. **`RadioGroup` and React Hook Form focus (owner decision).** `RadioGroup`'s `ref` is its group `div` (Spec 05's default, since Spec 09 is silent), which can't take focus. So the docs say to leave `field.ref` off it, and RHF can't focus it after a failed submit. The alternative is having the group's `focus()` move to the checked radio. Trigger: PR #22's "Needs your decision" list.
3. **Deferred minors from the v0.3 review.** Trigger: the v0.4 plan decides each as a task or a drop.
   - The Tabs `Indicator` uses `insetInlineStart` with a physical `translateX`, so it's misplaced under `dir="rtl"`. Fix: physical `left: 0`, plus an RTL test.
   - An uncontrolled `Tabs` whose `defaultValue` matches no tab falls back to the first enabled tab. With no enabled tab, `onValueChange(null)` reaches a callback typed `(value: string)`.
   - A `Prose` inside a `NotProse` gets no styles. It's undocumented.
   - `client-modules.mjs` misses `import * as React` and `import React, { useState }`. None exist today.
   - `Prose`'s `kbd` rule uses physical `borderBottomWidth`.
4. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`. (Carried forward.)
5. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
6. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
7. **The repo's `handoff` skill is shadowed by the owner's personal one.** Pass `docs/HANDOFF.md` as the argument, as this note was. Trigger: none; the owner decides. (Carried forward.)
8. **PR preview deploys** of Storybook: Vercel, `gh-pages` subfolders, or a CI artifact. Trigger: none; the owner hasn't chosen. (Carried forward.)
9. **The Vite fixture's bundle is over 500 kB,** which triggers Vite's chunk warning in `npm run check`. It was 320 kB early in v0.2 and 520 kB before v0.3's fixture changes; v0.3 adds about 20 kB. Trigger: none; the owner decides whether to raise `chunkSizeWarningLimit` in the fixture or split it.
10. **`npm ci` reports 12 moderate audit advisories.** Not investigated. Trigger: none; the owner decides.

Resolved:
- Old open thread 3, the v0.2 minors: six are fixed in `ced69dd` and `bebcb87`. The seventh (`field.ref` on `RadioGroup`) is now open thread 2.
- Old next step 1, the v0.3 plan: written and committed as `517068d`.

## Next steps

1. Decide open threads 1 and 2. If the departure is accepted, amend Spec 10 in PR #22. If the delegation route is chosen, implement it with a test that renders `NavBarLink as={NextLink}` from the Next fixture's server page with no re-export.
2. Review the committed baseline screenshots on PR #22, then select **Approve workflows to run** in its merge box. Don't close and reopen the PR.
3. Do the manual checks in PR #22's checklist, mark the PR ready, and merge it.
4. Release with `npm run release -- minor`, then write the v0.4 plan (Spec 12 Overlays), deciding open threads 3 and 4.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.3 (Navigation and Prose) is in draft PR #22, with all checks passing locally. Help me decide open threads 1 (the `next/link` departure from Spec 10) and 2 (`RadioGroup` focus with React Hook Form). Then apply the decision on the branch, approve the baselines, and get PR #22 ready to merge.
