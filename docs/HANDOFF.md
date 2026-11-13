# Handoff: design-system-react

- **Date:** 2026-11-13 (updated after releasing v0.7.0, with the v0.5–v0.7 retro's changes)

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 (Specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), v0.4 (Specs 12–13), v0.4.1, v0.5.0 (Spec 16), v0.6.0 (Spec 14), and **v0.7.0 (Spec 15), released 2026-11-13**. Storybook is at https://adeebali.github.io/design-system-react/.
  - v0.7.0 adds `Sidebar`, `Breadcrumbs`, and `Accordion`, and completes Spec 00's v1 scope.
  - The owner merged PR #33 as `e0be851`. `npm run release -- minor` made `60404cb` and tag `v0.7.0`.
  - Release: https://github.com/AdeebAli/design-system-react/releases/tag/v0.7.0, with PR #33's notes applied by hand.
- **Retro (v0.5–v0.7), 2026-11-13:** logged in `~/.claude/retros/2026-11-13-v0-5-to-v0-7-departures-shared-state-fixtures.md`.
  - The owner accepted P1, P2, P4, P5, and P6, and declined P3 (a global rule 6 sub-bullet).
  - P1, P2, P4, and P5 ship in this note's PR (thread 13). P6 is a step in the v1.0 plan (next step 3).
- **Next:** merge this note's PR, then plan v1.0 stabilization (Spec 00).

## Decisions

Architecture decisions are in `docs/adr/`.
- **Earlier rulings:** the decisions and rulings from v0.4 through v0.5 are in `git show c1b6c3d:docs/HANDOFF.md`, and v0.6's are in `git show 5185b8c:docs/HANDOFF.md`. All are unchanged.
- **Ledgers:** the v0.7 build's ledger, with every ruling and break-check, is `.superpowers/sdd/2026-11-11-v0-7-app-navigation/progress.md` (local, gitignored). v0.6's is in its sibling folder.

### v0.7 decisions (owner)

- **Execution was inline,** with one final Opus whole-branch review (2026-11-12; rejected: subagent-driven, hybrid). Code changed after it once (`929ab0e`), and that commit got its own fresh read-only Sonnet review.
- **Spec 15 amended (2026-11-13):**
  - **`collapsed` and `defaultCollapsed` apply only with `collapsible`** (lines 52, 71, and the test list). Without `collapsible`, nothing could expand the rail. Rejected: following the spec as written with a development warning, which would ship a rail that's stuck. Cost: a project that wants a fixed, non-expandable rail must set `collapsible`.
  - **The example uses `flexGrow="1"`.** It said `flex="1"`, which isn't a `Box` prop (Spec 04).
- **PR #31's manual checks** were all reported done by the owner at the start of the session: screen reader, touch and forced colors, `FileUpload` on phones, and v0.5 forced colors.

### v0.7 rulings (where Spec 15 is silent; cost if wrong)

- **`Breadcrumbs`:**
  - The chevron is a CSS mask with a `data:` URI. The CSP fixture's `img-src` allows `data:`. Cost: a stricter consumer `img-src` loses the separators; switch to the internal `ChevronRight`.
  - A forced-colors rule draws separators in `CanvasText`. A masked background is otherwise painted Canvas and disappears.
- **`Accordion`:**
  - Header heights are pinned at exactly 44px (`md`) and 32px (`sm`) for a one-line title, where the spec says "at least".
  - `AccordionItem` takes native and layout props (Spec 05's convention).
- **`Sidebar`:**
  - Layout and native props go on the side `nav`, not the small-screen bar. Cost: a margin on `Sidebar` doesn't apply below `md`, and the bar has no styling hook (thread 6).
  - The drawer copy uses `Drawer`'s default padding (`space.6`) and its card radius on the open edge.
  - The plan's `event.button !== 0` check was dropped. Browsers send a middle click as `auxclick`, not `click`.
  - When the window grows past `md` with the drawer open, focus goes to the side nav's first focusable element (the menu button is hidden there).
  - Group labels use Spec 13's uppercase style, and Chrome exposes the uppercase text in the list's name (thread 12).
- **`Drawer` (internal):** the width formula moved to `src/components/Drawer/drawerWidth.ts`, because a `.css.ts` file can only export styles. The Sidebar drawer's width rule uses `&[data-side]`, which outranks Drawer's size class whatever the stylesheet order. That's the same-layer hazard from v0.6.
- **Tests:**
  - Modifier-click tests dispatch synthetic clicks. A real Control click on macOS opens the context menu and sends no click.
  - Phone stories wait for the drawer to close after `Escape`, because axe runs after `play` and Base UI's focus guards linger.
  - The fixture's `Sidebar` sits in `app-navigation/layout.tsx`, so a link click doesn't unmount it.
  - `@base-ui/react/accordion` was added to `vite.config.ts` `optimizeDeps`.
- **Dead code removed:** a "collapse button hidden below `md`" rule. The whole side nav is hidden below `md`.
- **Owner approval:** push, the PR, and this handoff waited for the owner's approval (CLAUDE.md). The owner approved the push and PR on 2026-11-13.

## Dependencies

Checked 2026-11-13 against `npm view`. The README's "Dependencies" table is the consumer view; this is the maintainer view.

| Package | Range | Installed | Latest | Note |
| --- | --- | --- | --- | --- |
| `@base-ui/react` | `^1.9.0` | 1.9.0 | 1.9.0 | Runtime. Plans pin its API names; a newer version goes to the owner before upgrading. |
| `@vanilla-extract/recipes` | `^0.5.7` | 0.5.7 | 0.5.7 | Runtime: `createRuntimeFn`. |
| `@vanilla-extract/sprinkles` | `^1.7.1` | 1.7.1 | 1.7.1 | Runtime: `createRuntimeSprinkles`. |
| `react`, `react-dom` | peer `^19` | 19.3.1 | 19.3.1 | Dev install. |
| `typescript` | dev | 6.0.3 | 7.0.2 | A new major is out; not evaluated. |
| `vite` | dev | 8.3.6 | 8.3.8 | Patch behind. |
| `storybook` | dev | 10.6.6 | 10.6.7 | Patch behind. |
| `typescript-eslint` | dev | 8.72.1 | 8.72.2 | Both in the `npm audit` range (thread 3). |
| `vitest`, `@playwright/test` | dev | 5.1.0, 1.65.0 | same | CI's image is `mcr.microsoft.com/playwright:v1.65.0-noble`; it moves with `@playwright/test`. |
| Node | `.nvmrc` 26, `engines` `>=22` | 26.13.0 | | Thread 5. |

- **Trigger:** each plan's setup reruns `npm view` for these packages and updates this table. The v1.0 plan decides on TypeScript 7 and the patch updates.
- **Release ranges:** a runtime dependency's range changes only in a release, with a line in its notes.

## Changes

**This note's PR** (branch `docs/handoff-v0.7.0-and-retro`, from `main` at `60404cb`): the retro's P1, P2, P4, and P5 (thread 13), the README "Dependencies" table, and this note.

**The v0.7.0 release:**
- The owner merged PR #33 as `e0be851`, and CI on it passed, `visual` included.
- `npm run release -- minor` on a clean, up-to-date `main`: all checks passed, then `60404cb` (version 0.7.0), tag `v0.7.0`, push, and the GitHub release.
- The release notes are PR #33's draft plus the Full Changelog link, applied with `gh release edit v0.7.0`. Read back with `gh release view`, `diff -B` was clean.
- CI, Publish, and Storybook on `60404cb` all succeeded.

**Branch `feat/v0.7-app-navigation`** (from `main` at `5185b8c`), PR #33 (for reference):
- `8e12043` `Breadcrumbs` (plus two `verify-dist` server modules).
- `594055f` `Accordion` (plus `vite.config.ts` `optimizeDeps`).
- `9f537d3` `Sidebar` from `md` up.
- `5003e44` `Sidebar` small-screen bar and drawer; `Drawer`'s `drawerWidth.ts`.
- `8a9b52c` Docs, fixtures, and overview:
  - `docs/components.md`, `Overview/App navigation`, and `overviewPages.test.ts`.
  - The Next.js `/app-navigation` route (layout, page, and a second page) and the Vite `Sidebar`, tested in `tests/fixtures/app-navigation.spec.ts`.
- `929ab0e` Final review fixes: focus on resize-close, and `collapsed` without `collapsible`.
- `6b57d43` The Spec 15 amendments and the matching JSDoc.
- `b3bc941` Visual baselines, from the workflow (76 new, 0 changed).
- This note.

## Verification

- **Full checks:**
  - `npm ci && npm run check`, exit 0 on `8a9b52c`: unit 1062, stories and browser 1168 with axe in both modes, `verify-dist: ok`, fixtures 74 passed and 32 skipped.
  - `npm run check`, exit 0 on `929ab0e`: unit 1063, stories and browser 1169, `verify-dist: ok`, fixtures 74 passed and 32 skipped.
  - Only the known warnings appeared: npm's install-scripts notice and arethetypeswrong's ignored lines.
  - `6b57d43` is spec text and JSDoc only. Lint, typecheck, and format pass on it.
- **Break-checks:** every new assertion was seen failing with the code it checks broken. The ledger lists each one, with its line. Findings:
  - **Vacuous tests, fixed:**
    - Two fixture regexes matched the site NavBar's "Home" and "Blog" links.
    - The drawer fixture passed with the close broken, because the page unmounted the `Sidebar`.
    - The Control-click test sent no click on macOS.
    - The rail's link-name assertion failed on its lookup instead of its own line.
  - **Order-dependent warning test:** a break used up a `warnOnce` key (thread 6).
  - **Dead code removed:** see Decisions.
- **Server HTML:** each `/app-navigation` server-HTML assertion was checked against the real served HTML, with its target removed from its own `nav`.
- **Broken-tarball runs** proved three fixture tests: client-side navigation (`as` ignored), the drawer closing on a link click (`onNavigate` a no-op), and the Vite width.
- **Sometimes-failing story, fixed:** the phone stories failed axe `aria-hidden-focus` in about 1 of 3 runs. After the fix, 8 straight runs passed.
- **Reviews:**
  - Final Opus whole-branch review of `5185b8c..8a9b52c`: ready, 0 Critical, 0 Important, 5 Minor. Two were re-graded Important and fixed in `929ab0e`, with tests seen failing first.
  - Fresh Sonnet review of `8a9b52c..929ab0e`: no blocking issues. It flagged the `collapsed` gate as a departure from the spec, which the owner resolved by amending the spec. Its three Minors are in thread 6.
  - **The reviews cover all code up to `929ab0e`.** After it come only spec text and JSDoc (`6b57d43`), the baselines, and this note.
- **Visual baselines:** reviewed the app layout at desktop and phone widths in both modes, the collapsed rail, the dark default sidebar, and the long breadcrumb trail.
- **CI on `6b57d43`:** every job passed except `visual`, which failed only because the baselines didn't exist yet.
- **`npm audit` (thread 3 rerun):** 11 moderate, 0 high, 0 critical, all dev-only, the same as v0.6. `typescript-eslint` 8.72.2, the latest, is still in the affected range, so it wasn't upgraded.

**Not verified:**

- **The PR #33 manual checks:** a screen reader pass on all three, forced colors on all three, and swiping the `Sidebar` drawer closed on a real phone. PR #33 was merged, but whether they were done hasn't been reported. Trigger: next step 2.
- **Base UI behaviors the wrappers don't own** can't be broken in wrapper code, so they rest on Base UI and its tests:
  - Carried forward: `Escape`, `Backspace` on chips, and `data-popup-open`/`data-selected` on options.
  - Added in v0.7: Accordion's `beforematch` opening, the tooltip closing on unhover and opening on focus, and `Drawer`'s focus trap, scroll lock, and focus restore.
  - Trigger: none; any Base UI upgrade reruns the suite.
- **The Next fixture's no-console-errors check** wasn't broken separately; that would need a hydration mismatch in the tarball. Trigger: none, as in v0.6.
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. Carried forward.
- **Installing 0.5.x, 0.6.x, or 0.7.0 from GitHub Packages.** Only the publish job's success was seen. Trigger: none; the v0.1 install proved the pipeline. Carried forward.

## Open threads

3. **`npm audit`:** 11 moderate, all dev-only. Trigger: each release plan reruns it, and the v1.0 plan should too. Any `high` or runtime advisory stops a release.
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings.** Trigger: none; pick from this list when convenient, or in v1.0 stabilization.
   - **v0.7:**
     - **Resize-close focus target** (`src/components/Sidebar/Sidebar.tsx`, the `close` handler in the media-query effect):
       - It finds nothing when the side nav has no focusable element, so focus falls to body.
       - Its selector doesn't skip hidden elements or `tabindex="-1"` elements.
       - It finds the nav by DOM position (the bar's next sibling) rather than by a ref.
     - **The small-screen bar has no per-instance styling hook.** `className`, `style`, and layout props go to the side `nav` (`src/components/Sidebar/SidebarBar.tsx`).
   - **v0.6, v0.5, and v0.4:** unchanged; see `git show 5185b8c:docs/HANDOFF.md` thread 6 for the full lists.
7. **One intermittent browser test, not diagnosed:** `Table.browser.test.tsx` "scrollable scrolls by keyboard". It failed only on macOS under full-suite load. It passed in both `npm run check` runs this session. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. (Carried forward.)
11. **A two-row header still gets the sticky-header `scroll-padding-block-start`** (`src/components/Table/Table.css.ts:44`), so a focused cell stops about one header row below the top. Nothing is hidden. Trigger: none; pick it up when convenient. (Carried forward.)
13. **The retro's changes ship in this note's PR,** a separate PR, as the owner chose on 2026-11-13. Trigger: next step 1, merging it. The four changes:
    - **P1:** `resetWarnings()` in `src/utils/warn.ts`, called `afterEach` in `vitest.setup.ts` and `vitest.browser.setup.ts`.
      - Its test in `warn.test.ts` was seen failing first.
      - Two pairs of tests prove the hooks: `warn.test.ts` for unit and `warn.browser.test.tsx` for browser. The second test of each pair checks that its project's hook ran after the first.
      - With its project's hook removed, each pair failed only at `warn.test.ts:41` and `warn.browser.test.tsx:17`. A fresh review asked for these tests.
      - **Resolved:** thread 6's order-dependent `warnOnce` tests, the v0.4, v0.6, and v0.7 workarounds.
    - **P4:** `vite.config.ts` derives Base UI's `optimizeDeps` from the source (`baseUiEntryPoints.ts`).
      - The guard (`src/baseUiDeps.test.ts`) was rewritten. Each of its assertions was break-checked: the helper skipping a folder, a hand-written entry, and the spread removed.
      - Vite's resolved config lists all 23 entries.
      - **Not verified:** the mid-run reload it prevents couldn't be reproduced on demand, with either a cold or a warm cache missing `accordion`. Trigger: none; the guard keeps the list complete either way.
    - **P2 and P5:** two project `CLAUDE.md` "Planning workflow" bullets: the ruling ledger format, and break-checks for fixture assertions.
    - **Full check:** `npm run check` exit 0 on this branch before the hook tests and the README range fix: unit 1065, stories and browser 1169, `verify-dist: ok`, fixtures 74 passed and 32 skipped.
    - **Review:** a fresh read-only Sonnet review of the working tree over `60404cb` found no Critical issues. It found one Important gap, the hooks with no test, now covered. Its Minors:
      - The README's `lucide-react` range said "any", which was unverified; fixed.
      - The `CLAUDE.md` fixture bullet is hard to parse. It's the owner's approved wording, so it's left for the owner.
      - The rest needed no change: `resetWarnings` is not in the public API, and the helper matches only `from '…'` imports, which the guard's broader regex backs up.
    - **The review covers everything in this PR except** the two hook test pairs (written in response to it) and the README range fix.
12. **Uppercase group labels in accessible names.** Chrome exposes CSS-uppercased `SidebarGroup` labels in list names ("WORKSPACE"), as it does for Spec 13's table headers. Some screen readers spell short all-caps words letter by letter. Trigger: the PR #33 screen reader check; if it's a problem, a spec change for both components.

**Resolved this session:**
- **After v0.7's merge:**
  - CI on the baselines: CI on `e0be851` passed, `visual` included.
  - Merging and releasing v0.7.0: `60404cb`, with the notes applied and read back.
  - The retro stash: popped onto this note's branch, with nothing lost (`git stash list` is empty).
- **Old "not verified" items:**
  - The PR #31 manual checks: the owner reported all done on 2026-11-12.
  - Drag events to a disabled file input: covered by the owner's touch and drop checks in PR #31.
  - Forced colors on the v0.5 components: the owner reported it done.
  - The v0.7 plan's independent review: replaced by the whole-branch reviews above.
- **Thread 10 (v0.7 execution method):** inline plus a final Opus review.
- **Old next steps:**
  - Confirming PR #31's checks: done.
  - Merging the v0.6.0 handoff PR: PR #32 merged as `5185b8c`.
  - Starting v0.7: built. `npm view @base-ui/react version` still returned 1.9.0.

## Next steps

1. Merge this note's PR once CI passes (thread 13). Optionally, reword the `CLAUDE.md` fixture bullet.
2. Owner: confirm which PR #33 manual checks were done, including the uppercase group labels (thread 12). Anything not done goes into the v1.0 plan as a step.
3. Start v1.0 stabilization (Spec 00: API review, docs, fixes from real use). Write its plan first, and while planning, rerun `npm audit` and `npm view @base-ui/react version`. The plan:
   - collects thread 6's deferred minors;
   - includes a step that type-checks every `tsx` example in `docs/specs/*.md` and the README (retro P6; Spec 15's `flex="1"` was one such error);
   - follows the new `CLAUDE.md` ruling and fixture break-check formats;
   - updates the Dependencies table above, and decides on TypeScript 7.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.7.0 is released. Ask me whether the handoff and retro PR is merged, and which PR #33 manual checks I did. Then plan v1.0 stabilization from Spec 00, folding in thread 6, the spec-example type-check step (retro P6), the Dependencies table, and any manual checks not done.
