# Handoff: design-system-react

- **Date:** 2026-11-14 (updated after the v0.8.1 build and its CI fix: PR #40, ready for review)

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–18 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 through v0.8.0. v0.8.0 (Spec 17, `Image`) was released 2026-11-13. Storybook: https://adeebali.github.io/design-system-react/.
- **v0.8.1 (Spec 18, documentation site): built, in draft PR #40** (https://github.com/AdeebAli/design-system-react/pull/40), branch `docs/v0.8.1-documentation-site`.
  - All 11 plan tasks are done. The plan was executed inline, with a final Opus whole-branch review and two follow-up Sonnet reviews.
  - The baseline workflow ran and committed `34b3fe6` (150 new, 4 changed).
  - CI's `visual` job then failed on 46 docs pages: props-table union members came out in a different order on each build. Fixed by sorting them (`d880d34`, then `7dd8be2`, `f6909d5`, `54cee51` after reviews), with baselines regenerated (`e044572`, `6b0f355`).
  - **Waiting on the owner:**
    1. Check that CI is green on this note's commit (the first CI run on top of the regenerated baselines).
    2. Do the manual checks in the PR body.
    3. Merge, then `npm run release -- patch` with the PR body's notes.
- **Owner's earlier manual checks:** PR #37's and PR #33's were reported done on 2026-11-13.
- **Next:** merge and release v0.8.1, then plan v1.0 stabilization (Spec 00).

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

### v0.8.1 rulings (where Spec 18 is silent; cost if wrong)

All are in the ledger. The ones a future change could trip on:
- **`@storybook/react` is a devDependency.** `.storybook/preview.tsx` wraps its `extractArgTypes`. Move it with the other Storybook packages.
- **`src/docs/exampleSource.ts`, a Storybook-only Vite plugin.** It serves `.css.ts` examples as text, because vanilla-extract compiles any `.css.ts` import, `?raw` included. It serves only `.css.ts` files under `src/docs/examples`, and it is tested.
- **Guide examples import `src/index`,** so typecheck checks them. Pages show them through `asPackage()`, which rewrites the import to the package name.
- **CSS examples live in `.css` files.** Prettier formats an MDX template literal as Markdown and breaks CSS. A test enforces this.
- **Docs-page checks** run as separate "<id> content" tests, which wait for the page to settle. They count only the page's own `h1`.
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

**Branch `docs/v0.8.1-documentation-site`** (from `main` at `aca60b5`; PR #40, draft):

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

`dba67c1` holds these fixes:
- `/docs` in `.prettierignore`;
- `children` TSDoc;
- the Primitives example;
- `PromoCard` story;
- the text-only Dos;
- the guidance wording;
- Departures 4 and 5.

This note is the last commit.

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
  - **The reviews cover every code commit up to `54cee51`.** After it come only the workflow's baselines (`6b0f355`) and this note.
- **Baselines (`34b3fe6`):**
  - Added: the new docs pages, and the 8 new guide-story images.
  - Changed: only Foundations/Typography and Foundations/Motion, both changed by this PR.
  - Renamed baselines: none changed.
- **CI on `7f81d81`:** everything passed except `visual`, which failed on 46 docs pages. CI's own diff images showed union members reordered against baselines built minutes earlier from the same content. That's a nondeterministic build output, not a flaky test.
- **CI:** on `5ec0e07`, everything passed except `visual`. Its 154 failures are exactly the 154 baselines the workflow then added or changed (298 "snapshot doesn't exist" lines, plus pixel diffs on the 4 changed pages).
  - CI on `34b3fe6` is "action_required": approving a run is the owner's.

**Not verified:**

- **CI green with the regenerated baselines, which also proves the docs pages now render the same build to build.** Trigger: CI on this note's commit. If `visual` still fails on docs pages, read its diff artifact first. Unions inside parentheses, generics, or parameters are still unsorted (thread 6).
- **The PR body's manual checks:** the site in both modes and both widths, the motion demos with reduced motion, keyboard and anchors. Trigger: the owner, before merge.
- **Contrast of PromoCard's text over its gradient.** Axe reports contrast over a background image as incomplete, so two deliberate contrast breaks didn't trip it. Axe itself is proven to run on the story (an `img` with no `alt` failed). Trigger: none; the visual baseline shows it.
- **Base UI behaviors the wrappers don't own:**
  - `Escape`, `Backspace` on chips, and `data-popup-open`/`data-selected`;
  - Accordion's `beforematch`;
  - the tooltip's hover and focus;
  - `Drawer`'s focus trap, scroll lock, and focus restore.
  - Trigger: none; any Base UI upgrade reruns the suite. (Carried forward.)
- **The Next fixture's `/feedback` no-console-errors check** wasn't broken separately. Trigger: none, as before. (Carried forward.)
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. (Carried forward.)
- **Installing 0.5.x–0.8.0 from GitHub Packages.** Only the publish job's success was seen. Trigger: none; the v0.1 install proved the pipeline. (Carried forward.)

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

**Resolved this session:**
- **Old next step 1 (v0.8.1 Tasks 2–11):** done; commits above, PR #40.
- **"`c470dc2` is unreviewed":** covered by the final Opus review of `aca60b5..b12473d`.
- **Old "Not verified" for Task 1** (full `npm run check` not run): run, exit 0, on `b12473d`, `dba67c1`, and `5ec0e07`.

## Next steps

1. **Owner:** get CI green on PR #40. Either approve the held run on `34b3fe6`, or let CI on this note's commit run. Do the PR body's manual checks, mark it ready, and squash merge.
2. **After merge:** `npm run release -- patch` (the release script checks a clean, up-to-date `main`). Apply the PR body's "Release notes" section to the GitHub release, and read it back.
3. **v1.0 stabilization (Spec 00).** Write its plan first, and while planning, rerun `npm audit` and `npm view` (the table above). The plan:
   - collects thread 6's deferred minors (v0.4–v0.8.1);
   - type-checks every `tsx` example in `docs/specs/*.md` and the README (retro P6);
   - follows the `CLAUDE.md` ruling and fixture break-check formats;
   - decides on TypeScript 7, ESLint 10 (thread 14), and the patch updates, moving `@storybook/react` with `storybook`;
   - takes thread 15's fix.

## Resume prompt

> Read `docs/HANDOFF.md`. PR #40 (v0.8.1, the documentation site) is built and reviewed. If it's merged, run `npm run release -- patch` on a clean, up-to-date `main`, apply the PR body's release notes with `gh release edit v0.8.1`, and read them back. Then start the v1.0 stabilization plan per Next steps 3, rerunning `npm audit` and `npm view` first. Ask me about any departure from a spec when it's found.
