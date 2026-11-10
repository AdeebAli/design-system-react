# Handoff: design-system-react

- **Date:** 2026-11-09

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Done:** milestone v0.1 (specs 01–07) is merged to `main` as `9c49e84` (PR #17), and released as v0.1.0 (`f49377f`) to GitHub Packages, with Storybook at https://adeebali.github.io/design-system-react/.
- **Done:** milestone v0.2 (Spec 08 Bento, Spec 09 Forms) is merged as `ffb1104` (PR #20) and released as v0.2.0 (`78202da`).
- **In review:** milestone v0.3 (Spec 10 Navigation, Spec 11 Prose) is on `feat/v0.3-navigation-and-prose`, in draft PR #22. It adds `NavBar`, `NavBarLink`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`, `Prose`, `NotProse`, the "Navigation and prose" overview page, and the "Markdown and MDX" docs. After review, the owner asked for more, which is in the same PR as separate commits:
  - `NavBar` `menuVariant` and `menuPosition`; `--ds-prose-scroll-margin`; a real anchor-link test. (`Prose` was briefly children-only, then reverted; see Decisions.)
  - Fixes to older code: stricter theme validation, a tested nonce-based CSP, `RadioGroup` focus through `field.ref`, the split Vite fixture bundle, and dependency audits in CI.
  - The plan is `docs/superpowers/plans/2026-11-09-v0-3-navigation-and-prose.md`.
- **Blocked on the owner:** approving the held baseline run, the manual checks, merging, and releasing v0.3.0. Open threads 1–3 should be fixed before merging.

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
- **Visual baselines (carried from v0.2):** the workflow runs when the `update-baselines` label is added, or by hand, not on every push. After it commits to a PR, GitHub holds CI on that commit until the owner selects **Approve workflows to run** in the merge box. Rejected: a stored token. Don't close and reopen the PR.

## Changes

- Branch `feat/v0.3-navigation-and-prose`: 19 commits from `517068d` (the plan) to `2380ce3`, plus this note, including baseline commits `5ac8396` and `5700029`. 167 files changed, including the baseline screenshots. Pushed; draft PR #22, labeled `update-baselines`, with an "Also in this PR" section for the older-code fixes.
- Since the v0.3 review: `33f06ab` (theme validation, CSP fixture), `8a3aa6d` (`RadioGroup` focus), `938ef88` (fixture bundle split, CI audits), `9d2e227` (`NavBar` menu props, scroll margin variable, anchor test, Spec 10 `next/link` amendment), `5700029` (baselines for `MenuAtStart` and the edited docs pages), `2380ce3` (`Prose` accepts `dangerouslySetInnerHTML` again).
- New files: `src/styles/sticky.ts`, `fixtures/next-app/proxy.ts`, `fixtures/next-app/app/csp/`, `tests/fixtures/csp.spec.ts`. Moved: the Next fixture's pages into `fixtures/next-app/app/(site)/`.
- Specs amended: 03, 09, 10, 11. README gains "6. A strict Content Security Policy".

## Verification

- `npm run check` exits 0 on the tree committed as `2380ce3` (the rebase onto `5700029` added only screenshots):
  - unit 463 passed
  - script tests 20 passed
  - typecheck clean
  - browser and story tests 466 passed, with axe in both modes
  - `verify-dist` ok
  - fixtures 56 passed
- Each new test failed first, or failed when the code was broken on purpose (ledger and this session):
  - Removing the CSP nonce from `ColorModeScript`, then from `ThemeProvider`, fails the CSP tests. Removing `style-src-attr` fails them on the visible input.
  - Removing `RadioGroup`'s `focus` override fails only the React Hook Form focus test.
  - Setting `--ds-prose-scroll-margin: 0px` on `/blog` lands the heading at 0, under the bar.
  - The first anchor test passed by coincidence: the page was too short to scroll the heading to the top. Fixed with more content below the heading and an assertion that the page didn't stop at its end.
- CI passed on `5ac8396`, including `visual`. On `bc5429e`, every job passed except `visual`, which failed only on the then-missing `MenuAtStart` screenshots.
- `5700029` also rewrote `components-tabs--keep-mounted-dark` (desktop) though nothing in `Tabs` changed: 21 pixels off by 1 of 255, rendering noise.
- **Not verified:**
  - CI on the branch head. `2380ce3` changes the Markdown and MDX docs page again, so `visual` fails until a new baseline run commits it. The baseline workflow runs only when the label is added or when started by hand; it was started by hand after this note was pushed. Trigger: that run, then the owner's approval of the held run (next step 2).
  - Screen reader, forced colors, and 200% text on `NavBar`, `Tabs`, and `Prose`. Trigger: PR #22's checklist, before merging (next step 3).
  - The hidden-input bug for `Checkbox`, `Switch`, and `RadioGroup` under CSP. Only `Select` was seen; the others were inferred from their server HTML. Trigger: open thread 2.
  - Installing 0.2.0 from GitHub Packages. Trigger: none; the v0.1 install proved the pipeline, and Publish succeeded.

## Open threads

1. **The README's CSP step is incomplete.** It reads the `x-nonce` header in the layout, but doesn't say the project's proxy must set it. Fix: add the proxy step, as in `fixtures/next-app/proxy.ts`. Trigger: next step 1, before merging, since the README ships with v0.3.0.
2. **The `/csp` fixture page renders only `Select`** of the four controls with hidden inputs. Fix: add `Checkbox`, `Switch`, and `RadioGroup` to it; the CSP test's hidden-input check then covers them. Trigger: next step 1.
3. **"Your own `style` props need `style-src-attr`"** is in the README, from the CSP spec, but untested. Fix: a `style` prop on the `/csp` page, covered by the zero-violation test. Trigger: next step 1.
4. **The v0.3.0 release notes must say theme validation is stricter.** A theme that passed in v0.2.0 can throw. Trigger: next step 4.
5. **Deferred minors from the v0.3 review.** Trigger: the v0.4 plan decides each as a task or a drop.
   - The Tabs `Indicator` uses `insetInlineStart` with a physical `translateX`, so it's misplaced under `dir="rtl"`. Fix: physical `left: 0`, plus an RTL test.
   - An uncontrolled `Tabs` whose `defaultValue` matches no tab falls back to the first enabled tab. With no enabled tab, `onValueChange(null)` reaches a callback typed `(value: string)`.
   - A `Prose` inside a `NotProse` gets no styles. It's undocumented.
   - `client-modules.mjs` misses `import * as React` and `import React, { useState }`. None exist today.
   - `Prose`'s `kbd` rule uses physical `borderBottomWidth`.
6. **11 moderate `npm audit` advisories, dev tooling only:** `glob` and `minimatch` through `typescript-eslint`. 8.72.2 is the latest `typescript-eslint` and is affected; `--force` installs an incompatible version. Triggers: CI fails if one reaches runtime dependencies or rises to high; the v0.4 plan must include a step to rerun `npm audit` and upgrade once a fixed version exists.
7. **`ColorModeToggle` doesn't accept `ref`, `style`, or pass-through button props,** which Spec 05 requires and Spec 12's `Tooltip` needs. Trigger: the v0.4 plan must include a task that adds them, with a test that wraps the toggle in a `Tooltip`. (Carried forward.)
8. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
9. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
10. **The repo's `handoff` skill is shadowed by the owner's personal one.** They differ only in the default output (`docs/HANDOFF.md` or chat). Recommendation: delete `.claude/skills/handoff/` and say in the project `CLAUDE.md` to pass `docs/HANDOFF.md`. Trigger: none; the owner decides. (Carried forward.)
11. **PR preview deploys** of Storybook. Recommendation: `gh-pages` subfolders from the existing `storybook-pages` workflow, with cleanup on PR close, since it needs no stored secret. Trigger: none; the owner decides. (Carried forward.)

Resolved:
- Old thread 1, the `next/link` departure: the re-export is accepted, and Spec 10 is amended (`9d2e227`).
- Old thread 2, `RadioGroup` and React Hook Form focus: implemented in `8a3aa6d`, with a fixture test that failed without it.
- Old thread 9, the Vite fixture's bundle over 500 kB: split in `938ef88`; `npm run check` shows no chunk warning.
- Old thread 10, `npm audit`: now thread 6, with CI triggers. The count is 11, not 12; the runtime dependencies have none.
- Old unverified item, CI on PR #22 and the baselines: CI passed on `5ac8396`.
- Old next step 1 (threads 1 and 2): done as above.

## Next steps

1. Fix open threads 1–3 on the branch. Check that the CSP test fails without `style-src-attr` for each new control.
2. Wait for the hand-started "Update visual baselines" run on the branch, review the Markdown and MDX page screenshots it commits (and `MenuAtStart` from `5700029`), then select **Approve workflows to run** in PR #22's merge box. Don't close and reopen the PR. To re-run it later: `gh workflow run update-visual-baselines.yml --ref feat/v0.3-navigation-and-prose`.
3. Do the manual checks in PR #22's checklist, mark the PR ready, and merge it.
4. Release with `npm run release -- minor`, and edit the release notes to cover open thread 4. Then write the v0.4 plan (Spec 12 Overlays), deciding threads 5, 6, and 7.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.3 (Navigation and Prose) is in draft PR #22, with all checks passing locally at `9d2e227`. Fix open threads 1–3 (the README's CSP proxy step, and the `/csp` fixture page's missing controls and `style` prop), then help me approve the baselines, finish the manual checks, merge, and release v0.3.0.
