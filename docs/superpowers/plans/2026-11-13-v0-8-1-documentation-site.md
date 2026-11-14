# v0.8.1 Documentation Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.8.1: Storybook becomes the documentation site (Spec 18). Docs only; no runtime or API change.

**Architecture:** Titles and `storySort` set the sidebar. Every component story file gets a sibling MDX page (`<Meta of>`), with props tables from `react-docgen-typescript` (already installed through `@storybook/react-vite`; no new dependency). Shared docs-only blocks (Do/Don't, "Also accepts") live in `src/docs/blocks/`. Guide code lives in `src/docs/examples/` as real `.tsx`, type-checked by `npm run typecheck` (root `tsconfig.json` includes `src`) and shown with `?raw` + `Source`.

**Tech Stack:** As v0.8. Storybook 10.6 (`@storybook/react` 10.6.6 declared for the docgen extractor; `@storybook/addon-docs` blocks: `Meta`, `ArgTypes`, `Canvas`, `Stories`, `Source`), Playwright for the sidebar and docs-page checks.

**Spec:** `docs/specs/18-documentation-site.md`, with `docs/specs/05-component-conventions.md` (TSDoc on every public prop), `docs/specs/02-tokens-and-themes.md` (Foundations), and `docs/components.md` (groups and order). Exact values and copy rules live in the spec; this plan doesn't repeat them.

## Departures from the spec

Found while planning, against the code. Execution is native (owner, 2026-11-13). The owner reported PR #37's and PR #33's manual checks done (2026-11-13).

1. **Layout props in every props table.** Spec 18 "Props tables": the filter "keeps the props declared in this package's source", and the API section adds a line that "links to the style props page for components that accept layout props". `LayoutProps` (`src/components/Box/types.ts:152-191`) is declared in this package, so a literal filter puts its **19 rows** (`margin` … `gridRow`) at the top or bottom of every one of ~50 component tables, identical on each page.
   - **Recommended:** the filter also drops props declared in `LayoutProps`, except on `Box`, `Flex`, `Stack`, `Inline`, `Grid`, `Container`, `Center`, `Inset` (where they're the point). Every other table shows only the component's own props, and the "Also accepts" line links to `Components/Layout/Box/All style props`. Amend Spec 18's filter sentence. Cost: one `fileName`+`parent.name` check in `propFilter`.
   - **Alternative:** keep the literal filter. Cost: `Button`'s table is ~10 own rows plus 19 layout rows; the link line is then redundant.
   - **The owner accepted the recommendation (2026-11-13).** Spec 18 is amended in Task 1's commit.
2. **"A package identical to v0.8.0 apart from its version."** Spec 18 "Release" says this, but "API" requires adding missing TSDoc and `@default` tags to public props. Those comments land in `dist/index.d.ts` (api-extractor keeps TSDoc), so the published `.d.ts` differs in comments. JS and CSS stay identical.
   - **Recommended:** amend "Release" to "identical JS and CSS; `index.d.ts` differs only in doc comments". Task 11 proves it with a `dist` diff against v0.8.0. Cost: none for consumers; editors show the new docs.
   - **Alternative:** keep the line and add the missing TSDoc in v1.0. Cost: tables ship with blank descriptions, which Spec 18 calls a defect.
   - **The owner accepted the recommendation (2026-11-13).** Spec 18 is amended in Task 1's commit.

3. **Parts with no props of their own** (found in Task 4, on the real build): 12 public parts declare no props (`Code`, `Kbd`, `DialogDescription`, `DrawerDescription`, `PopoverDescription`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`, `MenuSubmenuContent`, `TableHead`, `TableBody`, `TableFoot`), so their tables show Storybook's empty state. Eleven more (`TabsList`, the three titles, the seven triggers and closes) already declare `children` and get TSDoc on it.
   - **Owner chose (2026-11-13):** no table for the 12; one line instead ("`X` has no props of its own. It accepts `p` attributes."); the coverage test exempts them by name; `index.d.ts` stays comments-only. Spec 18 is amended in Task 4's commit.
   - Rejected: a type-identical `children` (and `className` on `MenuSeparator`) with TSDoc, which adds non-comment lines to `index.d.ts`.

## Global Constraints

- Branch `docs/v0.8.1-documentation-site` from an up-to-date `main`, in the main checkout. One commit per task, one PR. **No co-author or generated-by lines in commits or the PR body** (owner's standing rule). This plan goes in Task 1's commit.
- **Setup (handoff Dependencies trigger):** rerun `npm view` for the handoff table's packages and `npm audit`. Record results for the handoff. No upgrades. Any `high` or runtime advisory stops the release.
- **Nothing shipped changes behavior.** No edits under `src/components/**` except: story `title`s, deleting `parameters.docs.description.component`, TSDoc/`@default` comments (Departure 2), and new `.mdx` files. `src/docs/**` is docs-only: add `"src/docs"` to `tsconfig.build.json`'s `exclude`, and nothing in `src/index.ts` imports it.
- Docs-only code (`src/docs/**`, `src/styles/foundations/**`) may use `style`, as `Tokens.tsx` does (Spec 18 "Left to the builder"). `scripts/check-raw-values.mjs` scans only `src/components/**/*.css.ts`, so it's unaffected.
- A "Don't" is always a code snippet (`Source` with a string), never a live render (Spec 18).
- Token values on Foundations pages are read from `softShared` / `tokens`, never retyped.
- Every MDX link to another page uses `?path=/docs/<id>` or `?path=/story/<id>` with an ID from the new titles. Review Focus 3 tests them.
- A test is seen failing before the code it covers; for existing code, break it, see the test fail, restore from a copy taken before the break (never `git checkout`).
- **Ledger** (`.superpowers/sdd/2026-11-13-v0-8-1-documentation-site/progress.md`, gitignored):
  - Each break-check: `<assertion file:line>: broke <what>, failed at <file:line>`.
  - Each ruling: `Ruling: <decision> — Spec: "<the line it touches>" | Spec silent (searched: <terms>) — <cost if wrong>`. A quoted line the decision changes is a departure: stop and ask the owner.
- Thread 7 (intermittent `Table` browser test): if it fails, find the cause in `mcr.microsoft.com/playwright:v1.65.0-noble` before rerunning.
- Don't change anything the spec or this plan doesn't ask for.

**Rulings made while planning** (copy into the ledger):
- `Ruling: guides live in src/docs/guides/*.mdx, their examples in src/docs/examples/<guide>/*.tsx, Overview pages in src/docs/overview/*.mdx, shared blocks in src/docs/blocks/; Primitives.mdx sits with the other Foundations in src/styles/foundations/ — Spec: "a real .tsx or .ts file under src/docs/examples/" (other locations spec silent; searched: "src/docs", "mdx", "Welcome") — cost if wrong: file moves only.`
- `Ruling: the baseline rename script maps old to new IDs by (importPath, story export name) for stories and by importPath for docs entries, and deletes the baselines of Overview/Typography (removed by the spec) by an explicit list; any other unmapped baseline fails it — Spec: "fails if any baseline has no mapping" — cost if wrong: none; the spec removes that page, so its baselines have nothing to map to, and leaving them would leave orphan files the workflow never deletes.`
- `Ruling: the sidebar Playwright test lives in tests/visual/sidebar.spec.ts and runs against storybook-static's manager (index.html) in the existing visual job — Spec: "Playwright, against the built Storybook manager" — cost if wrong: none; it runs where the static build already exists.`
- `Ruling: StyleProps.mdx is retitled Components/Layout/Box/All style props and is the only Components/ MDX without <Meta of> — Spec: "Box (and its All style props page)" — cost if wrong: the coverage test exempts one file by name.`

## Review Focus

Each has a test in the named task.

1. **A generic polymorphic component's table** (`Button<E>`, `Image<E>`, `Box<E>`): docgen can resolve `PolymorphicProps<E, …>` to nothing or only `as`. Not empty isn't enough: the table must show the component's own props (Task 3: `Button`'s table has `variant`, `tone`, `loading` rows; `Tabs`'s parts each have their own rows).
2. **Anchors and Find on page:** each section heading gets a linkable id (Task 3: the Button page has `#usage`, `#dos-and-donts`, `#accessibility`, `#api`, `#examples`).
3. **Links broken by the renamed IDs:** "use X instead" links, Welcome's component list, and Patterns pages pointing at old `components-button--…` IDs (Task 11: every `?path=/docs/<id>` and `?path=/story/<id>` in `src/**/*.mdx` exists in `storybook-static/index.json`).
4. **Guide examples leaking into the package:** `src/docs/examples/**` compiled into `dist` or `index.d.ts` (Task 11: `dist` diff against v0.8.0 shows no new files and only comment changes in `index.d.ts`).
5. **Live Do examples failing axe** in either mode: a `<Canvas of>` reuses a story, so a story added only for a Do must pass `test:stories` in both modes (each component task runs it).

---

### Task 1: Props-table spike (gate)

**Files:**
- Modify: `.storybook/main.ts`, `tsconfig.build.json` (`"src/docs"` exclude)
- Create: `src/components/Button/Button.mdx`, `src/components/Select/Select.mdx`, `src/components/Box/Box.mdx`, `src/components/Tabs/Tabs.mdx` (API section only, for now), this plan

**Interfaces:**
- Produces: `typescript.reactDocgen: 'react-docgen-typescript'` and `reactDocgenTypescriptOptions: { shouldExtractLiteralValuesFromEnum: true, shouldRemoveUndefinedFromOptional: true, propFilter }` in `.storybook/main.ts`, where `propFilter(prop, component)` keeps a prop iff some `prop.declarations[].fileName` is under this repo's `src/` (plus Departure 1's rule if accepted).

- [ ] **Step 1: Setup.** Branch, `npm ci`, the Global Constraints setup checks. Ledger the results.
- [ ] **Step 2: Configure docgen** and write the four API-only pages: `<Meta of={…Stories} />`, `## API`, `<ArgTypes of={X} />` for `Button`, `Select` (and each public `Select` part), `Box`, and `Tabs`, `TabsList`, `Tab`, `TabsPanel`.
- [ ] **Step 3: Inspect** each table in `npm run dev` and record in the ledger, per component: row count; whether every own prop is present (compare to the TSDoc'd props in source); whether Base UI-derived props this package re-exports are dropped; how `Responsive<…>` and token unions render in the type column (readable union, or `Responsive<SpaceToken>` unexpanded); whether descriptions and `@default`s show; whether layout props appear (Departure 1).
- [ ] **Step 4: Stop and report to the owner:** the ledger table, a screenshot of each page, and Departures 1–2. If any own prop is missing, a table is empty, or types are unreadable, propose the fallback (with what it changes on the page) and wait. **No pages are built before the owner answers.**
- [ ] **Step 5: Commit** `Configure props tables (Spec 18 spike)`, with this plan.

**Spike outcome (owner, 2026-11-13):** every own prop shows, with descriptions and defaults; no public prop type derives from Base UI. Types: `shouldExtractValuesFromUnion: true` expands `Responsive<…>` to its values, and `.storybook/preview.tsx` wraps `parameters.docs.extractArgTypes` (from `@storybook/react/entry-preview-argtypes`, now a declared devDependency at the installed 10.6.6) with `collapseTypeSummary` (`src/docs/blocks/collapseTypes.ts`) to read `ElementType`, `ReactNode`, and `ReactElement` back as names. Storybook's empty state reads "This story has no controls" (Task 3's check uses that text). A part with no documented own props (`TabsList`) gets TSDoc on `children`.

### Task 2: Sidebar, titles, and baseline rename

**Files:**
- Modify: every `src/components/**/*.stories.tsx` `title` (`Components/<Group>/<Name>`, group from Spec 18's table); the eight overview story files' titles to `Patterns/<Name>`; `ReactHookForm.mdx` and `MarkdownAndMdx.mdx` to `Guides/…`; `Box/StyleProps.mdx` to `Components/Layout/Box/All style props`; `.storybook/preview.tsx` (`parameters.options.storySort`)
- Delete: `src/components/Typography.stories.tsx` (`Overview/Typography`)
- Create: `tests/visual/sidebar.spec.ts`; the rename script in `$CLAUDE_JOB_DIR/tmp/rename-baselines.mjs` (never committed)

- [ ] **Step 1: Write the failing sidebar test** (`sidebar.spec.ts`): load `/` (the manager), expand all, and assert the top-level section labels equal `['Overview', 'Foundations', 'Components', 'Patterns', 'Guides']`, and the Components group labels equal Spec 18's table order (`Layout` … `Image`). Assert the Layout group's children start `Box, Flex, Stack`.
- [ ] **Step 2: Build the old index:** `npm run build:storybook`, copy `storybook-static/index.json` to the ledger folder as `index.before.json`. Run the sidebar test: expected FAIL on the top-level order.
- [ ] **Step 3: Retitle and sort.** `storySort.order`: `['Overview', ['Welcome', 'Accessibility'], 'Foundations', ['Colors', 'Typography', 'Spacing', 'Radii', 'Shadows', 'Motion', 'Primitives'], 'Components', [<groups, each with its component order and ['Docs', '*'] inside>], 'Patterns', [<nine in spec order>], 'Guides', [<eight in spec order>]]`. Group order and in-group order follow `docs/components.md` where it and Spec 18 differ.
- [ ] **Step 4: Rebuild, run** the sidebar test and `npm run test:stories`. Expected: pass. Break-check the sidebar assertions (swap two groups in `storySort`) and ledger.
- [ ] **Step 5: Rename baselines.** Save the new `index.json` as `index.after.json`. Run the script per the ruling, for both `desktop/` and `mobile/`, for `<id>-light.png`, `<id>-dark.png`, and `<id>.png`. Expected: every file renamed or listed for deletion, exit 0. Run `npm run test:visual` locally as a preview only: expected no "missing snapshot" for any existing story.
- [ ] **Step 6: Commit** `Reorder the sidebar, and rename baselines to the new story IDs`. Delete the script.

### Task 3: Docs blocks and docs-page checks

**Files:**
- Create: `src/docs/blocks/DoDont.tsx` (`DoDont({ children })`, `Do({ children }: { children: ReactNode })`, `Dont({ code, language? }: { code: string; language?: string })`), `src/docs/blocks/AlsoAccepts.tsx` (`AlsoAccepts({ element, layout }: { element: string; layout?: boolean })` → "Also accepts `<element>` attributes" and, with `layout`, a link to the style props page)
- Modify: `tests/visual/stories.spec.ts`, `src/components/Button/Button.mdx` (full page, the template for Tasks 4–7)

- [ ] **Step 1: Write the failing docs checks** in `stories.spec.ts`'s docs loop: `#storybook-docs h1` count is `1`; no element with text `This story has no controls`. Plus one Button-specific test: rows named `variant`, `tone`, `loading` in its props table, and elements `#usage`, `#dos-and-donts`, `#accessibility`, `#api`, `#examples` (Review Focus 1–2).
- [ ] **Step 2: Run** `npx playwright test tests/visual/stories.spec.ts -g button--docs`. Expected: FAIL (no Usage section yet).
- [ ] **Step 3: Implement** the blocks and Button's full page: sections 1–6 in Spec 18 order, Usage taken from the story's `parameters.docs.description.component` (then delete that entry), two Do/Don't pairs, Accessibility, API with `AlsoAccepts element="button" layout`, `<Stories />`.
- [ ] **Step 4: Run** Step 2 and `npm run test:stories`. Expected: pass. Break-check each new assertion (empty `ArgTypes of` target, a missing heading) and ledger.
- [ ] **Step 5: Commit** `Add docs blocks and docs-page checks`.

### Tasks 4–7: Component pages, by group

Each task, per component in its groups, follows Button's page (Task 3): sibling `X.mdx`, Spec 18's six sections, the story's description moved into Usage and deleted, the matching Patterns page's "which one to choose" text moved into Usage, `<ArgTypes of>` for every public part, missing TSDoc/`@default` added (Departure 2), and any story a live Do needs. Then: `npm run typecheck`, `npm run test:stories`, `npm run build:storybook`, `npx playwright test tests/visual/stories.spec.ts -g -- '--docs'`. Expected: pass. Commit `Add docs pages: <groups>`.

- **Task 4:** Layout (finish `Box`'s page from Task 1; `StyleProps.mdx` stays its own page), Typography (`Prose` covers `NotProse`), Icons.
- **Task 5:** Display, Forms and actions (`Button` is done; `RadioGroup` covers `Radio`).
- **Task 6:** Advanced inputs, Navigation (finish `Tabs` from Task 1; `NavBar` covers `NavBarLink`), App navigation, Overlays (`Tooltip` covers `TooltipProvider`; `Toast` covers `ToastProvider`).
- **Task 7:** Data, Feedback and display, Image. Then the coverage test:
  - [ ] **Write** `src/docs/docsCoverage.test.ts` (unit, reads files), with `it.each` over files:
    - every `*.stories.tsx` whose `title` starts `Components/` has a sibling `.mdx` containing `<Meta of=`;
    - each such `.mdx` has `## Usage`, `## Do's and don'ts`, `## Accessibility`, `## API` in that order, and `<ArgTypes of=`;
    - every PascalCase value export of `src/index.ts` except `ThemeProvider` and `ColorModeScript` appears in some `<ArgTypes of={Name}`;
    - no `*.stories.tsx` under `Components/` contains `description:` with `component:` (the Acceptance criterion).
  - [ ] **Run** `npx vitest run --project unit src/docs`. Expected: pass. Break-check each of the four (delete one `.mdx`; swap two headings; remove one `ArgTypes`; restore one description) and ledger.

### Task 8: Overview

**Files:** Create `src/docs/overview/Welcome.mdx` (`Overview/Welcome`), `src/docs/overview/Accessibility.mdx` (`Overview/Accessibility`).

- [ ] **Step 1: Failing test** in `sidebar.spec.ts`: loading `/` with no path lands on `overview-welcome--docs`. Run: FAIL.
- [ ] **Step 2: Write both pages** per Spec 18 "Overview". The version comes from `import { version } from '../../../package.json'`. Getting started links to the README's Setup instead of repeating the token and CSP steps. "Components at a glance" lists every group and component with a link to its docs ID.
- [ ] **Step 3: Run** Step 1's test and the docs checks. Expected: pass. Commit `Add Overview pages`.

### Task 9: Foundations

**Files:**
- Modify: `src/styles/foundations/Typography.mdx`, `Motion.mdx`, `Tokens.tsx`, `Tokens.test.tsx`
- Create: `src/styles/foundations/Primitives.mdx`, `src/styles/foundations/MotionDemos.tsx`, `src/styles/foundations/MotionDemos.browser.test.tsx`

**Interfaces:**
- Produces: `FontFamilies`, `LineHeights`, `LetterSpacings`, `PrimitiveRamps`, `PrimitiveScales` (in `Tokens.tsx`, reading `softShared` and `tokens`); `DurationDemo`, `EasingDemo`, `MotionInUse` (in `MotionDemos.tsx`).

- [ ] **Step 1: Failing tests.**
  - `Tokens.test.tsx`: `FontFamilies` renders three rows whose stack text equals `softShared.font.family.sans`/`mono`/`prose`, each with `SIL Open Font License`; `LineHeights` and `LetterSpacings` render one row per key of `softShared.font.lineHeight`/`letterSpacing`; `PrimitiveRamps` renders one swatch per step of every ramp in `tokens`.
  - `MotionDemos.browser.test.tsx`: after clicking **Play** on the `base` bar, the bar's computed `transition-duration` is `0.2s` and its transform changes; under `cdp()` reduced motion, `transition-duration` is `0s`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/styles` and `npx vitest run --project browser src/styles`. Expected: FAIL (exports missing).
- [ ] **Step 3: Implement** per Spec 18 "Foundations". Font row metadata (use, components, bundled weights, source package, license) is copy in `Tokens.tsx`; check each against `scripts/build-fonts.mjs` and the font packages' `package.json` before writing it (rule 5). Easing curves are SVG paths from each `cubic-bezier` value. `MotionInUse` renders a real `Dialog`, `Switch`, and `Skeleton`, each captioned with its tokens (check them in each component's `.css.ts`).
- [ ] **Step 4: Run** Step 2 and the docs checks. Break-check and ledger. Commit `Add font families, motion demos, and Primitives`.

### Task 10: Guides

**Files:** Create `src/docs/guides/{Themes,Fonts,ServerRendering,UsingTokens,MigratingToTokens,UiAndStylingStandards}.mdx` and `src/docs/examples/<guide>/*.tsx` (one file per API example).

- [ ] **Step 1: Examples first.** One `.tsx` per example in Spec 18's "Guides" bullets that uses the package API. Examples that render export a component and get a story in `src/docs/examples/<guide>/<Guide>.stories.tsx` (title `Guides/<Guide>`), and the guide's MDX attaches to it with `<Meta of>`, so the sidebar keeps exactly the eight guides with their stories inside. Run `npm run typecheck`. Expected: pass.
- [ ] **Step 2: Break-check one example per guide:** change one API use (a wrong token name in `defineTheme`, a removed prop) and see `tsc` fail at that line. Ledger six lines.
- [ ] **Step 3: Write the pages,** each example shown with `<Source code={raw} language="tsx" />` from `import raw from '../examples/…?raw'`. Server rendering's claims are each checked against `fixtures/next-app` (cite the file in the ledger). The defineTheme error copy is copied from `src/theme/` source, not paraphrased.
- [ ] **Step 4: Run** `npm run test:stories`, `npm run build:storybook`, and the docs checks. Expected: pass. Commit `Add guides`.

### Task 11: Acceptance, review, and v0.8.1

- [ ] **Step 1: Links (Review Focus 3).** Add to `tests/visual/sidebar.spec.ts` a test that collects every `?path=/(docs|story)/<id>` in `src/**/*.mdx` and asserts each `<id>` is in `storybook-static/index.json`. Break-check with one bad ID.
- [ ] **Step 2: Package diff (Review Focus 4).** Build `dist` on this branch and on `v0.8.0` (`git worktree add`), `diff -r`. Expected: only `index.d.ts`, and only comment lines (Departure 2). Ledger the diff summary.
- [ ] **Step 3: Acceptance.** Walk Spec 18's "Testing" and "Acceptance criteria", each item passed (with its test) or for the owner. `npm ci && npm run check`: exit 0, only the known warnings.
- [ ] **Step 4: Final review.** One fresh read-only reviewer on `main..HEAD`. Validate findings, fix with tests seen failing, review commits after it, and record which commit each review covered.
- [ ] **Step 5: Baselines.** Push, open a draft PR, add `update-baselines`, approve the workflow run. Review the diff: renamed baselines must show as unchanged, only docs pages new. Expected: all CI jobs pass.
- [ ] **Step 6: PR body:** release notes for `npm run release -- patch` ("Docs only: the Storybook documentation site. No API or behavior changes." plus Departure 2's note if accepted), and the owner's open manual checks (PR #37, PR #33) carried, not marked done.
- [ ] **Step 7: Handoff** through the `handoff` skill, as a reconciliation. Commit `v0.8.1 acceptance and handoff`; mark the PR ready.

**Needs the owner, not done here:** Departures 1–2, Task 1's gate, the manual checks, merging, and `npm run release -- patch`.
