# Handoff: design-system-react

- **Date:** 2026-11-19 (updated after fixing the post-release visual failure, PR #42)

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–18 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 through v0.8.0, as before, and **v0.8.1 (Spec 18, documentation site), released 2026-11-14**. Storybook: https://adeebali.github.io/design-system-react/.
  - The owner merged PR #40 as `983cbe5`. `npm run release -- patch` made `7c12ed5` and tag `v0.8.1`.
  - Release: https://github.com/AdeebAli/design-system-react/releases/tag/v0.8.1, with the PR body's notes applied by hand.
- **v0.8.1 build (for reference):** all 11 plan tasks done inline, with a final Opus whole-branch review and follow-up Sonnet reviews. Two CI fixes followed:
  - unstable union order (`d880d34`…`54cee51`);
  - unstable row order, and screenshots taken before docs pages finished rendering (`74356a0`, `55de232`).
- **Retro (v0.8.1), 2026-11-14:** logged in `~/.claude/retros/2026-11-14-v0-8-1-nondeterministic-docs-screenshots.md`. The owner declined all five proposals, P1–P5. Nothing from it is applied (thread 16).
- **Post-release visual failure, fixed 2026-11-19 (PR #42, `a6db535`):** CI on the release commit `7c12ed5` failed `visual` on `overview-welcome--docs` (desktop and mobile). The page shows `package.json`'s version, and its baseline was taken at 0.8.0. This note's first version (`543af1d`) was written before that CI finished. Owner decision: docs-page screenshots only for the 7 Foundations pages (see Decisions).
- **Retro (post-release failure), 2026-11-19:** logged in `~/.claude/retros/2026-11-19-v0-8-1-release-broke-welcome-screenshot.md`. Proposals P1–P4 await the owner (thread 19).
- **Owner's manual checks:** PR #37's and PR #33's were reported done on 2026-11-13. PR #40's weren't reported before the merge.
- **Next:** plan v1.0 stabilization (Spec 00).

## Decisions

Architecture decisions are in `docs/adr/`.
- **Earlier rulings:**
  - v0.4–v0.5: `git show c1b6c3d:docs/HANDOFF.md`.
  - v0.6: `git show 5185b8c:docs/HANDOFF.md`.
  - v0.7: `git show ab1c4f4:docs/HANDOFF.md`.
  - v0.8: `git show cde1a38:docs/HANDOFF.md`.
  - All are unchanged.
- **Ledgers (local, gitignored):** v0.8.1's is `.superpowers/sdd/2026-11-13-v0-8-1-documentation-site/progress.md`, with every ruling and break-check. Earlier ledgers are in sibling folders.
  - The ledgers are kept, as the earlier releases' were. Rejected: deleting the workspace, as `executing-plans` suggests, which would lose the ruling record this note points to.

### v0.8.1 decisions (owner, 2026-11-13)

Spec 18 and the plan are amended for each of these.
- **Departure 1:** `LayoutProps` rows show only on the layout components; other pages link to All style props.
- **Departure 2:** JS and CSS are identical to v0.8.0; `index.d.ts` differs only in doc comments. Checked with a `dist` diff against `v0.8.0`: only `index.d.ts` differs, and only in comment lines.
- **Departure 3:** the 12 parts with no props of their own get a one-line note (`NoOwnProps`) instead of a table. Rejected: type-identical `children` declarations, which add non-comment lines to `index.d.ts`.
- **Departure 4:** the Server rendering guide shows three files from `fixtures/next-app`, because they import `next`. Rejected: copies with hand-written `next` type stubs.
- **Departure 5:** examples that mount `ThemeProvider` stay source-only, and `PromoCard` has a story. Rejected: `PromoCard` source-only too.
- **Execution:** inline. Type column: expand unions, then collapse `ElementType`, `ReactNode`, and `ReactElement` back to their names.

- **Docs-page screenshots: Foundations only (owner, 2026-11-19, PR #42).** The 7 Foundations pages show every token family. The other 67 docs pages hold prose, props tables, and stories that have their own baselines, and their screenshots caused every v0.8.1 `visual` failure. 134 baselines removed. The unparsed-table check moved to the per-page content test. New test: the Welcome page's `[data-version]` shows `package.json`'s version. Spec 18's Testing section is amended. Rejected: masking the version and keeping all 74 (the first version of #42); dropping all docs screenshots (tokens would lose direct visual coverage).
- **Props-table row order (2026-11-14):** required props first, then by name (`parameters.docs.argTypes.sort: 'requiredFirst'` in `.storybook/preview.tsx`). Spec 18's Props tables section is amended. Rejected: alphabetical only (required props would no longer lead), and declaration order (docgen doesn't give it reliably).

### v0.8.1 rulings (where Spec 18 is silent; cost if wrong)

All are in the ledger. The ones a future change could trip on:
- **`@storybook/react` is a devDependency.** `.storybook/preview.tsx` wraps its `extractArgTypes`. Move it with the other Storybook packages.
- **`src/docs/exampleSource.ts`, a Storybook-only Vite plugin.** It serves `.css.ts` examples as text, because vanilla-extract compiles any `.css.ts` import, `?raw` included. It serves only `.css.ts` files under `src/docs/examples`, and it is tested.
- **Guide examples import `src/index`,** so typecheck checks them. Pages show them through `asPackage()`, which rewrites the import to the package name.
- **CSS examples live in `.css` files.** Prettier formats an MDX template literal as Markdown and breaks CSS. A test enforces this.
- **Docs-page checks** run as separate "<id> content" tests on all 74 docs pages, which wait for the page to settle. They count only the page's own `h1`, and include the unparsed-table check (moved there in #42).
- **The docs screenshot test (Foundations pages only, since #42) waits** for the page's own `h1`, for `settled()`, and for non-lazy images to load, before the screenshot (`tests/visual/stories.spec.ts`). Cost if wrong: a page whose layout changes without a markup change could still be captured early. The `settled()` helper compares `innerHTML` only.
- **ESLint allows devDependencies in `src/docs/**`.** `src/docs` is excluded from `tsconfig.build.json`.
- **`.prettierignore`'s `docs` is now `/docs`.** The old pattern skipped `src/docs`.
- **Props tables sort union members** (`collapseTypeSummary`, `src/docs/blocks/collapseTypes.ts`):
  - numbers by value, with `px` between `0` and `0.5`;
  - sizes from `xs` to `5xl`;
  - other strings alphabetically;
  - non-literals last;
  - unions inside plain object properties too.

  react-docgen-typescript's own order varies between builds, which made every docs page's baseline differ from one build to the next. Cost if wrong: cells don't follow the type's declaration order, which docgen doesn't expose anyway.

### Spec 18 and earlier decisions

Unchanged; see `git show cde1a38:docs/HANDOFF.md` (v0.8) and Spec 18's "Decided during planning".

## Dependencies

Checked 2026-11-13 against `npm view` (rerun at v0.8.1 setup: unchanged except as noted). The README's "Dependencies" table is the consumer view; this is the maintainer view.

| Package | Range | Installed | Latest | Note |
| --- | --- | --- | --- | --- |
| `@base-ui/react` | `^1.9.0` | 1.9.0 | 1.9.0 | Runtime. Plans pin its API names; a newer version goes to the owner before upgrading. `Image` doesn't use it. |
| `@vanilla-extract/recipes` | `^0.5.7` | 0.5.7 | 0.5.7 | Runtime: `createRuntimeFn`. |
| `@vanilla-extract/sprinkles` | `^1.7.1` | 1.7.1 | 1.7.1 | Runtime: `createRuntimeSprinkles`. |
| `react`, `react-dom` | peer `^19` | 19.3.1 | 19.3.1 | Dev install. |
| `typescript` | dev | 6.0.3 | 7.0.2 | A new major is out; not evaluated. |
| `vite` | dev | 8.3.6 | 8.3.8 | Patch behind. |
| `storybook` | dev | 10.6.6 | 10.6.7 | Patch behind. |
| `@storybook/react` | dev `^10.6.6` | 10.6.6 | 10.6.7 | New in v0.8.1 (props-table extractor). Move it with `storybook`. |
| `typescript-eslint` | dev | 8.72.1 | 8.72.2 | Both in the `npm audit` range (thread 3). |
| `eslint` | dev | 9.39.5 | **10.15.0** | New major. `npm ci` warns "This version is no longer supported" (thread 14). |
| `vitest`, `@playwright/test` | dev | 5.1.0, 1.65.0 | 5.1.0, **1.65.1** | CI's image is `mcr.microsoft.com/playwright:v1.65.0-noble`; it moves with `@playwright/test`. |
| `next` (fixture only) | `^16` | 16.4.5 | 16.4.6 | `next/image`'s `image-component.js` still starts with `'use client'` in 16.4.5 (Spec 17 relies on it). |
| Node | `.nvmrc` 26, `engines` `>=22` | 26.13.0 | | Thread 5. |

- **Trigger:** each plan's setup reruns `npm view` for these packages and updates this table. The v1.0 plan decides on TypeScript 7, ESLint, and the patch updates.
- **Release ranges:** a runtime dependency's range changes only in a release, with a line in its notes.
- **Rerun at v0.8.1 Task 1 setup:** no changes from the table above.
- **`npm audit` (2026-11-13, after the build):** 11 moderate, 0 high, 0 critical. `--omit=dev`: 0.

## Changes

**This note's branch** (`docs/handoff-after-v0.8.1`, rebased onto `main` at `a6db535`): this note.

**PR #42** (squash-merged as `a6db535`): `tests/visual/stories.spec.ts` (Foundations-only screenshots, table check moved, version test), `src/docs/overview/Welcome.mdx` (`data-version` hook), Spec 18 Testing, and 134 docs baselines deleted. Its branch's intermediate commits (`424f381` version mask, `0e58857` workflow baselines) were superseded by `eeaec22` before the squash.

**The v0.8.1 release:**
- The owner merged PR #40 as `983cbe5`. CI on it passed (all six jobs, `visual` included).
- `npm run release -- patch` on a clean, up-to-date `main` exited 0. Its checks passed:
  - unit: 1,492;
  - stories and browser: 1,220;
  - `verify-dist: ok`;
  - fixtures: 78 passed and 36 skipped.
- It then made `7c12ed5` (version 0.8.1), tag `v0.8.1`, the push, and the GitHub release.
  - The push printed "Bypassed rule violations for refs/heads/main", as the release script's own push does.
- The release notes are the PR body's "Release notes" section plus the Full Changelog link, applied with `gh release edit v0.8.1` and read back with `gh release view`.
- Publish and Storybook on `7c12ed5` succeeded. The live site's `index.json` lists `overview-welcome--docs`.

**Branch `docs/v0.8.1-documentation-site`** (for reference), squash-merged as `983cbe5`:

| Commit | What |
| --- | --- |
| `c470dc2` | Task 1: docgen config and props-table spike |
| `bb5ac8e` | Task 2: sidebar order, titles, and 1,282 baselines renamed (R100) |
| `6a241a9` | Task 3: docs blocks (`DoDont`, `AlsoAccepts`) and docs-page checks; Button page |
| `99eea3f` | Task 4: Layout, Typography, and Icons pages; Departure 3 |
| `f007196` | Task 5: Display, and Forms and actions pages |
| `50edb40` | Task 6: Advanced inputs, Navigation, App navigation, and Overlays pages |
| `3637032` | Task 7: Data, Feedback and display, and Image pages; coverage test |
| `1215883` | Task 8: Overview (Welcome, Accessibility) |
| `3df96f4` | Task 9: font families, motion demos, Primitives |
| `7ee325c` | Task 10: six guides and their examples |
| `b12473d` | Task 11: link test; `exampleSource` limited to example stylesheets |
| `dba67c1` | Final review fixes |
| `5ec0e07` | CSS examples moved into `.css` files |
| `34b3fe6` | Baselines from the workflow |
| `7f81d81` | Handoff (CI then failed: unstable union order) |
| `d880d34`, `7dd8be2`, `f6909d5`, `54cee51` | Deterministic union order in props tables, fixed after three reviews (quotes and arrows; ElementType by membership; unions inside objects; leave index signatures, methods, intersections, and `{}` alone) |
| `e044572`, `6b0f355` | Baselines regenerated by the workflow (96, then 14 docs pages) |
| `34a5f2b` | Handoff (CI then failed on 18 docs pages) |
| `74356a0` | Props-table rows sorted required-first; docs screenshot waits for settle and images; scoped `h1` wait; row-order test; Spec 18 line |
| `f38c107` | Baselines regenerated by the workflow (119 files) |
| `55de232` | The image wait skips lazy images (review finding) |

`dba67c1` holds these fixes:
- `/docs` in `.prettierignore`;
- `children` TSDoc;
- the Primitives example;
- `PromoCard` story;
- the text-only Dos;
- the guidance wording;
- Departures 4 and 5.


## Verification

- **Full checks:**
  - `npm ci && npm run check`, exit 0 on `b12473d`.
  - `npm run check`, exit 0 on `dba67c1` and on `5ec0e07`. On `5ec0e07`:
    - stories and browser 1,220 passed, with axe in both modes;
    - `verify-dist: ok`;
    - fixtures 78 passed and 36 skipped (the same as v0.8.0).
  - Unit tests were 1,401 on `b12473d`, higher after the fixes.
- **Break-checks:** every new assertion was seen failing with the behavior it checks broken; the ledger has each line.
  - **Test defects found and fixed:**
    - the empty-state check raced the props table's render;
    - the `h1` check counted story previews;
    - an `exampleSource` test's input was refused by another guard;
    - a link-count guard couldn't fail.
- **Package diff:** `dist` from clean worktrees of this branch and `v0.8.0`: only `index.d.ts` differs, in comment lines (Departure 2).
- **Reviews:**
  - Final Opus whole-branch review of `aca60b5..b12473d`: 0 Critical, 2 Important (the `.prettierignore` gap; Departures 4–5). Four Minors were re-graded Important by their effect, and all six were fixed in `dba67c1`.
  - Fresh Sonnet review of `dba67c1`: one Important (Prettier corrupted three CSS examples), fixed in `5ec0e07`.
  - Fresh Sonnet review of `5ec0e07`: ready, Minors only.
  - Union-order fix, reviewed commit by commit (fresh Sonnet each time). Each review's Important findings were fixed with tests seen failing first:
    - `d880d34`: arrows, quoted literals, and ElementType still depended on input order. Fixed in `7dd8be2`.
    - `7dd8be2`: unions nested in objects were still unsorted. Fixed in `f6909d5`.
    - `f6909d5`: index signatures, methods, intersections, and `{}` were corrupted. Fixed in `54cee51`.
    - `54cee51`: ready, with nits. One pre-existing Important was ruled deferred: no real prop is affected.
  - Fresh Sonnet review of `74356a0`: ready with nits. Its one Minor (a lazy image would hang the image wait) was fixed in `55de232`, and the same reviewer found `55de232` ready.
  - **The reviews cover every code commit up to `55de232`.** After it comes only this note.
- **Second CI fix (`74356a0`, `55de232`):**
  - Diagnosed from CI's diff artifact on `34a5f2b`:
    - Icon's `size` and `tone` rows swapped, as did Avatar's `name` and `size`.
    - Seven pages failed with "Failed to take two consecutive stable screenshots", with page heights alternating (Box: 10423 and 10526px).
  - Break-check: the row-order test (`stories.spec.ts`, "props-table rows…") failed before the sort at its `toHaveText` line, with `icon*` last.
  - Determinism, in CI's container (`playwright:v1.65.0-noble`): two separate Storybook builds, with baselines from the first and the second compared against them, `--repeat-each 2`. 296 of 296 matched. With the wait removed, 1 of 296 failed (`guides-fonts--docs`): the break is caught, but weakly.
  - The same run found the old `#storybook-docs h1` wait failing on Heading, Prose, and Sidebar, whose stories render their own `h1`. Now scoped.
  - Local: typecheck, lint, and format exit 0. `test:stories`: 1,220 passed. Docs content tests: 152 passed.
  - **CI on `55de232`: every job passed.** `visual`: 1,601 passed, 5 skipped (the `sidebar.spec.ts` skips, the same as before).
- **Baselines (`f38c107`):** only `guides-using-tokens--docs` (mobile) was viewed. The old copy had none of its four code blocks (1714px tall), and the new one has them (2971px).
- **Baselines (`34b3fe6`):**
  - Added: the new docs pages, and the 8 new guide-story images.
  - Changed: only Foundations/Typography and Foundations/Motion, both changed by this PR.
  - Renamed baselines: none changed.
- **CI on `7f81d81`:** everything passed except `visual`, which failed on 46 docs pages. CI's own diff images showed union members reordered against baselines built minutes earlier from the same content. That's a nondeterministic build output, not a flaky test.
- **CI:** on `5ec0e07`, everything passed except `visual`. Its 154 failures are exactly the 154 baselines the workflow then added or changed (298 "snapshot doesn't exist" lines, plus pixel diffs on the 4 changed pages).
  - CI on `34b3fe6` is "action_required": approving a run is the owner's.

- **PR #42:**
  - Break-checks: the version test (`stories.spec.ts:103`) failed with the shown version hardcoded to 0.0.0 (expected 0.8.1, received 0.0.0). The table check (`stories.spec.ts:94`) failed with an unparsed table line added to the Welcome page. Both files restored from copies.
  - `--list`: 7 docs screenshot tests per viewport, 74 content tests. Typecheck, lint, and format exit 0.
  - **CI on `eeaec22`: all six jobs passed.** `visual`: 1,469 passed, 5 skipped (1,601 before; −134 screenshots, +2 version tests).
  - **Independent review:** fresh Sonnet review of `eeaec22`: ready, one nit (declined: the spec bullet already names the Welcome page). Covers every code commit in #42.
- **CI on `7c12ed5` (the release commit) failed `visual`** (run 43691894436, rerun 2026-11-16 with the same result). Resolved by #42.

**Not verified:**

- **CI on `a6db535` (#42's merge to main)** was in progress when this note was written (run 44650670987). Trigger: this note's PR (#41) runs CI on top of it; if `visual` fails, read its diff artifact first.

- **The other 118 baselines in `f38c107` weren't viewed.** #42 deleted all but `foundations-primitives--docs` (desktop and mobile), which remain unviewed. Trigger: none. CI compares against them on every PR.
- **PR #40's manual checks** (the site in both modes and both widths, the motion demos with reduced motion, keyboard and anchors) weren't reported before the merge. Trigger: none; the owner can check the live site.
- **Contrast of PromoCard's text over its gradient.** Axe reports contrast over a background image as incomplete, so two deliberate contrast breaks didn't trip it. Axe itself is proven to run on the story (an `img` with no `alt` failed). Trigger: none; the visual baseline shows it.
- **Base UI behaviors the wrappers don't own:**
  - `Escape`, `Backspace` on chips, and `data-popup-open`/`data-selected`;
  - Accordion's `beforematch`;
  - the tooltip's hover and focus;
  - `Drawer`'s focus trap, scroll lock, and focus restore.
  - Trigger: none; any Base UI upgrade reruns the suite. (Carried forward.)
- **The Next fixture's `/feedback` no-console-errors check** wasn't broken separately. Trigger: none, as before. (Carried forward.)
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. (Carried forward.)
- **Installing 0.5.x–0.8.1 from GitHub Packages.** Only the publish job's success was seen. For 0.8.1, `gh api` can't list package versions: the token lacks `read:packages`. Trigger: none; the v0.1 install proved the pipeline. (Carried forward.)

## Open threads

3. **`npm audit`:** 11 moderate, all dev-only (rerun 2026-11-13). Trigger: each release plan reruns it. Any `high` or runtime advisory stops a release.
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings.** Trigger: none; pick from this list when convenient, or in v1.0 stabilization.
   - **v0.8.1 (docs):**
     - Duplicate DOM ids when a story is in a Do `<Canvas>` and again under Examples (Storybook behavior).
     - Divider's vertical `orientation` member says `@default 'horizontal'` (`src/components/Divider/Divider.tsx`).
     - No permanent guard that `src/index.ts`'s import graph can't reach `src/docs`; only this release's `dist` diff checked it.
     - `Accordion.mdx` imports `Canvas`, now unused.
     - The `children`-TSDoc test (`src/docs/docsCoverage.test.ts`):
       - matches only `ReactNode` and `ReactElement` children;
       - its two internal exemptions match by name.
     - The inline-CSS test (`src/docs/docsCoverage.test.ts`):
       - misses single-quoted or braced `language`, scss and less, and escaped backticks;
       - skips `src/styles/foundations` and non-page component MDX.
     - The Primitives example's comment says "one step lighter"; "lighter" is the accurate word.
     - `collapseTypeSummary` (`src/docs/blocks/collapseTypes.ts`):
       - the ElementType and ReactNode collapse drops any other members of the union (no current prop is affected);
       - unions inside parentheses, generics, or parameters aren't sorted;
       - byte-identity holds only for docgen's own spacing;
       - comma-separated object bodies and stray closers can move text (docgen emits neither);
       - a literal of 309 or more digits ranks as Infinity.
   - **v0.8 (`Image`, `src/components/Image/Image.tsx`):**
     - The `src`-keyed check effect doesn't rerun when only `as` changes.
     - `instanceof HTMLImageElement` fails for an img from another window.
     - An `as` component that mounts its img after the first commit gets a false warning, and the project's ref never gets the img.
     - `next/image` always gets `onError`, so it replays `img.src = img.src` once per mount.
     - Without `decode()`, an SVG with no intrinsic size, already loaded at mount, shows as failed.
     - Test gaps:
       - no real-browser test of a failed `src` swapped for an uncached good one;
       - no test of a callback ref's unmount and change, or of a dropped decode result;
       - the empty-`src` test asserts jsdom has no `decode()`;
       - `stubDecode` deletes instead of restoring.
   - **v0.8 (`Sidebar`, `7f1c8e3`):**
     - The guard checks the bare `matchMedia` but calls `window.matchMedia`.
     - The test's precondition reads jsdom's environment.
     - No close-after-open assertion where `matchMedia` is missing.
   - **v0.7, v0.6, v0.5, and v0.4:** unchanged; see `git show ab1c4f4:docs/HANDOFF.md` and `git show 5185b8c:docs/HANDOFF.md`, thread 6.
7. **One intermittent browser test, not diagnosed:** `Table.browser.test.tsx` "scrollable scrolls by keyboard". It passed in every check run this session. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. (Carried forward.)
11. **A two-row header still gets the sticky-header `scroll-padding-block-start`** (`src/components/Table/Table.css.ts:44`). Trigger: none; pick it up when convenient. (Carried forward.)
14. **`npm ci` warns that `eslint@9.39.5` is no longer supported.** Trigger: the v1.0 plan's dependency step. (Carried forward.)
15. **A local `npm run build` after `test:fixtures` renames `LayoutProps` to `LayoutProps_2` in `dist/index.d.ts`** (still exported as `LayoutProps`).
    - **Cause:** `fixtures/next-app/.next/types/routes.d.ts` declares a global `LayoutProps`, and `vite-plugin-dts`'s bundler sees it. Bisected: a fresh worktree of the same commit builds clean, and moving only that `.next` aside removes the rename.
    - **Impact:** CI and the publish job build from clean checkouts, so releases aren't affected. Local `dist` diffs are noisy.
    - **Proposed fix (owner's call):** have the d.ts build ignore `fixtures/` (for example, a `dts` `exclude`), or remove `fixtures/next-app/.next` after `test:fixtures`.
    - **Trigger:** the v1.0 plan's tooling step.

16. **Retro proposals P1–P5** (`~/.claude/retros/2026-11-14-v0-8-1-nondeterministic-docs-screenshots.md`), none applied:
    - P1: the baseline workflow re-runs the comparison against a fresh build before committing.
    - P2–P4: global `CLAUDE.md` additions to rules 3, 4, and 5.
    - P5: one shared docs-page helper.
    - **Owner declined all five (2026-11-14).** Kept here as a record only.
17. **The story screenshot test waits only for `#storybook-root` and fonts** (`tests/visual/stories.spec.ts`, story loop). Image's skeleton stories depend on load timing. It isn't failing now. Trigger: none (P1 was declined).
18. **Review nits on `74356a0`** (no action needed):
    - the content test's `.first().waitFor()` is unscoped;
    - the row-order test covers Icon only;
    - a lazy image inside the viewport isn't waited on.
    - Trigger: none; fold into thread 6.
19. **Retro proposals P1–P4** (`~/.claude/retros/2026-11-19-v0-8-1-release-broke-welcome-screenshot.md`), awaiting the owner:
    - P1 (automated): CI's visual job builds Storybook with `npm pkg set version=0.0.0-ci`, so a version on any screenshotted page fails on the PR.
    - P2 (automated): the release script waits for CI on the release commit before `gh release create`. Changes ADR 0003's order; needs ADR 0005.
    - P3 (instruction): global rule 4 sub-bullet: golden outputs mask time-varying values and assert them separately.
    - P4 (process): the handoff skill records CI's result for every commit pushed in the session.
    - Trigger: the owner's decision; until then, none applied.

**Resolved this session (2026-11-19):**
- **CI red on main since `7c12ed5`:** fixed by #42 (`a6db535`); CI on `eeaec22` green.

**Resolved earlier (2026-11-14):**
- **Old next steps 1 and 2 (merge PR #40; release v0.8.1):** done. Merged as `983cbe5`, released as `7c12ed5` and tag `v0.8.1`, with notes applied and read back.
- **"CI green with the regenerated baselines":** it wasn't (CI on `34a5f2b` failed on 18 docs pages). Fixed in `74356a0` and `55de232`, and CI is green on `55de232`.
- **Old next step 1, "get CI green":** done.
- **Old next step 1 (v0.8.1 Tasks 2–11):** done; commits above, PR #40.
- **"`c470dc2` is unreviewed":** covered by the final Opus review of `aca60b5..b12473d`.
- **Old "Not verified" for Task 1** (full `npm run check` not run): run, exit 0, on `b12473d`, `dba67c1`, and `5ec0e07`.

## Next steps

1. **v1.0 stabilization (Spec 00).** Write its plan first, and while planning, rerun `npm audit` and `npm view` (the table above). The plan:
   - collects thread 6's deferred minors (v0.4–v0.8.1);
   - type-checks every `tsx` example in `docs/specs/*.md` and the README (retro P6);
   - follows the `CLAUDE.md` ruling and fixture break-check formats;
   - decides on TypeScript 7, ESLint 10 (thread 14), and the patch updates, moving `@storybook/react` with `storybook`;
   - takes thread 15's fix.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.8.1 (the documentation site) is released. Start the v1.0 stabilization plan per Next steps 1, rerunning `npm audit` and `npm view` first. Don't apply the declined v0.8.1 retro proposals (thread 16). Ask me about the 2026-11-19 retro's P1–P4 (thread 19) before applying any. Ask me about any departure from a spec when it's found.
