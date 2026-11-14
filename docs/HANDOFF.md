# Handoff: design-system-react

- **Date:** 2026-11-13 (updated after accepting Spec 18)

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–18 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 through v0.7.0, as before, and **v0.8.0 (Spec 17, `Image`), released 2026-11-13**. Storybook is at https://adeebali.github.io/design-system-react/.
  - The owner merged PR #37 as `de30412`. `npm run release -- minor` made `4d1efa4` and tag `v0.8.0`.
  - Release: https://github.com/AdeebAli/design-system-react/releases/tag/v0.8.0, with PR #37's notes applied by hand.
- **Merged since v0.7.0:**
  - PR #34 (`ab1c4f4`): the v0.7.0 handoff and the v0.5–v0.7 retro's P1, P2, P4, and P5.
  - PR #35 (`4a0b8dc`): the reworded `CLAUDE.md` fixture bullet.
  - PR #36 (`73d1946`): **Spec 17, `Image`**. It adds a v0.8 milestone before v1.0 and amends Specs 00, 02, 05, and 11.
- **v0.8 build:** PR #37, built inline from `docs/superpowers/plans/2026-11-13-v0-8-image.md`, with one final Opus review. Its manual checks are still open (next step 1).
- **Retro (v0.8), 2026-11-13:** logged in `~/.claude/retros/2026-11-13-v0-8-image.md`. The owner accepted R1–R5, and all five are applied.
  - **R1–R3:** global `~/.claude/CLAUDE.md`, rules 1 and 4.
  - **R4:** project `CLAUDE.md` (`486fd23`).
  - **R5:** the `Sidebar` `matchMedia` guard (`7f1c8e3`).
