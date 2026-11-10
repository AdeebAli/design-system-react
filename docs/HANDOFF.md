# Handoff: design-system-react

- **Date:** 2026-11-10

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/.
- **Done:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is merged as `ffb1104` (PR #20) and released as v0.2.0 (`78202da`).
- **Done:** milestone v0.3 (Spec 10 Navigation, Spec 11 Prose) is merged as `2a20a62` (PR #22) and released as v0.3.0 (`c0eb2a7`). It adds `NavBar`, `NavBarLink`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`, `Prose`, `NotProse`, the "Navigation and prose" overview page, and the "Markdown and MDX" docs, plus fixes to older code: stricter theme validation, a tested nonce-based CSP, `RadioGroup` focus through `field.ref`, the split Vite fixture bundle, and dependency audits in CI. The plan was `docs/superpowers/plans/2026-11-09-v0-3-navigation-and-prose.md`.
- **Next:** the v0.4 plan (Spec 12 Overlays). Not started.

## Decisions

Architecture decisions are in `docs/adr/`. Build decisions, with what each costs if wrong, are the `Ruling:` lines in `.superpowers/sdd/2026-11-09-v0-3-navigation-and-prose/progress.md` (local and gitignored), and the v0.1 and v0.2 ledgers beside it. The v0.3 ones worth knowing without opening the file:

- **`NavBar` structure:**
  - `Collapsible.Root` renders the `nav`, which is one CSS grid. Below `md`, the menu button sits after `actions` by default (`menuPosition="end"`), or before the brand (`"start"`), through a rule scoped to `not all and (min-width: md)` so it can't override the desktop layout.
  - `menuVariant` takes any `IconButton` variant, with that variant's default tone (so `solid` is accent). Rejected: a `menuTone` prop, and a third position between brand and actions.
  - From `md` up, CSS overrides the closed panel's `hidden`, so links show without JavaScript. The active bar is an `::after` border, so forced colors keeps it.
- **`NavBar` `Escape` handling:** it acts only when the panel is open, the event isn't `defaultPrevented`, and `event.currentTarget` (the `nav`) contains the target. Rejected: a `ref` on the `nav`, because a consumer's `ref` overrode it.
- **`next/link` from a server component (Spec 10 amended in `9d2e227`):** a one-line `'use client'` re-export, shown in the docs and used by the fixture. Rejected: closing the panel from a click handler on the list. Next 16.4.5's `Link` calls the consumer's `onClick`, then `preventDefault()` on every in-app click before routing, so a list handler couldn't tell that from a project's own `preventDefault()`. It would drop "a prevented click keeps the panel open" and the misuse warning.
- **`NavBar` focus after a link click:** the panel closes, and focus moves to the menu button only if `checkVisibility()` says it's shown.
- **Sticky `NavBar` with the menu open:** below `md`, the open panel is capped at the viewport height minus the bar, and scrolls (WCAG 1.4.10).
- **`Tabs` marker handoff:** `TabsList` always renders Base UI's `Indicator` without `renderBeforeHydration`, which injects an inline script and breaks strict CSP. One `:has()` rule turns off the CSS marker once the `Indicator` shows. The list has `scroll-padding-inline` so a focused tab's ring isn't clipped.
- **`Prose` rules:** every descendant rule goes through `scoped()` in `Prose.css.ts`, so the `NotProse` exclusion can't be forgotten.
- **`Prose` is a styled element and doesn't process content (Spec 11, `2380ce3`):** its only own prop is `size`. `children` (including MDX) and `dangerouslySetInnerHTML` pass through as on any element, and `Prose` doesn't sanitize; the docs say to sanitize HTML you didn't write where it's produced. Rejected, in order tried:
  - blocking `dangerouslySetInnerHTML` (in the type, or ignoring it at runtime): the same HTML then goes in a wrapper `div`, which adds no safety and leaves the outer margins untrimmed, 58px above the title and 23px below the last paragraph, measured in Chromium. Ignoring it at runtime also rendered an empty article in production;
  - an `html` prop that sanitizes, which needs `jsdom` on the server (`isomorphic-dompurify`), and a `markdown` prop, which adds a Markdown parser. Each does work the project's content pipeline already does.
- **Heading scroll margin:** `var(--ds-prose-scroll-margin, <NavBar clearance + space.4>)`. The clearance is computed from tokens in `src/styles/sticky.ts`, which both `NavBar.css.ts` and `Prose.css.ts` import, so `Prose` doesn't depend on `NavBar`'s styles. Rejected: a theme token, which changes the theme contract.
- **Theme validation (Spec 03 amended):** values throw for `{ } ; < \`, `/*`, an unclosed quote, an unclosed or misordered `(` or `[` outside quotes, a line break inside quotes, a control character other than a tab or line break, and `url()` or `image-set()` in any case. Each was checked in Chromium: an unclosed bracket, or a newline, CR, or form feed inside quotes, drops every later theme rule, including reduced motion. Line breaks and tabs outside quotes, and tabs inside them, are harmless, so multi-line template literals stay valid.
- **CSP (Spec 03 and README):** `ColorModeScript` and `ThemeProvider` take the nonce. The policy must also allow `style-src-attr 'unsafe-inline'`: Base UI hides `Select`, `Checkbox`, `Switch`, and `RadioGroup`'s native inputs with `style` attributes in server HTML. Without it, a `Select`'s hidden input shows on the page (seen in Chromium, 174×27). The Next fixture serves `/csp` from its own root layout in `app/csp/`, with the other pages in an `app/(site)` route group so they stay static. Rejected: reading the nonce in the shared root layout, which makes every page dynamic.
- **`RadioGroup` focus (Spec 09 amended):** its `ref` stays the group element (Spec 05), but that element's `focus()` is replaced to focus the checked radio, or the first enabled one. So React Hook Form's `field.ref` works. Rejected: `tabIndex={-1}` on the group, which lands focus on something people can't change.
- **Spreading props onto Base UI parts:** where a part is typed for another element, the element's props go on the `render` element. `Textarea` is the exception: `Field.Control` reads `id`, `name`, `value`, `defaultValue`, and `autoFocus` itself.
- **Client-module check:** `scripts/client-modules.mjs` derives which `dist` modules need `"use client"` from their imports. Index files that only re-export are exempt.
- **Dependency audits in CI:** the `static` job runs `npm audit --omit=dev` (any runtime advisory fails) and `npm audit --audit-level=high`. Rejected: failing at moderate now, which would turn CI red with no fix available.
- **Vite fixture bundle:** split into `react`, `design-system`, and `vendor` chunks (largest 276 kB). Rejected: raising `chunkSizeWarningLimit`, which hides the warning.
- **Visual baselines (carried from v0.2):** the workflow runs when the `update-baselines` label is added, or by hand, not on every push. It runs `--update-snapshots=changed` (`288c186`), which rewrites only screenshots that fail the comparison, and missing ones. Rejected: `all`, which rewrote any screenshot whose bytes differed, so rendering noise flipped the `Tabs` keep-mounted baselines on every run (Playwright 1.65, `matchers/expect.js`). After it commits to a PR, GitHub holds CI on that commit until the owner selects **Approve workflows to run** in the merge box. Rejected: a stored token. Don't close and reopen the PR.

## Changes

- PR #22 squash merged as `2a20a62`; branch `feat/v0.3-navigation-and-prose` deleted locally and on the remote.
- `npm run release -- minor` made `c0eb2a7` (v0.3.0) and tag `v0.3.0` on `main`, and created the GitHub Release.
- Release notes edited by hand: a "Breaking: stricter theme validation" section first (the four new rejections, which functions throw, the v0.2.0 rules still applying, and how to fix it), then new components, fixes, and the generated changelog. Written from `git diff v0.2.0 v0.3.0 -- src/theme/validateTheme.ts`.
- This note, on its own branch and PR (as #21 did for v0.2.0).
- v0.3 work, for reference: specs 03, 09, 10, 11 amended; README gains "6. A strict Content Security Policy"; new `src/styles/sticky.ts`, `fixtures/next-app/proxy.ts`, `fixtures/next-app/app/csp/`, `tests/fixtures/csp.spec.ts`.

## Verification

- The release script's checks passed before it tagged, including fixtures 57 passed, 15 skipped (the skips are tests scoped to one fixture app).
- Publish run `42756392911` succeeded; its log shows `+ @adeebali/design-system-react@0.3.0` to `https://npm.pkg.github.com/` with tag `latest`.
- The owner did PR #22's manual checks: screen reader, forced colors, and 200% text on `NavBar`, `Tabs`, and `Prose` (the PR's boxes were left unchecked).
- CI passed on `2a20a62` and on `c0eb2a7`. The `storybook-pages` run on the release succeeded, and https://adeebali.github.io/design-system-react/ returns 200.
- Before the merge, `npm run check` exited 0 on `0c38272` (unit 463, scripts 20, browser and stories 466 with axe in both modes, fixtures 57), and CI passed on `0c38272`, all six jobs. Each new v0.3 test failed first, or when the code was broken on purpose (details in the v0.3 ledger).
- **Not verified:**
  - Installing 0.3.0 from GitHub Packages. `gh` lacks `read:packages`, so the registry wasn't queried directly. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **Deferred minors from the v0.3 review.** Trigger: the v0.4 plan decides each as a task or a drop. (Carried forward.)
   - The Tabs `Indicator` uses `insetInlineStart` with a physical `translateX`, so it's misplaced under `dir="rtl"`. Fix: physical `left: 0`, plus an RTL test.
   - An uncontrolled `Tabs` whose `defaultValue` matches no tab falls back to the first enabled tab. With no enabled tab, `onValueChange(null)` reaches a callback typed `(value: string)`.
   - A `Prose` inside a `NotProse` gets no styles. It's undocumented.
   - `client-modules.mjs` misses `import * as React` and `import React, { useState }`. None exist today.
   - `Prose`'s `kbd` rule uses physical `borderBottomWidth`.
2. **11 moderate `npm audit` advisories, dev tooling only:** `glob` and `minimatch` through `typescript-eslint`. 8.72.2 is the latest `typescript-eslint` and is affected; `--force` installs an incompatible version. Triggers: CI fails if one reaches runtime dependencies or rises to high; the v0.4 plan must include a step to rerun `npm audit` and upgrade once a fixed version exists. (Carried forward.)
3. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`. (Carried forward.)
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **The repo's `handoff` skill is shadowed by the owner's personal one.** They differ only in the default output (`docs/HANDOFF.md` or chat). Recommendation: delete `.claude/skills/handoff/` and say in the project `CLAUDE.md` to pass `docs/HANDOFF.md`. Trigger: none; the owner decides. (Carried forward.)
7. **PR preview deploys** of Storybook. Recommendation: `gh-pages` subfolders from the existing `storybook-pages` workflow, with cleanup on PR close, since it needs no stored secret. Trigger: none; the owner decides. (Carried forward.)

Resolved since the last note:
- Old thread 1, the release notes on stricter theme validation: the v0.3.0 notes open with a breaking-change section (see Changes).
- Old next step 1, merge PR #22 after its manual checks: the owner did the checks, and the PR merged as `2a20a62`.
- Old unverified item, screen reader, forced colors, and 200% text on `NavBar`, `Tabs`, and `Prose`: done by the owner.
- Old next step 2, release v0.3.0: released as `c0eb2a7` and published (see Verification). Its second half, the v0.4 plan, is next step 2.
- Old unverified item, installing 0.2.0 from GitHub Packages: superseded by the same item for 0.3.0.

## Next steps

1. Write the v0.4 plan (Spec 12 Overlays). It must decide each item in thread 1 as a task or a drop, include the `npm audit` rerun from thread 2, and include the `ColorModeToggle` task and `Tooltip` test from thread 3.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.3.0 (Navigation and Prose) is merged, released, and published. Write the v0.4 implementation plan for Spec 12 Overlays, deciding open threads 1, 2, and 3.
