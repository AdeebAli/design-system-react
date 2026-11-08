# v0.2 Bento and Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.2: `Card`, `Stat`, `Badge` (Spec 08), and `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Button`, `IconButton`, `ToggleChip`, `ToggleChipGroup`, `ColorModeToggle` (Spec 09).

**Architecture:** Bento components are server-safe compositions of `Box` with `recipe()` styles. Form controls are `"use client"` wrappers over `@base-ui/react` parts, one module per component, with hand-written public types and classes from `box()`/`splitLayoutProps` where Base UI owns the element. `Field` adds a small context on top of Base UI's `Field` for `required`, `invalid`, and label behavior.

**Tech Stack:** As v0.1, plus `@base-ui/react` `^1.9.0` (runtime dependency) and `react-hook-form` (in `fixtures/vite-app` only).

**Spec:** `docs/specs/08-bento.md` and `docs/specs/09-forms.md`, with `docs/specs/05-component-conventions.md` and ADR 0002. Read the task's spec section before starting it. Exact values (tokens, sizes, defaults, copy) live there, and this plan doesn't repeat tables.

## Global Constraints

- Branch `feat/v0.2-bento-and-forms` from `main`, one commit per task, one PR. **Commits and PR bodies carry no co-author or generated-by lines**, per the owner's standing rule (v0.1 history has none).
- `@base-ui/react` is installed as `^1.9.0` (verified latest on 2026-11-08; part names `Field.{Root,Label,Control,Description,Error,Item}`, `Select.{Root,Trigger,Value,Icon,Portal,Positioner,Popup,List,Item,ItemText,ItemIndicator,Group,GroupLabel}`, `Checkbox.{Root,Indicator}`, `Radio.{Root,Indicator}`, `RadioGroup`, `Switch.{Root,Thumb}`, `Toggle`, `ToggleGroup` confirmed in its 1.9.0 types). Confirm each prop against the installed types when building.
- Only modules under `src/components/**` import Base UI. `dist/index.d.ts` never mentions `base-ui` (existing check).
- `Card`, `Stat`, and `Badge` have no `"use client"`. Every Spec 09 component module begins with `"use client"`. `scripts/verify-dist.mjs`'s `clientModules` list grows with each client module, and a new `serverModules` list asserts `Card.js`, `Stat.js`, `Badge.js` do **not** begin with it.
- Style values come from `vars` only. Hover inside `@media (hover: hover)`. Only `opacity`, `transform`, and colors animate, with `motion.*` tokens. No component margins.
- `color.bg.dangerHover` and `color.bg.mutedHover`, and their contrast pairs, already exist (v0.1). Don't re-add them.
- Viewport-dependent checks go in `*.browser.test.tsx` (v0.1 ruling), everything else in stories or unit tests.
- Internal icons (trend arrows, check, dash, chevron, sun, moon) are copied Lucide SVGs in `src/components/Icon/internal/`, with the same ISC header as `ExternalLink.tsx`.
- Development warnings go through `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix it.
- Don't change anything a spec doesn't ask for. If a spec can't be met as written, stop and raise it.

## Review Focus

Each has a test in the named task.

1. **Implicit form submission while loading (Task 4).** Pressing Enter in an `Input` inside a `<form>` whose submit `Button` is `loading` must not submit: browsers fire a synthetic click on the submit button, and the wrapper's click guard must catch it.
2. **Falsy `ReactNode`s in `Stat` (Task 2).** `value={0}` and `change={0}` render "0". A `change &&` check silently drops them.
3. **An error that clears (Task 5).** When `error` goes from set to unset, `Field.Error` unmounts, `aria-invalid` is removed, and `aria-describedby` no longer references a missing id.
4. **A `Select` value with no matching option (Task 7).** `value="gone"` (stale data) or `options={[]}` shows the placeholder and opens without throwing.
5. **Field label kind with a wrapped control (Task 5/7).** A `Select` rendered through React Hook Form's `Controller` (so `Field` can't see its type) still gets a label click that focuses without opening.

---

### Task 1: `Card`

**Files:**
- Create: `src/components/Card/{Card.tsx,Card.css.ts,span.ts,Card.test.tsx,Card.test-d.tsx,Card.browser.test.tsx,Card.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (add `serverModules` check)

**Interfaces:**
- Consumes: `Box`, `cx`, `layered`, `focusRing`, `warnOnce`, `withDefaultDisplay`, `PolymorphicProps`, `Responsive`, `SpaceToken`, `GridSpanValue`.
- Produces: `Card`, `CardProps<E>`, `CardSpan` (`'1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '4x1' | 'full'`), `CardPadding` (`'none' | 'sm' | 'md' | 'lg'`), `CardSurface` (`'default' | 'sunken'`). Internal: `spanToGrid(span: Responsive<CardSpan> | undefined): { gridColumn?: Responsive<GridSpanValue>; gridRow?: Responsive<GridSpanValue> }`.

- [ ] **Step 1: Write the failing tests**

```ts
// span.ts: the collapse rule applies only to a non-responsive span
expect(spanToGrid(undefined)).toEqual({});
expect(spanToGrid('1x1')).toEqual({});
expect(spanToGrid('2x1')).toEqual({ gridColumn: { base: 'full', md: 'span-2' } });
expect(spanToGrid('1x2')).toEqual({ gridRow: 'span-2' });
expect(spanToGrid('2x2')).toEqual({ gridColumn: { base: 'full', md: 'span-2' }, gridRow: 'span-2' });
expect(spanToGrid('3x1')).toEqual({ gridColumn: { base: 'full', md: 'span-3' } });
expect(spanToGrid('full')).toEqual({ gridColumn: 'full' });
// responsive is literal; 1x1 inside an object is explicit span-1 so it can reset a smaller breakpoint
expect(spanToGrid({ base: '1x1', md: '2x1' })).toEqual({
  gridColumn: { base: 'span-1', md: 'span-2' }, gridRow: { base: 'span-1', md: 'span-1' },
});
```

```tsx
expectSameClass(<Card data-testid="c" />, <Box data-testid="c" display="flex" flexDirection="column" padding="4" gap="2" className={card({ surface: 'default', clip: false })} />);
it('explicit gridColumn replaces span on that axis only'); // span="2x2" gridColumn="span-1" → column span-1, row span-2
it('padding none/sm/md/lg map to 0/3/4/6, responsive');
it('as="article" renders article');
it('warns once for interactive on a non-a string tag'); // div, li → warns; 'a' and a custom component → no warning
it('surface sunken applies the sunken class, not default');
```

`Card.test-d.tsx`: `padding` and `gap` accepted; `paddingX` and `background` are type errors.

- [ ] **Step 2: Run `npx vitest run --project unit src/components/Card` and confirm they fail** because the module doesn't exist.

- [ ] **Step 3: Implement.** `Card.css.ts`: a `recipe()` (via `layered`) with base `borderRadius: radius.card`, `1px solid border.surface`, `minWidth: 0` (so a long word can't stretch a column), and variants `surface` and `clip`. A separate `interactive` style: `color: inherit`, `textDecoration: none`, hover `transform: translateY(-1px)` and `shadow.cardHover` inside `@media (hover: hover)`, `:active` resets the transform, `transition` on `transform` only with `motion.duration.fast`; plus `focusRing`. `Card.tsx` renders `Box` with `display={withDefaultDisplay(display, 'flex')}`, `flexDirection="column"`, mapped padding and gap, and `{...spanToGrid(span), ...explicit gridColumn/gridRow}`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Browser tests and stories.** `Card.browser.test.tsx`: at 390px a `span="3x1"` card in a 2-column `Grid` fills the row and the grid's `scrollWidth` equals its `clientWidth`; at 1280px it spans 3 of 4 columns; a long unbroken word doesn't widen its column; `clip` gives a full-bleed image `overflow: hidden`; a Crisp override (`--ds-shadow-card: none` and a visible `--ds-color-border-surface` in a `style` on a wrapper) yields computed `box-shadow: none` and that border color; interactive hover changes `transform`, and under `prefers-reduced-motion` the transition duration is `0s`. Stories: every span, padding, surface, `clip`, interactive (hover/pressed/focus), `marginTop="auto"` pushing a child down, forced-colors check story, Playground. Run `npm run test:stories`.

- [ ] **Step 6: Extend `verify-dist.mjs`** with `serverModules = ['components/Card/Card.js']` asserting no leading directive. Watch it fail by temporarily adding `"use client"` to `Card.tsx` and running `npm run build`, then remove it.

- [ ] **Step 7: Commit** with message `Add Card`.

### Task 2: `Stat` and `Badge`

**Files:**
- Create: `src/components/Stat/*`, `src/components/Badge/*` (same file set as Task 1, without `span.ts`), `src/components/Icon/internal/{ArrowUp,ArrowDown,Minus}.tsx`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (`serverModules` += Stat, Badge)

**Interfaces:**
- Consumes: `Box`, `Icon`, `VisuallyHidden`, `ComponentProps`, `layered`.
- Produces: `Stat`, `StatProps`, `StatTrend` (`'up' | 'down' | 'flat'`), `StatSentiment` (`'positive' | 'negative' | 'neutral'`), `StatSize`, `StatTrendLabels`; `Badge`, `BadgeProps`, `BadgeTone`, `BadgeVariant` (`'soft' | 'solid'`), `BadgeSize` (`'sm' | 'md'`).

- [ ] **Step 1: Write the failing tests**

```tsx
it('renders a dl with a dt and dd', () => {
  render(<Stat label="Seats" value="38" />);
  expect(screen.getByRole('term')).toHaveTextContent('Seats');
  expect(screen.getByRole('definition')).toHaveTextContent('38');
});
it('derives sentiment from trend unless overridden'); // up→positive class, down→negative; trend up + sentiment negative → negative class
it('puts the arrow and hidden trend text in the change dd', () => {
  render(<Stat label="Revenue" value="1" change="4.1" trend="down" />);
  expect(screen.getAllByRole('definition')[1]).toHaveTextContent('Down4.1'); // hidden "Down" + change
});
it('renders trend without change');
it('trendLabels replaces the hidden text');
it('renders 0 for value and change', () => {          // Review Focus 2
  render(<Stat label="Errors" value={0} change={0} trend="flat" />);
  expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(['0', 'No change0']);
});
it('change without trend or sentiment uses the muted class');
it.each(BADGE_TONES.flatMap((t) => ['soft', 'solid'].map((v) => [t, v])))('Badge %s %s applies its class');
it('Badge renders a span and sizes startIcon to 1em');
```

`*.test-d.tsx`: neither accepts `as`; `Stat` requires `label` and `value`.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** `Stat` value sizes `sm`/`md`/`lg` use `font.size.2xl`/`3xl`/`4xl`, with letter spacing per Spec 08. Use `!= null` checks, never truthiness, for `change` and `hint`. Arrow icons are `aria-hidden`; the visible order inside the change `dd` is arrow, hidden label, change. `Badge` uses one recipe with `tone × variant` compound variants for color and `size` for padding; `startIcon` is wrapped in a span whose class sets `& > svg { width: 1em; height: 1em }`.

- [ ] **Step 4: Run and confirm they pass.** Also run `npx vitest run --project unit src/themes` to confirm every Badge pair is in `CONTRAST_PAIRS` (`fg.{tone}`/`bg.{tone}Subtle`, `fg.onStatus`/`bg.{tone}`, `fg.inverse`/`bg.inverse`, `fg.accent`/`bg.accentSubtle`, `fg.onAccent`/`bg.accent`, `fg.default`/`bg.muted`); add any missing pair with a test assertion.

- [ ] **Step 5: Stories** for every size, trend, sentiment, tone, variant, with icon, and a Playground each. Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add Stat and Badge`.

### Task 3: Bento page and Spec 08 acceptance

**Files:**
- Create: `src/components/Bento.stories.tsx`
- Modify: `fixtures/next-app/app/page.tsx`, `fixtures/vite-app/src/main.tsx`, `tests/fixtures/smoke.spec.ts`

**Interfaces:**
- Consumes: `Card`, `Stat`, `Badge`, `Grid`, layout and typography components. Produces nothing new.

- [ ] **Step 1: Write the smoke test first:** both fixtures render a `Card` containing a `Stat` and a `Badge` from the server page (Next) and the app (Vite); assert the card's computed `border-radius` equals `--ds-radius-card` resolved, and `getByRole('term')` is "Revenue". Run `npm run test:fixtures` and confirm it fails because the fixtures don't render them yet.

- [ ] **Step 2: Add the renders** to both fixtures and rerun until it passes.

- [ ] **Step 3: Write `Bento.stories.tsx`** with `Dashboard` and `BlogHome` stories built from Spec 08's example, with no `style` or `className` anywhere in the file (add a unit test that reads the file and asserts neither string appears). `BlogHome` uses interactive `Card as="a"` post cards.

- [ ] **Step 4: Run** `npm run test:stories && npm run build`. Expected: pass, including axe in both modes.

- [ ] **Step 5: Commit** with message `Add Bento overview page`.

### Task 4: `Button` and `IconButton`

**Files:**
- Create: `src/components/Button/{Button.tsx,Button.css.ts,Spinner.tsx,tones.ts,Button.test.tsx,Button.test-d.tsx,Button.stories.tsx,index.ts}`, `src/components/IconButton/*`
- Modify: `package.json` (add `@base-ui/react` `^1.9.0` to `dependencies`), `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: `Box`, `Icon`, `VisuallyHidden`, `focusRing`, `warnOnce`, `PolymorphicProps`.
- Produces: `Button`, `ButtonProps<E>`, `ButtonVariant` (`'solid' | 'soft' | 'outline' | 'ghost'`), `ButtonTone` (`'accent' | 'neutral' | 'danger'`), `ButtonSize`; `IconButton`, `IconButtonProps<E>`. Internal: `resolveTone(variant, tone): ButtonTone` (default tone per variant, warns and falls back on an invalid combination), `Spinner`, and `buttonRecipe` (reused by `IconButton` and `ColorModeToggle`).

- [ ] **Step 1: Write the failing tests**

```tsx
it('defaults to type="button"');
it('respects type="submit"');
it.each([['soft', 'danger'], ['solid', 'neutral'], ['outline', 'accent']])('%s + %s warns and uses the default tone');
it('loading ignores clicks, sets aria-busy and data-loading, keeps focus, and adds hidden "Loading"', async () => {
  const onClick = vi.fn();
  render(<Button loading onClick={onClick}>Save</Button>);
  const b = screen.getByRole('button', { name: /Save/ });
  b.focus(); await userEvent.click(b);
  expect(onClick).not.toHaveBeenCalled();
  expect(b).toHaveFocus(); expect(b).toHaveAttribute('aria-busy', 'true');
  expect(b).not.toBeDisabled(); expect(b).toHaveTextContent('Loading');
});
it('loading prevents implicit submission from Enter in an input', async () => {   // Review Focus 1
  const onSubmit = vi.fn((e) => e.preventDefault());
  render(<form onSubmit={onSubmit}><input aria-label="q" /><Button type="submit" loading>Go</Button></form>);
  await userEvent.type(screen.getByLabelText('q'), 'x{Enter}');
  expect(onSubmit).not.toHaveBeenCalled();
});
it('as="a" renders a link with no role="button"', () => {
  render(<Button as="a" href="/x">Docs</Button>);
  expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('role');
});
it('warns for disabled or loading on a link');
it('disabled native button is not focusable');
it('ref reaches the button element');
it('IconButton is named by aria-label and its icon is hidden');
```

`IconButton.test-d.tsx`: omitting `aria-label` is a type error; `startIcon` is a type error.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Install `@base-ui/react@^1.9.0` and implement.** Without `as`, render Base UI's `Button` with `className` from `box()` for layout props; with `as`, render `Box as={as}` directly. The loading guard is an `onClick` that calls `preventDefault()` and stops propagation before the consumer's handler. `Spinner` is an SVG whose rotation stops under reduced motion through `motion.*` tokens and stays visible. Color `transition` uses `motion.duration.fast`. `IconButton` is square at `size.control.*`.

- [ ] **Step 4: Run and confirm they pass.** Add `components/Button/Button.js` and `components/IconButton/IconButton.js` to `clientModules`, run `npm run build`.

- [ ] **Step 5: Stories** for the six variant/tone combinations × sizes, disabled, loading, icons, as link, Playground. Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add Button and IconButton`.

### Task 5: `Field`, `Input`, and `Textarea`

**Files:**
- Create: `src/components/Field/{Field.tsx,Field.css.ts,FieldContext.ts,Field.test.tsx,Field.stories.tsx,index.ts}`, `src/components/Input/*`, `src/components/Textarea/*`, `src/components/Field/Field.browser.test.tsx`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: Base UI `Field`, `box`, `splitLayoutProps`, `focusRing`, `VisuallyHidden`.
- Produces: `Field`, `FieldProps`; `Input`, `InputProps`, `InputSize`; `Textarea`, `TextareaProps`. Internal for Tasks 6–8: `useFieldControl(kind: 'native' | 'button' | 'choice'): { invalid: boolean; disabled: boolean; required: boolean; hasFieldLabel: boolean }`. A control calls it once; `'button'` makes `Field` render its label with `nativeLabel={false}` (as a non-`label` element) so a click focuses without activating; `'choice'` tells `Field` its label is a heading when the control has its own `label`. Outside a `Field` it returns all `false`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('associates label, hint, and error with an Input', () => {
  render(<Field label="Seats" hint="Whole number" error="Enter a number"><Input /></Field>);
  const input = screen.getByRole('textbox', { name: 'Seats' });
  expect(input).toHaveAccessibleDescription('Whole number Enter a number');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});
it('removes the error and its reference when error clears', () => {     // Review Focus 3
  const { rerender } = render(<Field label="S" error="Bad"><Input /></Field>);
  rerender(<Field label="S"><Input /></Field>);
  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('aria-invalid');
  for (const id of (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean))
    expect(document.getElementById(id)).not.toBeNull();
});
it('required sets aria-required, not required, and is not invalid');
it('a browser-invalid value does not set data-invalid');  // type="email" value="x"
it('disabled reaches the control and sets data-disabled on root');
it('the required * is aria-hidden');
it('Input: ref and native props go to the input; className, style, and layout props to the wrapper');
it('Input works with a register-style ref and onChange');
it('Textarea: ref goes to the textarea; resize none applies');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** `Field` renders `Field.Root` with `invalid` from `error`/`invalid` only, a `FieldContext` provider, `Field.Label` (kind from the registered control), `Field.Description` for `hint`, and `Field.Error` only when `error != null`, with `match` forced so Base UI's validity doesn't hide it. `Input` and `Textarea` render `Field.Control`. Coarse-pointer font size, `:focus-within` ring on the `Input` wrapper, and heights per Spec 09.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Browser test** (`Field.browser.test.tsx`): under emulated `pointer: coarse`, `Input` and `Textarea` computed `font-size` is `16px`; clicking the label focuses each. Stories for every state, both modes. Add the three client modules to `clientModules`. Run `npm run test:stories && npm run build`.

- [ ] **Step 6: Commit** with message `Add Field, Input, and Textarea`.

### Task 6: `Checkbox`, `RadioGroup`, `Radio`, and `Switch`

**Files:**
- Create: `src/components/{Checkbox,RadioGroup,Radio,Switch}/*`, `src/components/Checkbox/ChoiceLabel.tsx` (internal: the shared label/hint wrapper), `src/components/Icon/internal/{Check,Dash}.tsx`, `src/components/Switch/Switch.browser.test.tsx`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: `useFieldControl('choice')`, Base UI `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Field.Item`, `Stack` styles.
- Produces: `Checkbox`, `CheckboxProps`; `RadioGroup`, `RadioGroupProps`; `Radio`, `RadioProps`; `Switch`, `SwitchProps`. Change handlers are narrowed: `onCheckedChange(checked: boolean)`, `onValueChange(value: string)`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('a Radio is named by its label and the group by the Field', () => {
  render(<Field label="Plan"><RadioGroup defaultValue="m"><Radio value="m" label="Monthly" /><Radio value="a" label="Annual" /></RadioGroup></Field>);
  expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
});
it('Checkbox with its own label keeps it inside a Field, and gets the Field hint and error as description');
it('Checkbox without a label is named by the Field label');
it('warns when a Checkbox has no label, aria-label, or Field label');
it('clicking the label text toggles; onCheckedChange receives a boolean only');
it('indeterminate sets aria-checked="mixed" and data-indeterminate');
it('ref goes to the focusable root and inputRef to the hidden input');
it('className and layout props go on the outer wrapper');
it('arrow keys move selection in RadioGroup; onValueChange receives the value');
it('Switch toggles with Space and sets data-checked');
it.each(['Checkbox', 'Switch', 'RadioGroup'])('%s inherits invalid, disabled, and required from Field');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** With its own `label`, each control is wrapped in `Field.Item` with a `label` element around the control and text, and `hint` as `Field.Description`. A box with no label gets a 24px hit area via padding or pseudo-element. Switch geometry in `rem`; the thumb moves with `transform` and `motion.duration.base`. Confirm the knob/track pairs (`border.control`/`bg.sunken`, `fg.onAccent`/`bg.accent`) are in `CONTRAST_PAIRS` at 3:1.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Browser test:** at 200% root font size, the Switch thumb's bounding box stays inside the track's. Stories for every state, both modes, plus a forced-colors story. Add four modules to `clientModules`. Run `npm run test:stories && npm run build`.

- [ ] **Step 6: Commit** with message `Add Checkbox, RadioGroup, Radio, and Switch`.

### Task 7: `Select`

**Files:**
- Create: `src/components/Select/{Select.tsx,Select.css.ts,options.ts,Select.test.tsx,Select.browser.test.tsx,Select.stories.tsx,index.ts}`, `src/components/Icon/internal/ChevronDown.tsx`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: `useFieldControl('button')`, Base UI `Select`, the `Check` icon from Task 6, `Input`'s trigger styles.
- Produces: `Select`, `SelectProps`, `SelectSize`, `Option` (`{ value: string; label: string; disabled?: boolean }`), `OptionGroup` (`{ label: string; options: Option[] }`). Internal: `normalizeOptions(options: (Option | OptionGroup)[]): { groups: { label?: string; options: Option[] }[]; items: Record<string, string> }`.

- [ ] **Step 1: Write the failing tests**

```ts
expect(normalizeOptions([a, b])).toEqual({ groups: [{ options: [a, b] }], items: { a: 'A', b: 'B' } });
expect(normalizeOptions([a, g, b]).groups.map((x) => x.label)).toEqual([undefined, 'Other', undefined]); // loose runs become unlabeled groups, in order
```

```tsx
it('shows the selected label before opening');
it('null shows the placeholder');
it('a value with no option, or empty options, shows the placeholder and opens', async () => {  // Review Focus 4
  render(<Select options={[]} value="gone" placeholder="Pick" aria-label="P" />);
  expect(screen.getByRole('combobox')).toHaveTextContent('Pick');
  await userEvent.click(screen.getByRole('combobox'));
});
it('onValueChange receives only the value');
it('ref, className, and layout props go to the trigger');
it('disabled options cannot be selected');
it('name submits the value with a form');
it('inherits invalid, disabled, and required from Field');
```

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Pass `items` so the closed trigger and SSR show the label. Popup uses `bg.raised`, `shadow.raised`, `radius.lg`, `zIndex.popover`, portaled through `Select.Portal`. Highlighted option `bg.muted`; selected shows `Check` and `medium` weight.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Browser test:** open with keyboard and mouse, choose, Escape closes and focus returns to the trigger; clicking the `Field` label focuses the trigger without opening it, both directly and when the `Select` is inside a wrapper component (stand-in for `Controller`, Review Focus 5); a mixed loose/group list renders group labels only for groups. Stories in both modes. Add to `clientModules`. Run `npm run test:stories && npm run build`.

- [ ] **Step 6: Commit** with message `Add Select`.

### Task 8: `ToggleChip` and `ToggleChipGroup`

**Files:**
- Create: `src/components/ToggleChip/*`, `src/components/ToggleChipGroup/*`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: Base UI `Toggle`, `ToggleGroup`, `Check` icon, `Inline`'s layout.
- Produces: `ToggleChip`, `ToggleChipProps`, `ToggleChipSize` (`'sm' | 'md'`); `ToggleChipGroup`, `ToggleChipGroupProps`. `onPressedChange(pressed: boolean)`, `onValueChange(value: string[])`.

- [ ] **Step 1: Write the failing tests:** standalone toggles `aria-pressed` and `data-pressed`; group single mode replaces selection; `multiple` accumulates; pressing the selected chip clears it; a controlled group that ignores empty changes keeps "all" selected; a pressed chip shows the check icon; the group requires `aria-label` or `aria-labelledby` (type test).

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** with heights 28px (`sm`) and 32px (`md`), `radius.full`, colors per Spec 09.

- [ ] **Step 4: Run and confirm they pass.** Stories include the "always one selected" pattern. Add to `clientModules`. Run `npm run test:stories && npm run build`.

- [ ] **Step 5: Commit** with message `Add ToggleChip and ToggleChipGroup`.

### Task 9: `ColorModeToggle`

**Files:**
- Create: `src/components/ColorModeToggle/*`, `src/components/Icon/internal/{Sun,Moon}.tsx`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`, `fixtures/next-app/app/layout.tsx` (render it), `tests/fixtures/color-mode.spec.ts`

**Interfaces:**
- Consumes: `IconButton`, `useColorMode` (`resolvedMode`, `setMode`, `isForced`).
- Produces: `ColorModeToggle`, `ColorModeToggleProps` (`labels?: { toLight?: string; toDark?: string; neutral?: string }` plus `IconButton`'s variant and size).

- [ ] **Step 1: Write the failing tests:** clicking in light stores `dark` and vice versa; renders nothing when forced; with `resolvedMode` undefined it renders an icon-less button at full size named "Switch color mode"; labels override. Fixture spec: no hydration warning in the Next console, and clicking toggles `data-ds-mode`.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Name is the action ("Switch to dark mode" while light).

- [ ] **Step 4: Run** `npx vitest run --project unit src/components/ColorModeToggle && npm run build && npm run test:fixtures`. Expected: pass.

- [ ] **Step 5: Commit** with message `Add ColorModeToggle`.

### Task 10: Forms docs, fixtures, and milestone acceptance

**Files:**
- Create: `src/components/Forms.stories.tsx`, `src/components/ReactHookForm.mdx`, `fixtures/vite-app/src/RhfForm.tsx`
- Modify: `fixtures/vite-app/package.json` (add `react-hook-form`, latest stable at the time, verified with `npm view`), `fixtures/vite-app/src/main.tsx`, `fixtures/next-app/app/page.tsx`, `tests/fixtures/smoke.spec.ts`, `README.md`, `docs/HANDOFF.md`

**Interfaces:**
- Consumes: everything above. Produces nothing new.

- [ ] **Step 1: Write the failing fixture tests.** Vite: fill a form built with `register` (`Input`, `Textarea`) and `Controller` (`Select`, `Checkbox`, `RadioGroup`, `Switch`), submit, and assert the JSON in `data-testid="submitted"` equals the expected values. Next: a server page builds `options` and passes them to `Select defaultValue="annual"`; the raw HTML response already contains "Annual". Run `npm run test:fixtures` and confirm both fail.

- [ ] **Step 2: Build the fixture form and Next render** until they pass.

- [ ] **Step 3: Write `Forms.stories.tsx`** (the filter form using every control, with an error state, both modes, no `style` or `className`, asserted by the same file-scan test as Task 3) and `ReactHookForm.mdx` with Spec 09's `register` and `Controller` examples and the `null` default note.

- [ ] **Step 4: Audit.** Walk the acceptance criteria and test lists of Specs 08 and 09 and record each as passed or as needing the owner. Run `npm ci && npm run check`. Expected: all pass.

- [ ] **Step 5: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then close and reopen the PR so CI runs on them. Expected: all five CI jobs pass.

- [ ] **Step 6: Manual checks to hand to the owner, not mark done:** forced colors on every new component, 200% text, and the screen reader pass on `Field`, `Select`, and `RadioGroup` (Spec 09), plus interactive `Card` and `Button`/`IconButton`/`ToggleChip`/`Checkbox`/`Switch`/`ColorModeToggle` (Spec 05's checklist for anything interactive). List each in the PR body.

- [ ] **Step 7: Update `docs/HANDOFF.md`** as a reconciliation: carry forward or resolve each existing open thread and next step (the GitHub Packages registry check, Node 22 EOL, Base UI), then add v0.2's state. Commit with message `Add Forms docs and React Hook Form fixture`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks above, merging, and releasing v0.2.0 (`npm run release -- minor`).