- **Storybook audit and Spec 18, 2026-11-13:** the owner asked for an audit of Storybook and a docs site. Findings, reported to the owner:
  - No story file has `tags: ['autodocs']`, so no component has a docs page, and every `parameters.docs.description.component` is never shown (Spec 05's "usage guidance on its docs page" was unmet).
  - Overview held combined-component pages and how-tos, not an overview. `Overview/Typography` repeated `Foundations/Typography`.
  - Typography had no font families because Spec 02 listed only "scale, weights, Inter features". Motion was a table only.
- **Spec 18 (Documentation site) accepted** on branch `docs/spec-18-documentation-site`. It adds a **v0.8.1** milestone (a docs-only patch release) before v1.0, and amends Specs 00, 02, 05, 06, and 08–16.
- **Next:** write the v0.8.1 plan from Spec 18 and build it; the owner's manual checks (PR #37 and PR #33); then plan v1.0 stabilization (Spec 00).

## Decisions

Architecture decisions are in `docs/adr/`.
- **Earlier rulings:**
  - v0.4–v0.5: `git show c1b6c3d:docs/HANDOFF.md`.
  - v0.6: `git show 5185b8c:docs/HANDOFF.md`.
  - v0.7: `git show ab1c4f4:docs/HANDOFF.md`.
  - All are unchanged.
- **Ledgers (local, gitignored):** v0.8's is `.superpowers/sdd/2026-11-13-v0-8-image/progress.md`, with every ruling and break-check. v0.6's and v0.7's are in sibling folders.

### Spec 18 decisions (owner, 2026-11-13)

- Sidebar: Overview, Foundations, Components (grouped as `docs/components.md`), Patterns, Guides. Rejected: Guides between Foundations and Components.
- The current Overview pages move to **Patterns** (rejected: keep in Overview; delete).
- One scrolling docs page per component (rejected: tabs, which hide content from Find on page).
- "Primitives" means the raw `tokens` layer (rejected: `Box` and the layout components).
- "Migrating to tokens" means moving hard-coded CSS to `vars` and `--ds-*`.
- The UI and styling standards in Spec 18 are accepted as written.
- The site ships as release v0.8.1 (rejected: a `workflow_dispatch` deploy with no version bump).
- A one-off, uncommitted script renames visual baselines from old story IDs to new before the baseline workflow runs (rejected: letting the workflow regenerate all 1,302 as new).

### v0.8 decisions (owner)

- **Execution was inline,** with one final Opus whole-branch review (rejected: subagent-driven).
- **Departure 1, accepted:** `Box`'s `borderRadius` accepts `image`, because the sprinkle reads every `radius` token. Spec 04's list is amended. Rejected: filtering `image` out of the sprinkle.
- **`Image` has a `display` prop** (Box display values, responsive, default `block`).
  - Spec 17 said "Layout props can change `display`", but `LayoutProps` has no `display`. The owner was asked when it was found.
  - Rejected: no prop, changing it with `className`/`style`.
  - Spec 17's table and Structure line are amended.
- **The PR also carries** `7f1c8e3` (R5) and `486fd23` (R4), at the owner's request.

### v0.8 rulings (where Spec 17 is silent; cost if wrong)

- **The `next/image` type tests live in `fixtures/next-app/app/(site)/image/types.test-d.tsx`,** checked by the fixture's `tsc`. Cost: they run in `test:fixtures`/`check`, not `npm test`.
- **`ratio` is a CSS variable written into the frame's `style`,** with no `@vanilla-extract/dynamic`. Cost: a project's `style={{ aspectRatio }}` wins over it.
- **The `img` sets its own block size and `border-radius: inherit`,** so `Prose`'s bare `img` rules don't reach it.
- **Load state** is keyed on `src` identity, so a static import works.
  - A layout effect keyed on `src` checks `complete`. A width of 0 is confirmed with `decode()`, and with no `decode()` (jsdom) it counts as failed.
  - The project's `ref` is set by a layout effect keyed on `[ref, as]`, so it isn't called on every render.
- **`onLoad`/`onError` commit `Image`'s state with `flushSync` first.** `next/image` calls `onLoad` from a `decode()` promise. Cost: a warning if a future `next/image` calls it mid-commit.
- **The forced-colors frame border uses `:has()`.** Cost: Chrome 105+, Safari 15.4+, Firefox 121+.
- **Tests:**
  - A "still loading" state in browser tests is a lazy image 20000px below the fold.
  - The pre-hydration fixture holds only `/_next/static/chunks/**/*.js`. Holding CSS blocks parsing.
  - The fixture's console check ignores the deliberate 404.

## Dependencies

Checked 2026-11-13 against `npm view`. The README's "Dependencies" table is the consumer view; this is the maintainer view.

| Package | Range | Installed | Latest | Note |
| --- | --- | --- | --- | --- |
| `@base-ui/react` | `^1.9.0` | 1.9.0 | 1.9.0 | Runtime. Plans pin its API names; a newer version goes to the owner before upgrading. `Image` doesn't use it. |
| `@vanilla-extract/recipes` | `^0.5.7` | 0.5.7 | 0.5.7 | Runtime: `createRuntimeFn`. |
| `@vanilla-extract/sprinkles` | `^1.7.1` | 1.7.1 | 1.7.1 | Runtime: `createRuntimeSprinkles`. |
| `react`, `react-dom` | peer `^19` | 19.3.1 | 19.3.1 | Dev install. |
| `typescript` | dev | 6.0.3 | 7.0.2 | A new major is out; not evaluated. |
| `vite` | dev | 8.3.6 | 8.3.8 | Patch behind. |
| `storybook` | dev | 10.6.6 | 10.6.7 | Patch behind. |
| `typescript-eslint` | dev | 8.72.1 | 8.72.2 | Both in the `npm audit` range (thread 3). |
| `eslint` | dev | 9.39.5 | | New in v0.8: `npm ci` warns "This version is no longer supported" (thread 14). |
| `vitest`, `@playwright/test` | dev | 5.1.0, 1.65.0 | 5.1.0, **1.65.1** | CI's image is `mcr.microsoft.com/playwright:v1.65.0-noble`; it moves with `@playwright/test`. |
| `next` (fixture only) | `^16` | 16.4.5 | 16.4.6 | `next/image`'s `image-component.js` still starts with `'use client'` in 16.4.5 (Spec 17 relies on it). |
| Node | `.nvmrc` 26, `engines` `>=22` | 26.13.0 | | Thread 5. |

- **Trigger:** each plan's setup reruns `npm view` for these packages and updates this table. The v1.0 plan decides on TypeScript 7, ESLint, and the patch updates.
- **Release ranges:** a runtime dependency's range changes only in a release, with a line in its notes.

## Changes

**This branch** (`docs/spec-18-documentation-site`, from `main` at `cde1a38`): Spec 18, its amendments to Specs 00, 02, 05, 06, and 08–16, and this note.

**The previous note's branch** (`docs/handoff-v0.8.0`): merged as PR #38 (`cde1a38`).

**The v0.8.0 release:**
- The owner merged PR #37 as `de30412`, and CI on it passed (all six jobs, `visual` included).
- `npm run release -- minor` on a clean, up-to-date `main`: all checks passed (unit 1114, stories and browser 1212, `verify-dist: ok`, fixtures 78 passed and 36 skipped), then `4d1efa4` (version 0.8.0), tag `v0.8.0`, push, and the GitHub release.
  - The version commit's push printed "Bypassed rule violations for refs/heads/main" (the pull-request rule and required checks), as the release script's own push does.
- The release notes are PR #37's draft plus the Full Changelog link, applied with `gh release edit v0.8.0`. Read back with `gh release view`, `diff -B` was clean.
- CI, Publish, and Storybook on `4d1efa4` all succeeded.

**Branch `feat/v0.8-image`** (for reference), squash-merged as `de30412`:

- `c70c976` `radius.image`, used by `Prose` images and accepted by `Box`, with the Spec 04 amendment and the v0.8 plan.
- `dd0434b` `Image` (behavior, unit and type tests), the internal `ImageOff` icon, and the Spec 17 `display` amendment.
- `ce42f6d` `Image` styles, browser tests, and stories with docs.
- `ee5fb25` Fixtures:
  - the Next `/image` server page, with `hero.png` and `types.test-d.tsx`;
  - the Vite `Image`;
  - `tests/fixtures/image.spec.ts`.
- `7e997c8` `docs/components.md`.
- `16ece2d` Final review fixes:
  - the ref set once;
  - a warning for a missing ref;
  - `decode()` confirmation;
  - the fallback docs.
- `b9d4fdd` No `decode()` counts as failed (the jsdom crash found by the fix review).
- `3cb2d4c` Visual baselines from the workflow: 44 new, 2 changed (the Radii docs page).
- `7f1c8e3` R5: the `Sidebar` drawer opens where `matchMedia` is missing.
- `486fd23` R4: the project `CLAUDE.md` spec-acceptance step updates this note when the milestones change.
- This note.

**Outside the repo:** `~/.claude/CLAUDE.md` rules 1 and 4 (R1–R3), and the retro log.

## Verification

- **Full checks:** `npm ci && npm run check`, exit 0, on `7e997c8`, `16ece2d`, and `b9d4fdd`. On `b9d4fdd`:
  - unit 1113;
  - stories and browser 1212, with axe in both modes;
  - `verify-dist: ok`;
  - fixtures 78 passed and 36 skipped.
  - The known warnings appeared, plus the new ESLint deprecation warning (thread 14).
- **After `b9d4fdd`:**
  - `7f1c8e3`: Sidebar unit 21, Sidebar browser 39, lint, and typecheck pass. A full `check` hasn't run on it; CI on PR #37 will.
  - `486fd23` is `CLAUDE.md` text only.
- **Break-checks:** every new assertion was seen failing with its own code broken, and the ledger lists each line. That includes:
  - each fixture assertion, against a tarball broken in one way;
  - both server-HTML regexes, against the real served HTML with `data-loading` removed from their own frame;
  - both fixture type-test lines.
  - **Vacuous tests, fixed:**
    - "warns once" rerendered one `Image`, which didn't rerun the effect.
    - The `Prose` guard (`height > 300`) passed with no ratio at all.
  - **Ineffective breaks, redone:**
    - the skeleton width (`Skeleton`'s `width="full"` utility wins);
    - "0 width is always error" (it kept the `then` callbacks).
- **Reviews:**
  - Final Opus whole-branch review of `73d1946..7e997c8`: ready, 0 Critical, 0 Important. Four Minors were re-graded Important by effect and fixed in `16ece2d`.
  - Fresh Sonnet review of `16ece2d`: one Important (unguarded `decode()`), fixed in `b9d4fdd`.
  - Fresh Sonnet review of `b9d4fdd`: ready, Minors only.
  - Fresh Sonnet review of `7f1c8e3`: ready, Minors only (thread 6).
  - **The reviews cover all code on the branch, up to `7f1c8e3`.** After it come only `CLAUDE.md` text (`486fd23`) and this note.
- **Visual baselines (`3cb2d4c`):** reviewed ratios, radii, failed (dark), in a card (dark), in Prose, and the Radii docs.
- **`npm audit`:** 11 moderate, 0 high, 0 critical, all dev-only (`--omit=dev`: 0), the same as v0.7.

**Not verified:**

- **The PR #37 manual checks:**
  - a screen reader pass on a loaded, a decorative, and a failed image;
  - forced colors;
  - Firefox and Safari with a `viewBox`-only SVG, cached and fresh. Only Chromium was checked; the `decode()` fix covers that case by construction.
  - Trigger: next step 1.
- **The PR #33 manual checks** (Sidebar, Breadcrumbs, Accordion: screen reader, forced colors, swiping the drawer on a real phone) haven't been reported done. Trigger: next step 1. (Carried forward.)
- **Base UI behaviors the wrappers don't own** can't be broken in wrapper code, so they rest on Base UI and its tests:
  - `Escape`, `Backspace` on chips, and `data-popup-open`/`data-selected`;
  - Accordion's `beforematch`;
  - the tooltip's hover and focus;
  - `Drawer`'s focus trap, scroll lock, and focus restore.
  - Trigger: none; any Base UI upgrade reruns the suite. (Carried forward.)
- **The Next fixture's `/feedback` no-console-errors check** wasn't broken separately. Trigger: none, as before. v0.8's `/image` console check was broken and proven.
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. (Carried forward.) Spec 17's equivalent for `Image` has a fixture test.
- **Installing 0.5.x–0.8.0 from GitHub Packages.** Only the publish job's success was seen. Trigger: none; the v0.1 install proved the pipeline. (Carried forward.)

## Open threads

3. **`npm audit`:** 11 moderate, all dev-only. Trigger: each release plan reruns it, and the v1.0 plan should too. Any `high` or runtime advisory stops a release.
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings.** Trigger: none; pick from this list when convenient, or in v1.0 stabilization.
   - **v0.8 (`Image`, `src/components/Image/Image.tsx`):**
     - The `src`-keyed check effect doesn't rerun when only `as` changes. A remounted, already-complete img could stay loading, and the ref warning isn't re-evaluated.
     - `instanceof HTMLImageElement` fails for an img from another window (an iframe portal or popout). That gives a false warning and no early-complete check.
     - An `as` component that mounts its img after the first commit gets a false warning, and the project's ref never gets the img.
     - `next/image` always gets `onError`, so it replays `img.src = img.src` once per mount.
     - A browser without `decode()` shows an SVG with no intrinsic size, already loaded at mount, as failed.
     - **Test gaps:**
       - no real-browser test of a failed `src` swapped for an uncached good one;
       - no test of a callback ref's unmount and change, or of the decode result being dropped after a `src` change;
       - the empty-`src` test asserts jsdom has no `decode()`;
       - `stubDecode` deletes instead of restoring.
   - **v0.8 (`Sidebar`, `7f1c8e3`):**
     - The guard checks the bare global `matchMedia` but calls `window.matchMedia`. These are the same everywhere checked; the fix is to call the bare `matchMedia(md)`, as `colorModeStore.ts` does.
     - The test's precondition reads jsdom's environment. `vi.stubGlobal('matchMedia', undefined)` would make it explicit.
     - No close-after-open assertion where `matchMedia` is missing.
   - **v0.7:** unchanged; see `git show ab1c4f4:docs/HANDOFF.md` thread 6 (Sidebar resize-close focus target, and the small-screen bar's styling hook).
   - **v0.6, v0.5, and v0.4:** unchanged; see `git show 5185b8c:docs/HANDOFF.md` thread 6.
7. **One intermittent browser test, not diagnosed:** `Table.browser.test.tsx` "scrollable scrolls by keyboard". It passed in all three `npm run check` runs this session. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. (Carried forward.)
11. **A two-row header still gets the sticky-header `scroll-padding-block-start`** (`src/components/Table/Table.css.ts:44`). Trigger: none; pick it up when convenient. (Carried forward.)
12. **Uppercase group labels in accessible names** (`SidebarGroup`, as in Spec 13's table headers). Trigger: the PR #33 screen reader check (next step 1). (Carried forward.)
14. **`npm ci` warns that `eslint@9.39.5` is no longer supported.** It's new in v0.8's runs, and the dependency isn't new. Trigger: the v1.0 plan's dependency step.

**Resolved this session:**
- **Thread 13:** the retro's P1, P2, P4, and P5 shipped in PR #34 (`ab1c4f4`). The `CLAUDE.md` fixture bullet was reworded in PR #35 (`4a0b8dc`).
- **Old next step 1** (merge the handoff PR): done, PR #34.
- **Old next step 3** (start v1.0): moved after v0.8, which Spec 17 inserted (next step 2).
- **After v0.8's build:**
  - CI on PR #37 before ready: passed on `528d546`, all six jobs. The owner marked the PR ready.
  - Merge and release: PR #37 merged as `de30412`; v0.8.0 released as `4d1efa4`, with the notes applied and read back.

## Next steps

1. **Owner:**
   - Do PR #37's manual checks: screen reader, forced colors, Firefox and Safari with a `viewBox`-only SVG.
   - Report PR #33's: the screen reader including thread 12, forced colors, and swiping the drawer on a real phone.
   - Anything not done goes into the v1.0 plan as a step.
2. **v0.8.1, Spec 18:** write its plan first (`superpowers:writing-plans`). Its first task is the props-table spike on `Button`, `Select`, `Box`, and `Tabs` (Spec 18, "Props tables"); a shortfall goes to the owner before any pages are built. The plan carries the CLAUDE.md ruling and break-check ledger formats. Release with `npm run release -- patch` after merge.
3. **v1.0 stabilization** (Spec 00: API review, docs, fixes from real use). Write its plan first, and while planning, rerun `npm audit` and `npm view` (the table above). The plan:
   - collects thread 6's deferred minors (v0.4–v0.8);
   - type-checks every `tsx` example in `docs/specs/*.md` and the README (retro P6; v0.8 did it for Spec 17 only);
   - follows the `CLAUDE.md` ruling and fixture break-check formats;
   - decides on TypeScript 7, ESLint (thread 14), and the patch updates;
   - includes any manual checks still not done.

## Resume prompt

> Read `docs/HANDOFF.md` and `docs/specs/18-documentation-site.md`. Spec 18 is accepted. Write the v0.8.1 implementation plan from it, starting with the props-table spike, and bring me any departures before building. Ask which manual checks I did on PR #37 and PR #33. v1.0 stabilization comes after v0.8.1, folding in thread 6, the spec-example type-check step (retro P6), the Dependencies table, thread 14, and any manual checks not done.
