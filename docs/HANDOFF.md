# Handoff: design-system-react

- **Date:** 2026-11-13 (updated after the v0.7 build; PR #33 open)

## Goal

Build `@adeebali/design-system-react`, a general-purpose React design system. Specs 00–16 are accepted, and Spec 00 sets the release milestones.

## Status

- **Released:** v0.1 (Specs 01–07), v0.2 (Specs 08–09), v0.3 (Specs 10–11), v0.4 (Specs 12–13), v0.4.1, v0.5.0 (Spec 16), and v0.6.0 (Spec 14). Storybook is at https://adeebali.github.io/design-system-react/.
- **v0.7 built (Spec 15):** `Sidebar`, `Breadcrumbs`, and `Accordion`, on branch `feat/v0.7-app-navigation`, PR #33 (https://github.com/AdeebAli/design-system-react/pull/33). This completes Spec 00's v1 scope.
  - The PR is a draft until this note's commit, then marked ready.
  - Visual baselines are committed (`b3bc941`).
  - CI on the baseline commit needs the owner's **Approve workflows to run**.
- **Next:** the owner's manual checks, approving CI, merging, `npm run release -- minor`, then v1.0 stabilization (Spec 00), which has no plan yet.

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

## Changes

**Branch `feat/v0.7-app-navigation`** (from `main` at `5185b8c`), PR #33:
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

- **CI on `b3bc941` (the baselines).** It needs **Approve workflows to run**. Trigger: next step 1.
- **The PR #33 manual checks:** a screen reader pass on all three, forced colors on all three, and swiping the `Sidebar` drawer closed on a real phone. Trigger: next step 2, as unchecked boxes in PR #33.
- **Base UI behaviors the wrappers don't own** can't be broken in wrapper code, so they rest on Base UI and its tests:
  - Carried forward: `Escape`, `Backspace` on chips, and `data-popup-open`/`data-selected` on options.
  - Added in v0.7: Accordion's `beforematch` opening, the tooltip closing on unhover and opening on focus, and `Drawer`'s focus trap, scroll lock, and focus restore.
  - Trigger: none; any Base UI upgrade reruns the suite.
- **The Next fixture's no-console-errors check** wasn't broken separately; that would need a hydration mismatch in the tarball. Trigger: none, as in v0.6.
- **"A failed image shows initials after hydration" (Spec 16)** is tested with a client render. Trigger: none; the owner can ask for a fixture test. Carried forward.
- **Installing 0.5.x or 0.6.x from GitHub Packages.** Only the publish job's success was seen. Trigger: none; the v0.1 install proved the pipeline. Carried forward.

## Open threads

3. **`npm audit`:** 11 moderate, all dev-only. Trigger: each release plan reruns it, and the v1.0 plan should too. Any `high` or runtime advisory stops a release.
4. **Inter comes from `inter-ui`,** because Fontsource's files drop `cv05` and `cv08`. Trigger: a test pins the 4.1.1 ranges. (Carried forward.)
5. **`engines.node` is `>=22`.** Trigger: the release script refuses to release after April 30, 2027, until the floor and CI's Node matrix are raised. (Carried forward.)
6. **Deferred minor findings.** Trigger: none; pick from this list when convenient, or in v1.0 stabilization.
   - **v0.7:**
     - **Proposal (rule 3):** `warnOnce`'s module-level `seen` set makes warning tests order-dependent. A test earlier in a file that triggers the same key fails the warning test for the wrong reason. The one-line fix: export a test-only reset from `src/utils/warn.ts`, and call it in `afterEach` in the test setup. This affects every component's warning tests.
     - **Resize-close focus target** (`src/components/Sidebar/Sidebar.tsx`, the `close` handler in the media-query effect):
       - It finds nothing when the side nav has no focusable element, so focus falls to body.
       - Its selector doesn't skip hidden elements or `tabindex="-1"` elements.
       - It finds the nav by DOM position (the bar's next sibling) rather than by a ref.
     - **The small-screen bar has no per-instance styling hook.** `className`, `style`, and layout props go to the side `nav` (`src/components/Sidebar/SidebarBar.tsx`).
   - **v0.6, v0.5, and v0.4:** unchanged; see `git show 5185b8c:docs/HANDOFF.md` thread 6 for the full lists.
7. **One intermittent browser test, not diagnosed:** `Table.browser.test.tsx` "scrollable scrolls by keyboard". It failed only on macOS under full-suite load. It passed in both `npm run check` runs this session. Trigger: CI on every PR and each release's `npm run check`. If it fails, find the cause in the CI image before rerunning. (Carried forward.)
11. **A two-row header still gets the sticky-header `scroll-padding-block-start`** (`src/components/Table/Table.css.ts:44`), so a focused cell stops about one header row below the top. Nothing is hidden. Trigger: none; pick it up when convenient. (Carried forward.)
12. **Uppercase group labels in accessible names.** Chrome exposes CSS-uppercased `SidebarGroup` labels in list names ("WORKSPACE"), as it does for Spec 13's table headers. Some screen readers spell short all-caps words letter by letter. Trigger: the PR #33 screen reader check; if it's a problem, a spec change for both components.

**Resolved this session:**
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

1. Owner: in PR #33's merge box, select **Approve workflows to run** for `b3bc941` and this note's commit, so `visual` runs against the new baselines. Don't close and reopen the PR.
2. Owner: do the PR #33 manual checks, including the uppercase group labels (thread 12).
3. Merge PR #33 once CI passes, then on a clean, up-to-date `main` run `npm run release -- minor`. Apply PR #33's "Release notes draft" with `gh release edit v0.7.0`, and read it back with `gh release view`.
4. Start v1.0 stabilization (Spec 00: API review, docs, fixes from real use). Write its plan first, collecting thread 6's deferred minors and the `warnOnce` proposal, and rerun `npm audit` and `npm view @base-ui/react version` while planning.

## Resume prompt

> Read `docs/HANDOFF.md`. v0.7 (Sidebar, Breadcrumbs, Accordion) is in PR #33 with baselines committed. Ask me whether CI passed after I approved the workflows, which PR #33 manual checks I did, and whether PR #33 is merged; then release v0.7.0 with `npm run release -- minor` and the PR's release notes, and plan v1.0 stabilization from Spec 00, folding in thread 6 and the `warnOnce` proposal.
