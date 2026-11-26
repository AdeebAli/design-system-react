# v0.9 API Ergonomics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.9 (Spec 19): grid counts that take numbers with no limit, an internal layout helper in place of `box()` for the 37 rerouted components, TSDoc value lists, literal hovers, and a type-checked `@example` on every component.

**Architecture:** `gridTemplateColumns`, `gridColumn`, and `gridRow` leave sprinkles (ADR 0005). A new `.css.ts` file emits one class per prop and breakpoint that reads a fixed-name CSS variable, and a runtime function turns the prop values into `{ className, style }` with the variable set inline. `Box` and a new internal `layoutStyle()` helper use it. The public `box()` drops the three props. Editor help is checked by a build-time script that runs the TypeScript language service against `dist/`.

**Tech Stack:** As v0.8.1. No new dependencies.

**Spec:** `docs/specs/19-api-ergonomics.md` and `docs/adr/0005-unbounded-grid-counts-with-css-variables.md`, with Specs 04, 05, 06, and 09 (already amended by Spec 19). Read the task's spec section before starting it. This plan doesn't repeat the spec's tables.

## Departures from the spec

None found while planning. If one comes up during the build, stop and ask the owner before building on it (global rule 6).

## Global Constraints

- Branch `feat/v0.9-api-ergonomics` from an up-to-date `main`, in the main checkout. One commit per task, one PR. **No co-author or generated-by lines in commits or the PR body** (owner's standing rule). This plan goes in Task 1's commit.
- **Setup (rerun at the start):** `npm view` for the handoff's Dependencies table, and `npm audit`. At planning (2026-11-25): `@base-ui/react` 1.9.0, `@vanilla-extract/recipes` 0.5.7, `@vanilla-extract/sprinkles` 1.7.1, `react` 19.3.1 (all unchanged); `typescript` 7.0.2, `vite` 8.3.8, `storybook` and `@storybook/react` **10.6.9**, `typescript-eslint` **8.74.0**, `eslint` 10.15.0, `vitest` **5.1.1**, `@playwright/test` 1.65.1, `next` 16.4.6. Audit: 11 moderate, 0 high, 0 critical; `--omit=dev`: 0. No upgrades in this plan; record the results for the handoff table. Any `high` or runtime advisory stops the release.
- **Every Node command** is prefixed `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
- CSS variable names: `--ds-grid-columns-{bp}`, `--ds-grid-column-{bp}`, `--ds-grid-row-{bp}`, for `bp` in `base`, `sm`, `md`, `lg`, `xl` (15 in all). They are fixed strings, not `createVar()` hashes, so the fixture and docs can name them.
- The 15 classes live in `utilitiesLayer` and are declared in breakpoint order, so a larger breakpoint wins. `full` is one class per axis per breakpoint (`1 / -1`), with no variable.
- Only the custom property goes inline. `grid-*` is always set by a class. A consumer's `style` is spread after the variables.
- A valid count is a safe positive integer: a number with `Number.isSafeInteger(n) && n > 0`, a string matching `/^\d+$/` that parses to one, or `span-` plus such a string. `'full'` is valid for spans only. The variable gets the parsed number (`'016'` → `16`). Anything else logs one `warnOnce` naming the component (`Box`, or the component that called the helper), the prop, the value, and the fix, and adds no class or variable for that breakpoint.
- Layout components stay without `"use client"`. `Grid.js` joins `verify-dist`'s `serverModules`.
- Development warnings use `warnOnce` from `src/utils/warn.ts`. `resetWarnings()` already runs after each test.
- A test is written and seen failing before the code it covers. For code that exists, break it, watch the test fail at the asserted line, and restore the file from a copy taken just before the break (never `git checkout`/`git restore`).
- **Ledger** (`.superpowers/sdd/2026-11-25-v0-9-api-ergonomics/progress.md`, gitignored):
  - Each break-check: `<assertion file:line>: broke <what>, failed at <file:line>`. A break that fails at another line doesn't prove that assertion.
  - Each ruling: `Ruling: <decision> — Spec: "<the line it touches>" | Spec silent (searched: <terms>) — <cost if wrong>`. If a quoted line says something the decision changes, it's a departure: stop and ask the owner.
  - Fixture assertions are break-checked as `CLAUDE.md` says: server HTML saved, the target removed from its own element, passes on the real HTML and fails on the stripped copy.
- Visual baselines come only from the `update-visual-baselines` workflow. Local `test:visual` is a preview.
- Thread 7 (intermittent `Table` browser test): if it fails, find the cause in CI's image before rerunning.
- Don't change anything a spec or this plan doesn't ask for.

**Rulings made while planning** (copy into the ledger):
- `Ruling: @example blocks are type-checked by scripts/extract-examples.mjs, which npm run typecheck runs before tsc; it writes one module per example to .generated/examples/ (gitignored, included by tsconfig.json), rewriting '@adeebali/design-system-react' imports to src/index — Spec: "Examples are type-checked in npm run typecheck (proposed: extracted into a generated file that's type-checked, mechanism left to the plan)" — cost if wrong: an editor shows .generated/ errors until typecheck runs once; the alternative is an in-memory compiler-API test in npm test, which isn't npm run typecheck.`
- `Ruling: an @example is a fenced tsx block of optional import lines followed by one JSX expression; the extractor wraps the expression as "export function Example() { return (<expr>); }" — Spec silent (searched: "@example", "smallest useful usage", "TSX") — cost if wrong: an example that needs state or a hook must be written as a component expression; none in v0.9 do.`
- `Ruling: "every public component" means each component a src/components/<Dir>/index.ts exports, except the parts listed in COMPOUND_PARTS in scripts/check-editor-help.mjs; parts get no @example — Spec: "Compound components have the example on the root part (for example Tabs)." — cost if wrong: a part someone hovers first shows no example; its root's hover has it.`
- `Ruling: the hover and @example checks run in npm run build (verify-dist calls scripts/check-editor-help.mjs) against dist/index.d.ts, with the repo's TypeScript (6.0.3) language service — Spec: "checked with the language service against the built dist/" — cost if wrong: an editor on another TypeScript version may print hovers differently; TS 7 is decided in v1.0.`
- `Ruling: the CSS variable names are fixed strings (--ds-grid-columns-md, ...), not createVar() hashes — Spec: "The CSS variable names, within the --ds-* convention" (left to the builder) — cost if wrong: projects may start reading the names, making them de facto API.`
- `Ruling: Box drops a nullish breakpoint value as box() does today, before validation, so { base: 2, md: undefined } warns nothing — Spec silent (searched: "undefined", "nullish", "invalid") — cost if wrong: none; it matches every other style prop.`

## Review Focus

Each has a test in the named task.

1. **`style` as a function on a Base UI part (Task 3).** Base UI parts accept `style={(state) => …}`. Merging the grid variables must keep calling it with the state, not spread a function.
2. **A consumer `style` on a rerouted component that also gets a count (Task 3).** `<Input gridColumn={14} style={{ color: 'red' }} />` keeps both, on the element that has the layout class (Input's wrapper, not the inner `<input>`).
3. **Nested grids (Task 2).** A child `Box` with `gridColumn={{ md: 3 }}` inside a parent with `gridColumn={14}` spans 3 at `md`, and at `base` doesn't inherit the parent's span through the inherited variable.
4. **`Card`'s `span` with a number `gridColumn` (Task 2).** `<Card span="2x1" gridColumn={5}>` spans 5 columns; `span` is unchanged otherwise.
5. **Huge or odd numbers (Task 2).** `columns={1e21}`, `columns="1e3"`, `columns={Infinity}` warn and add nothing; `columns={100}` renders 100 columns.

---

### Task 1: Hover probe and the editor-help check

The gate for the rest of the editor-help work. No library behavior changes.

**Files:**
- Create: `scripts/check-editor-help.mjs`, `scripts/check-editor-help.test.mjs`, this plan
- Modify: `scripts/verify-dist.mjs` (call the check), `src/components/Button/tones.ts` and `src/components/Box/types.ts` only for the chosen technique's two pilot props

**Interfaces:**
- Produces: `checkEditorHelp(distIndexDts: string): string[]` (failure messages; empty means pass), exported from `scripts/check-editor-help.mjs`, and the named technique (recorded in the ledger) that Task 5 applies everywhere.
- Produces: `COMPOUND_PARTS: string[]` and `HOVER_CASES: { component: string; prop: string; mustShow: string[] }[]` in the same file.

- [ ] **Step 1: Probe.** On a scratch copy (not committed), build `dist`, then with `ts.createLanguageService` over a virtual `probe.tsx` importing `dist/index.d.ts`, read `getQuickInfoAtPosition` on the attribute names in `<Button variant="solid" tone="accent" size="md" />`, `<Box width="full" gap="4" />`, and `<Grid columns={2} />`. Try, in order, on `ButtonVariant` and `WidthValue` only:
  - A: today's declarations (expect alias names; the baseline).
  - B: the prop declared with an identity conditional, `type Literal<T> = T extends unknown ? T : never`, as `variant?: Literal<ButtonVariant>` and `Responsive<Literal<WidthValue>>`.
  - C: the union written inline in the prop, with the named alias kept and an `expectTypeOf` equality test between them.
  - D: `Responsive` itself rewritten as a distributive conditional so its object member prints expanded.
  Record each candidate's printed type line in the ledger. Pick the first where both props' type lines show their literals after `vite-plugin-dts` bundling. **If none does, stop and tell the owner; the fallback (TSDoc lists only) needs their agreement (Spec 19).**
- [ ] **Step 2: Write `scripts/check-editor-help.test.mjs`** (node:test) against a fixture `.d.ts` string:
  - a prop typed by a bare alias fails with a message naming the component and prop;
  - a component without `@example` in its quick-info tags fails, and a name in `COMPOUND_PARTS` doesn't;
  - the fixture with literals and examples returns `[]`.
- [ ] **Step 3: Run** `node --test scripts/check-editor-help.test.mjs`. Expected: fail (module missing).
- [ ] **Step 4: Implement `checkEditorHelp`.** `HOVER_CASES` (Spec 19's acceptance list): `Button.variant` must show `"solid"` and `"ghost"`; `Button.tone` `"accent"` and `"danger"`; `Button.size` `"sm"` and `"lg"`; `Box.width` `"full"` and `"1/2"`; `Box.gap` `"4"` and `"px"`; `Grid.columns` `number`. Component set: every value export of `dist/index.d.ts` that is a function returning JSX, minus `COMPOUND_PARTS`. Wire it into `verify-dist.mjs`, but behind an `EDITOR_HELP_STRICT` constant set to `false` until Task 6 sets it `true`, so the build stays green while the parts land. The failure messages still print.
- [ ] **Step 5: Apply the chosen technique to the two pilot props only**, then `npm run build`. Expected: the two pilot cases pass and the rest are listed as failures (non-fatal).
- [ ] **Step 6: Run** `node --test scripts/*.test.mjs`, `npm run typecheck`, `npm run lint`. Expected: exit 0. Break-check each test assertion and ledger it.
- [ ] **Step 7: Commit** `Add the editor-help check and choose the hover technique`, with this plan.

### Task 2: Unbounded grid counts on `Box` and `Grid`

**Files:**
- Create: `src/components/Box/gridCounts.css.ts`, `src/components/Box/gridCounts.ts`, `src/components/Box/gridCounts.test.ts`
- Modify: `src/components/Box/sprinkles.css.ts` (remove the three props and `range`), `src/components/Box/types.ts` (`GridCount`, `GridSpanValue`), `src/components/Box/Box.tsx`, `src/components/Box/Box.test.tsx`, `src/components/Box/Box.test-d.tsx`, `src/components/Box/Box.browser.test.tsx`, `src/components/Grid/Grid.tsx`, `src/components/Grid/*.test*`, `src/components/Card/Card.browser.test.tsx` (or its nearest browser test), `scripts/verify-dist.mjs`

**Interfaces:**
- Produces, in `gridCounts.css.ts`: `gridCountClass: Record<'gridTemplateColumns' | 'gridColumn' | 'gridRow', Record<Breakpoint, string>>`, `gridFullClass: Record<'gridColumn' | 'gridRow', Record<Breakpoint, string>>`, `gridCountVar: Record<'gridTemplateColumns' | 'gridColumn' | 'gridRow', Record<Breakpoint, `--ds-grid-${string}`>>`.
- Produces, in `gridCounts.ts`: `type GridCountProps = Pick<BoxStyleProps, 'gridTemplateColumns' | 'gridColumn' | 'gridRow'>`, `const GRID_COUNT_PROPS: readonly (keyof GridCountProps)[]`, and `gridCountStyle(props: GridCountProps, component: string): { className: string; style: Record<string, number> | undefined }`.
- Types: `GridCount = number | `${number}``; `GridSpanValue = number | `span-${number}` | 'full'`.

- [ ] **Step 1: Write the failing tests.**
  - `gridCounts.test.ts`: `gridCountStyle({ gridTemplateColumns: 16 }, 'Box')` returns the base class and `{ '--ds-grid-columns-base': 16 }`; `'16'` and `'016'` give the same; `{ base: 2, md: 16 }` gives two classes and two variables; `gridColumn: 'full'` gives `gridFullClass.gridColumn.base` and no style; `gridColumn: 'span-14'` and `14` give the same; each of `0`, `-1`, `1.5`, `NaN`, `Infinity`, `1e21`, `'abc'`, `'1e3'`, `'span-0'`, `'full'` (for `gridTemplateColumns`) returns `{ className: '', style: undefined }` and calls `console.warn` exactly once with a message containing `Box`, the prop, and the value; `{}` returns `{ className: '', style: undefined }`.
  - `Box.test.tsx`: `<Box gridColumn={14} style={{ color: 'red' }} />` has `style` with both `--ds-grid-column-base: 14` and `color: red`; `<Box style={{ '--ds-grid-column-base': 3 }} gridColumn={14} />` keeps `3` (consumer last); `<Box padding="4" />` has no `style` attribute.
  - `Box.test-d.tsx`: `<Box gridColumn={14} />`, `gridColumn="span-14"`, `gridTemplateColumns={16}` compile; `// @ts-expect-error` on `gridColumn="span-x"` and `gridTemplateColumns="full"`. The sync test excludes the three props from both sides (ADR 0005), and asserts `GRID_COUNT_PROPS`' type equals that excluded set.
  - `Box.browser.test.tsx` / `Grid.browser.test.tsx` (real browser): `<Grid columns={16}>`, `columns="16"`, and `columns={{ base: 2, md: 16 }}` give 16 tracks (2 below `md`); `columns={100}` gives 100; a `Box` with `gridColumn={14}`, `"span-14"`, and `"full"` in a 16-column grid spans 14, 14, and 16 tracks (measure width against the track); a project class (unlayered, in `Box.browser.css.ts`) setting `grid-template-columns: repeat(3, 1fr)` wins over `columns={16}`; Review Focus 3 (nested); Review Focus 4 (`Card span="2x1" gridColumn={5}` spans 5).
  - `Grid.test.tsx`: existing tests keep passing; add `columns={4}` renders the same classes as `columns="4"`.
  - `verify-dist.mjs`: `styles.css` contains no `repeat(` followed by a digit, and exactly 5 `repeat(var(--ds-grid-columns-`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Box src/components/Grid` and `npx vitest run --project browser src/components/Box src/components/Grid src/components/Card`. Expected: fail (module missing; `columns={16}` gives 1 track).
- [ ] **Step 3: Implement.** In `gridCounts.css.ts`, per breakpoint, `style(layered(…))` with the matching `@media` from `breakpoints`: `gridTemplateColumns: repeat(var(--ds-grid-columns-bp), minmax(0, 1fr))`; `gridColumn` / `gridRow`: `span var(--ds-grid-column-bp) / span var(--ds-grid-column-bp)`; full: `1 / -1`. Remove the three from sprinkles. `Box` routes `GRID_COUNT_PROPS` through `gridCountStyle(…, 'Box')`, adds the class with `cx`, and passes `style={{ ...grid.style, ...style }}` only when either is set. `Grid`'s `columns` type follows `GridCount`; its default stays `'1'`.
- [ ] **Step 4: Run** Step 2's commands, `npm run typecheck`, `npm run lint`, then `npm run build`. Expected: pass; `verify-dist: ok`. Break-check every new assertion (for example, remove `minmax(0, 1fr)`'s variable from the `md` class; let `1.5` through validation; spread the consumer `style` first) and ledger each.
- [ ] **Step 5: Run** `npm run test:stories`. Expected: pass.
- [ ] **Step 6: Commit** `Accept any positive grid count on Box and Grid`.

### Task 3: `layoutStyle()` for the rerouted components, and `box()`

**Files:**
- Create: `src/utils/layoutStyle.ts`, `src/utils/layoutStyle.test.ts`, `src/utils/rerouted.test.tsx`
- Modify: `src/components/Box/Box.tsx` (`box()`), `src/components/Box/Box.test.tsx`, `src/components/Box/Box.test-d.tsx`, `src/components/Button/Button.browser.test.tsx`, and the 37 files that call `box()`: `Accordion/{Accordion,AccordionItem}`, `Avatar/Avatar`, `Breadcrumbs/Breadcrumbs`, `Button/ButtonBase`, `Checkbox/ChoiceLabel`, `Combobox/Combobox`, `DataTable/DataTable`, `Field/Field`, `FileUpload/FileUpload`, `Input/Input`, `Menu/{MenuCheckboxItem,MenuContent,MenuGroup,MenuItem,MenuLinkItem,MenuRadioGroup,MenuRadioItem,MenuSeparator,MenuSubmenuTrigger}`, `MultiSelect/{MultiSelectButton,MultiSelectSearch}`, `NavBar/NavBar`, `Pagination/Pagination`, `Popover/PopoverContent`, `Progress/Progress`, `RadioGroup/RadioGroup`, `Select/Select`, `Sidebar/Sidebar`, `Table/Table`, `Tabs/{Tabs,TabsList,Tab,TabsPanel}`, `Textarea/Textarea`, `ToggleChip/ToggleChip`, `ToggleChipGroup/ToggleChipGroup` (all `.tsx` under `src/components/`)

**Interfaces:**
- Consumes: `gridCountStyle`, `GRID_COUNT_PROPS` (Task 2).
- Produces: `layoutStyle<S>(layout: LayoutProps, style: S, component: string): { className: string; style: S | undefined }` in `src/utils/layoutStyle.ts`, where `S` is `CSSProperties | ((state: T) => CSSProperties) | undefined`. A function `style` is wrapped as `(state) => ({ ...vars, ...style(state) })`. Not exported from `src/index.ts`.
- Changes: `box(props: Omit<BoxStyleProps, 'gridTemplateColumns' | 'gridColumn' | 'gridRow'>): string`.

- [ ] **Step 1: Write `rerouted.test.tsx` and see it pass on the current code.** One `it.each` row per component in the list above (Tabs' four parts and the ten Menu parts each get a row): render it with `marginTop="4"` and the minimum required props (open menus and popovers where their content is the part), find the element that documents receiving layout props, and assert its `classList` contains `box({ marginTop: '4' })`. Run `npx vitest run --project unit src/utils/rerouted.test.tsx`. Expected: every row passes **before** any change (global rule 4's rerouting clause). Break-check a sample of three rows (drop `box(layout)` from `MenuItem`, `Input`, `Tab`) and ledger them; restore from copies.
- [ ] **Step 2: Add the new failing assertions.**
  - `rerouted.test.tsx`: each row also renders with `gridColumn={14}` and asserts the element has `gridCountClass.gridColumn.base` and `style.getPropertyValue('--ds-grid-column-base') === '14'`.
  - `layoutStyle.test.ts`: a function `style` is called with the state and its result merged after the variables (Review Focus 1); a consumer object `style` wins over the variable; no layout and no style returns `style: undefined`.
  - Review Focus 2: `<Input gridColumn={14} style={{ color: 'red' }} />` puts both on the wrapper, and the inner `<input>` has no `style`.
  - `Button.browser.test.tsx`: in a 16-column grid, `<Button gridColumn={14}>`, `"span-14"`, and `"full"` span 14, 14, and 16 tracks.
  - `Box.test.tsx`: `box({ gridColumn: 'span-2' } as never)` returns `''` and warns once, naming `box()`, the prop, and "wrap it in `Box` or use `style`". `Box.test-d.tsx`: `// @ts-expect-error` on `box({ gridColumn: 'span-2' })`, and on each of the other two props.
- [ ] **Step 3: Run** the unit and browser commands for these files. Expected: the new assertions fail; Step 1's still pass.
- [ ] **Step 4: Implement** `layoutStyle`, change `box()`, and switch the 37 files from `box(layout)` to `layoutStyle(layout, style, '<Component>')`, putting `className` and `style` on the element that already had the layout class. Where `style` came in through `...rest`, destructure it so it isn't passed twice.
- [ ] **Step 5: Run** `npm test`, `npm run test:stories`, `npm run typecheck`, `npm run lint`. Expected: exit 0; `rerouted.test.tsx` passes every row (seen passing before and after). Break-check each new assertion and ledger it.
- [ ] **Step 6: Commit** `Route layout props through layoutStyle, and drop grid counts from box()`.

### Task 4: Next fixture

**Files:**
- Modify: `fixtures/next-app/app/(site)/page.tsx`, `tests/fixtures/smoke.spec.ts`, `scripts/verify-dist.mjs` (`serverModules` gains `components/Grid/Grid.js` and `components/Box/Box.js` if absent)

- [ ] **Step 1: Write the failing test.** In `smoke.spec.ts`, Next only: the server HTML from `request.get('/')` matches `/<div[^>]*data-testid="grid16"[^>]*style="[^"]*--ds-grid-columns-base:\s*16/` and that element's `class` has two or more classes; in the browser, `[data-testid=grid16]` has 16 tracks. Run `npm run test:fixtures`. Expected: fail (no such element).
- [ ] **Step 2: Add** `<Grid data-testid="grid16" columns={16}>` with 16 children to the server page.
- [ ] **Step 3: Run** `npm run build && npm run test:fixtures`. Expected: pass, with no new console errors.
- [ ] **Step 4: Break-check** per `CLAUDE.md`: save the served HTML; strip the `--ds-grid-columns-base: 16` declaration from the `grid16` element's own `style`; the regex passes on the saved HTML and fails on the stripped copy. Ledger it.
- [ ] **Step 5: Commit** `Fixture: server-render a 16-column Grid`.

### Task 5: TSDoc value lists and literal hovers

**Files:**
- Modify: `src/components/Box/types.ts` (every `LayoutProps` and `BoxOnlyProps` doc), every component props interface with a value-union prop, `src/docs/docsCoverage.test.ts`

**Interfaces:**
- Consumes: Task 1's technique and `HOVER_CASES`.

- [ ] **Step 1: Write the failing test** in `docsCoverage.test.ts`, using the TypeScript compiler API over `src/index.ts`: for every exported component's props, a property whose type (ignoring `Responsive<>` and `undefined`) is a union of string literals has a doc comment that either contains every member in backticks (unions of 8 or fewer) or names its token family and gives one value with its unit (larger unions, as Spec 19's `width` example). Failure messages name `Component.prop`. Run `npx vitest run --project unit src/docs/docsCoverage.test.ts`. Expected: fail, listing `Box.width` and more.
- [ ] **Step 2: Write the docs.** Layout props use Spec 19's pattern, for example `width`: "`space` tokens (`'4'` is 16px), `'full'` (100%), `'fit'`, `'1/2'`… Responsive." Grid counts: "Any positive whole number, or the same as a string (`16`, `'16'`). Responsive." Spans: "A span count (`14` or `'span-14'`), or `'full'`. Responsive."
- [ ] **Step 3: Apply Task 1's technique** to every value-union prop. Named unions (`ButtonVariant`, `BadgeTone`, …) stay exported.
- [ ] **Step 4: Run** Step 1's test, `npm run typecheck`, `npm run build`. Expected: pass; the build's editor-help output lists no hover failures (examples still listed). Break-check the doc test (delete one member from `Button.variant`'s doc) and one `HOVER_CASES` entry (revert one prop to the bare alias); ledger both.
- [ ] **Step 5: Commit** `Document every value union, and show literals in hovers`.

### Task 6: `@example` on every component, type-checked

**Files:**
- Create: `scripts/extract-examples.mjs`, `scripts/extract-examples.test.mjs`
- Modify: `package.json` (`typecheck`), `tsconfig.json` (`include` gains `.generated/examples`), `.gitignore` (`.generated/`), `.prettierignore` and `eslint.config.*` (ignore `.generated/`), every root component's TSDoc, `scripts/check-editor-help.mjs` (`EDITOR_HELP_STRICT = true`)

**Interfaces:**
- Produces: `extractExamples(srcDir: string, outDir: string): { written: number; errors: string[] }`. Typecheck becomes `node scripts/extract-examples.mjs && tsc --noEmit`.

- [ ] **Step 1: Write `extract-examples.test.mjs`** (node:test, temp dirs): a component file with one `@example` fenced `tsx` block writes one module that imports from `src/index` and wraps the expression; a second `@example` on the same component is an error naming it; an example with no fence is an error; an `import … from '@adeebali/design-system-react'` line is rewritten. Run `node --test scripts/extract-examples.test.mjs`. Expected: fail (module missing).
- [ ] **Step 2: Implement** `extractExamples`, the script wiring, and the ignore rules (rule 3: generated files are never committed). It clears `outDir` first, so a removed example leaves no stale module.
- [ ] **Step 3: Write the examples.** One per root component, the smallest useful usage (for example, `Grid`: `<Grid columns={{ base: 1, md: 3 }} gap="4">…</Grid>` with real children). Set `EDITOR_HELP_STRICT = true`.
- [ ] **Step 4: Run** `npm run typecheck`, `node --test scripts/*.test.mjs`, `npm run build`. Expected: exit 0; `verify-dist: ok` with no editor-help failures; `git status` shows nothing under `.generated/`. Break-checks, ledgered: a type error in one example (`<Button variant="nope">`) fails `npm run typecheck` at that generated file; deleting `Tabs`' `@example` fails the build naming `Tabs`.
- [ ] **Step 5: Commit** `Add a type-checked @example to every component`.

### Task 7: Docs, stories, and the full check

**Files:**
- Modify: `src/components/Grid/Grid.mdx`, `src/components/Grid/Grid.stories.tsx`, `src/components/Box/StyleProps.mdx` (line 22 and the `gridTemplateColumns` row), `src/components/Box/Box.mdx` (`box()`'s section), `README.md` if it states 1–12 or `box()`'s grid props

- [ ] **Step 1: Update the pages.** The number form, no limit of 12, the `--ds-grid-*` variables and that a project class still wins, and `box()` without grid counts (wrap in `Box` or use `style`). Add a `Sixteen columns` story (`columns={16}`) and a `Wide span` story (`gridColumn={14}` in a 16-column grid).
- [ ] **Step 2: Run** `grep -rn "span-12\|1–12\|1-12\|through 12" src README.md docs/specs/04* docs/specs/06*`. Expected: no stale mention.
- [ ] **Step 3: Run** `npm ci && npm run check`. Expected: exit 0, with counts recorded (unit, stories and browser, `verify-dist: ok`, fixtures).
- [ ] **Step 4: Commit** `Document unbounded grid counts`, push, open the PR. Its body has a "Release notes" section for v0.9.0 (minor) with Spec 19's two breaking changes verbatim, the departures (none), and the ledger summary.
- [ ] **Step 5: Run the `update-visual-baselines` workflow** for the new stories and the changed docs pages; view every changed baseline before committing it.
- [ ] **Step 6: Final review.** One fresh reviewer (most capable model) over the whole branch; fix findings with tests seen failing first; review any commits after it, and say which commit the review covered. Update `docs/HANDOFF.md` through the `handoff` skill.
