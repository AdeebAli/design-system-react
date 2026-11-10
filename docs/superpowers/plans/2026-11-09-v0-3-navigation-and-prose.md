# v0.3 Navigation and Prose Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.3: `NavBar`, `NavBarLink`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` (Spec 10), and `Prose`, `NotProse` (Spec 11), plus the v0.2 follow-ups from the handoff's open thread 3.

**Architecture:** `NavBar` is a `"use client"` wrapper over Base UI's `Collapsible`, with one `ul` that CSS grid rearranges at `md`. `Tabs` wraps Base UI's `Tabs`, with a CSS `[data-active]` marker for server HTML that hands off to Base UI's `Indicator` through `:has()`. `Prose` and `NotProse` are server-safe `Box` compositions whose descendant rules are `globalStyle`s in the `ds.components` layer.

**Tech Stack:** As v0.2. `@base-ui/react` stays at `^1.9.0` (installed 1.9.0, verified 2026-11-09). No new dependencies.

**Spec:** `docs/specs/10-navigation.md` and `docs/specs/11-prose.md`, with `docs/specs/05-component-conventions.md`. Read the task's spec section before starting it. Exact values (tokens, sizes, defaults, copy) live there, and this plan doesn't repeat tables.

## Decisions on the deferred v0.2 minors (open thread 3)

All seven become plan tasks; none is dropped, because each is a few lines and two of them (the client-module rule and the RTL knob) protect work this milestone adds.

| Minor | Decision | Task |
|---|---|---|
| `Select` treats `"toString"`/`"constructor"` as known | Fix: `Object.create(null)` + `Object.hasOwn` | 1 |
| `Input disabled={false}` in a disabled `Field` loses styling | Fix: the `Field` wins (`disabledProp \|\| field.disabled`), so state and styling agree | 1 |
| `Switch` knob uses physical `translateX` | Fix: negate under `:dir(rtl)`. Cheap, and Spec 11 requires RTL-safe `Prose` in the same release | 1 |
| `Select` group keys use the label | Fix: key by index | 1 |
| `Textarea` spreads `as object` | Fix: type the rest props properly | 1 |
| `verify-dist`'s client-module list is hand-kept | Fix: derive it from `dist` (Task 2), before v0.3 adds six client modules | 2 |
| RHF fixture and docs omit `field.ref` on `RadioGroup` | Fix | 1 |

## Departures from the spec

None. Two spec additions are already built and only need tests confirming them: `Link tone="neutral"` sets `color: inherit` (`Link.css.ts`) and `Code` has its `pre &` rule (`Code.css.ts`) — Spec 11 lists both as additions to Spec 06.

## Global Constraints

- `git pull` on `main` first (PR #21 is merged on GitHub but not pulled locally), then branch `feat/v0.3-navigation-and-prose`. One commit per task, one PR. **Commits and PR bodies carry no co-author or generated-by lines**, per the owner's standing rule (v0.1 and v0.2 history has none). The first commit adds this plan.
- Base UI parts used, confirmed in the installed 1.9.0 types: `Collapsible.{Root,Trigger,Panel}` (`open`, `onOpenChange`, `keepMounted`; trigger gets `data-panel-open`, panel gets `data-open`/`data-closed` and `--collapsible-panel-height`); `Tabs.{Root,List,Tab,Panel,Indicator}` (`value`, `defaultValue`, `onValueChange(value, details)`, `activateOnFocus`, `keepMounted`; `Indicator` renders `hidden` until measured and exposes `--active-tab-left`/`--active-tab-width`; `Tab` gets `data-active`/`data-disabled`, panel gets `data-hidden`). **Don't pass `renderBeforeHydration`** to `Indicator`: it injects an inline script, which Spec 10's strict-CSP rule forbids.
- Only `src/components/**` imports Base UI; `dist/index.d.ts` never mentions `base-ui` (existing check).
- `NavBar`, `NavBarLink`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` modules begin with `"use client"`. `Prose` and `NotProse` don't, and go in `serverModules`.
- Style values come from `vars` only. Hover inside `@media (hover: hover)`. Only `opacity`, `transform`, colors, and (Tabs marker only, per Spec 10) `width` animate, on `motion.*` tokens. No component margins (except `Prose`'s descendants, per Spec 11). Logical properties throughout.
- Breakpoint `md` is `breakpoints.md` (`48rem`) from `src/tokens/breakpoints.ts`; media queries import it, never a literal.
- Viewport-dependent checks go in `*.browser.test.tsx` with `page.viewport(w, h)` from `vitest/browser` (see `Box.browser.test.tsx`). Media emulation goes through `cdp()`.
- Development warnings use `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix it.
- The internal menu icon is Lucide's `menu`, copied from `node_modules/lucide-react` into `src/components/Icon/internal/Menu.tsx` with the same ISC header as `ChevronDown.tsx`.
- Don't change anything a spec doesn't ask for. If a spec can't be met as written, stop and raise it.

## Review Focus

Each has a test in the named task.

1. **Panel open, then the window widens past `md` (Task 4).** A link click must not send focus to the now-hidden menu button (focus would fall to `body`). Close the panel, and move focus to the button only when it's rendered (`checkVisibility()`).
2. **`Escape` from a portaled popup in `actions` (Task 4).** A `Select` in `actions` closes on `Escape`; React bubbles that keydown through the portal to the `nav`'s handler. The `NavBar` must act only when its panel is open, the event isn't `defaultPrevented`, and the target is inside the `nav`'s DOM.
3. **A consumer's `onClick` on `NavBarLink` (Task 4).** It still runs, before the panel closes; if it calls `preventDefault()`, the panel stays open.
4. **A `Tabs` value with no matching `Tab` (Task 5).** Controlled `value="gone"` renders no marker (CSS or `Indicator`), no panel, and doesn't throw.
5. **Responsive `maxWidth` on `Prose` without `base` (Task 7).** `maxWidth={{ lg: 'full' }}` is `prose` (68ch) below `lg` and unlimited from `lg` up, as Spec 11 states but its test list omits.

---

### Task 1: v0.2 follow-ups

**Files:**
- Modify: `src/components/Select/{options.ts,Select.tsx,options.test.ts,Select.test.tsx}`, `src/components/Input/{Input.tsx,Input.test.tsx}`, `src/components/Checkbox/choice.css.ts`, `src/components/Switch/Switch.browser.test.tsx`, `src/components/Textarea/{Textarea.tsx,Textarea.test-d.tsx}`, `fixtures/vite-app/src/RhfForm.tsx`, `src/components/ReactHookForm.mdx`

**Interfaces:** None new. `normalizeOptions` keeps its signature; `items` becomes a null-prototype `Record<string, string>`.

- [ ] **Step 1: Write the failing tests**

```ts
// options.test.ts
const { items } = normalizeOptions([{ value: 'a', label: 'A' }]);
expect(Object.hasOwn(items, 'toString')).toBe(false);
expect(Object.getPrototypeOf(items)).toBeNull();
```

```tsx
// Select.test.tsx
it('value="toString" with no such option shows the placeholder', () => {
  render(<Select options={[{ value: 'a', label: 'A' }]} value="toString" placeholder="Pick" aria-label="P" />);
  expect(screen.getByRole('combobox')).toHaveTextContent('Pick');
});
it('two groups with the same label render without a duplicate-key warning'); // spy console.error, expect no "same key"
// Input.test.tsx
it('disabled={false} inside a disabled Field stays disabled with disabled styling', () => {
  render(<Field label="S" disabled><Input disabled={false} /></Field>);
  const input = screen.getByRole('textbox');
  expect(input).toBeDisabled();
  expect(input.closest('[data-disabled]')).not.toBeNull();
});
// Switch.browser.test.tsx
it('the checked knob ends at the inline end in RTL'); // <div dir="rtl">: thumb.right ≈ track.left + its inset, mirrored from the LTR case
```

`Textarea.test-d.tsx`: `<Textarea rows="x" />` and `<Textarea onChange={(e: ChangeEvent<HTMLInputElement>) => {}} />` are type errors (`@ts-expect-error`). Typecheck currently passes them because of `as object`, so they fail first.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Select src/components/Input src/components/Textarea && npx vitest run --project browser src/components/Switch`. Expected: each new test fails for its stated reason (the `@ts-expect-error` lines report "unused").

- [ ] **Step 3: Implement.** `options.ts`: `Object.create(null)`; `Select.tsx:71` uses `Object.hasOwn(items, v)`; group key `group-${index}`. `Input.tsx:45`: `disabledProp || field.disabled`. `choice.css.ts:205`: add `':dir(rtl) &'` (or the matching selector form) negating the translate. `Textarea.tsx`: remove the `as object` cast and fix the resulting type errors with correct prop types, not a new cast. Pass `ref={field.ref}` to `RadioGroup` in `RhfForm.tsx` and the MDX `Controller` example (confirm `RadioGroup` forwards `ref` to a focusable element; if it doesn't, stop and raise it).

- [ ] **Step 4: Run** the Step 2 commands plus `npm run typecheck && npm run test:fixtures`. Expected: all pass.

- [ ] **Step 5: Commit** with message `Fix deferred v0.2 review minors`.

### Task 2: Derive the client-module check

**Files:**
- Modify: `scripts/verify-dist.mjs`, its script test (find it under `scripts/` or `tests/`; `npm test` runs script tests)

**Interfaces:**
- Produces: a rule in `verify-dist.mjs`: every `dist/**/*.js` whose source imports `@base-ui/react` or calls a React hook (`/\buse(State|Effect|LayoutEffect|Context|Ref|Id|SyncExternalStore|Callback|Memo|Reducer)\b/`, or an internal `use[A-Z]\w*` hook import) must begin with `"use client"`. The hand-kept `clientModules` list goes; `serverModules` stays as the inverse assertion.

- [ ] **Step 1: Write the failing script test:** a temp `dist` fixture with a module importing `@base-ui/react/tabs` and no directive makes `verify-dist` exit non-zero naming that file; the same module with the directive passes; a module with no hooks and no Base UI passes without the directive.

- [ ] **Step 2: Run `npm test` and confirm it fails** because the rule doesn't exist.

- [ ] **Step 3: Implement** the rule and delete `clientModules`.

- [ ] **Step 4: Run** `npm test && npm run build`. Expected: pass, and the build's verify step lists no failures. Then delete `"use client"` from `src/components/Select/Select.tsx`, run `npm run build`, confirm it fails naming `components/Select/Select.js`, and restore it (Rule 4).

- [ ] **Step 5: Commit** with message `Derive the client-module check from dist`.

### Task 3: `NavBar` and `NavBarLink`

**Files:**
- Create: `src/components/NavBar/{NavBar.tsx,NavBarLink.tsx,NavBarContext.ts,NavBar.css.ts,NavBar.test.tsx,NavBar.test-d.tsx,NavBar.browser.test.tsx,NavBar.stories.tsx,index.ts}`, `src/components/Icon/internal/Menu.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Box`, `IconButton`, `Icon`, `focusRing`, `warnOnce`, `cx`, `layered`, `PolymorphicProps`, `breakpoints`.
- Produces: `NavBar`, `NavBarProps` (`'aria-label': string` required; `brand?`, `actions?`: `ReactNode`; `sticky?: boolean`; `menuLabel?: string`; `children`); `NavBarLink`, `NavBarLinkProps<E extends ElementType = 'a'>` (`active?: boolean`, `startIcon?: ReactElement`, `as`). Internal: `NavBarContext` value `{ open: boolean; closeFromLink(): void }`, `null` outside a `NavBar`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('renders a named nav with one list, each link in an li, including through a fragment', () => {
  render(<NavBar aria-label="Main"><><NavBarLink href="/a">A</NavBarLink><NavBarLink href="/b">B</NavBarLink></></NavBar>);
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getAllByRole('list')).toHaveLength(1);
  expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
});
it('active sets aria-current="page" and data-active');
it('as renders the given component with href and active'); // a stand-in forwardRef link component
it('startIcon is decorative');
it('brand and actions render outside the list');
it('outside a NavBar, NavBarLink warns once and renders without an li');
it('the menu button is named by menuLabel, defaulting to "Menu"');
it('sticky applies the sticky class');
```

`NavBar.test-d.tsx`: omitting `aria-label` is a type error; `NavBarLink as={...}` accepts the component's props.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/NavBar`. Expected: fail, module missing.

- [ ] **Step 3: Implement.** `Collapsible.Root` renders the `nav` (`render={<nav />}`), controlled `open`. Children of the `nav` are grid items: brand, `Collapsible.Trigger` rendering `IconButton size="md"` with the `Menu` icon, actions, and `Collapsible.Panel keepMounted` containing the `ul`. Below `md`, template areas put brand, actions, menu on one row and the panel full-width beneath; from `md`, brand, panel, actions in one row, the trigger `display: none`, and the panel's `hidden` and height overridden (`display: block`, `height: auto`) so the closed panel still shows. Card appearance per Spec 10 (`bg.surface`, `radius.card`, `shadow.card`, `border.surface`, `space.2`/`space.3` padding). `NavBarLink`: `fg.muted`, `medium`, no underline; hover and active `fg.default`; active adds a 2px `bg.accent` bar (a pseudo-element, so layout doesn't shift); `focusRing`. `sticky`: `position: sticky`, `zIndex.sticky`, `insetBlockStart: space.2`.

- [ ] **Step 4: Run** the Step 2 command. Expected: pass.

- [ ] **Step 5: Browser tests (layout):** at 1280px, the menu button isn't visible, every link is visible in one row with brand and actions, and the accessibility tree (via `cdp()` `Accessibility.getFullAXTree`) has each link name once; at 390px the button is visible and links aren't; with the panel closed at 1280px (no JS state change), links are visible. Server HTML: `renderToString(<NavBar …/>)` into a container at 1280px, not hydrated, shows the links and hides the button (Spec 10's "links visible at `md` without JavaScript"). `sticky` stays at the top after scrolling a tall page. Forced colors: the active bar is still visible. Run `npx vitest run --project browser src/components/NavBar`.

- [ ] **Step 6: Commit** with message `Add NavBar and NavBarLink`.

### Task 4: `NavBar` small-screen behavior

**Files:**
- Modify: `src/components/NavBar/{NavBar.tsx,NavBarLink.tsx,NavBar.css.ts,NavBar.browser.test.tsx,NavBar.stories.tsx}`

**Interfaces:**
- Consumes: Task 3's `NavBarContext`. Produces nothing new.

- [ ] **Step 1: Write the failing browser tests** (390px unless stated)

```tsx
it('opens the panel below the bar, pushing content down');   // a sibling after the nav moves down by the panel's height
it('Escape inside the nav closes and focuses the menu button');
it('a link click closes and focuses the menu button');
it('the menu button has data-panel-open and the panel data-open while open');
it('stacked links are at least 44px tall');
it('after widening to 1280px with the panel open, a link click does not focus the hidden button', async () => { // Review Focus 1
  // open at 390, page.viewport(1280, 800), click a link
  expect(document.activeElement).not.toBe(document.body);
  expect(screen.getByRole('button', { name: 'Menu', hidden: true })).not.toHaveFocus();
});
it('Escape that closes a Select in actions leaves the panel open', async () => { // Review Focus 2
  // panel open; open the Select in actions; press Escape once
  expect(screen.getByRole('combobox')).toHaveFocus();
  expect(panel).toHaveAttribute('data-open');
});
it("a link's own onClick runs, and preventDefault keeps the panel open"); // Review Focus 3
```

- [ ] **Step 2: Run** `npx vitest run --project browser src/components/NavBar`. Expected: the behavior tests fail (no close-on-click, no Escape handling).

- [ ] **Step 3: Implement.** `NavBar` keeps `open` state and a trigger ref. `onKeyDown` on the `nav`: when `open && key === 'Escape' && !event.defaultPrevented && navRef.current.contains(event.target as Node)`, close and focus the trigger. `closeFromLink()`: if open, close; focus the trigger only if `trigger.checkVisibility()`. `NavBarLink` composes its `onClick`: call the consumer's first, then `closeFromLink()` unless `event.defaultPrevented`. Stacked links get `minBlockSize: 44px` (`2.75rem`) below `md`. The open/close animation is the builder's choice within the motion rules; with reduced motion it's instant.

- [ ] **Step 4: Run** the Step 2 command. Expected: pass.

- [ ] **Step 5: Stories:** desktop and small-screen views (viewport parameters), active link, with `ColorModeToggle` in `actions`, sticky, the skip-link pattern with `VisuallyHidden focusable` (Spec 10 docs), Playground. Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add NavBar's small-screen menu`.

### Task 5: `Tabs`, `TabsList`, `Tab`, `TabsPanel`

**Files:**
- Create: `src/components/Tabs/{Tabs.tsx,TabsList.tsx,Tab.tsx,TabsPanel.tsx,TabsContext.ts,Tabs.css.ts,Tabs.test.tsx,Tabs.test-d.tsx,Tabs.browser.test.tsx,Tabs.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Base UI `Tabs`, `Icon`, `focusRing`, `warnOnce`, `splitLayoutProps`/`box` (as Select does for layout props on the root).
- Produces: `Tabs`, `TabsProps` (`({ value: string } | { defaultValue: string })` plus `onValueChange?(value: string): void`, `variant?: TabsVariant`, `size?: TabsSize`, `children`); `TabsVariant` (`'underline' | 'pill'`); `TabsSize` (`'sm' | 'md'`); `TabsList`, `TabsListProps`; `Tab`, `TabProps` (`value: string`, `disabled?`, `startIcon?: ReactElement`); `TabsPanel`, `TabsPanelProps` (`value: string`, `keepMounted?: boolean`). Internal: `TabsContext` `{ variant: TabsVariant; size: TabsSize }`, and the class names `tabsList`, `tab`, `indicator` that Task 6 styles.

- [ ] **Step 1: Write the failing tests**

```tsx
it('uncontrolled: defaultValue selects; clicking another tab switches panels');
it('controlled: onValueChange receives only the value', async () => {
  const onValueChange = vi.fn();
  render(<Tabs value="a" onValueChange={onValueChange}>…</Tabs>);
  await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).toHaveBeenCalledWith('b');
  expect(onValueChange.mock.calls[0]).toHaveLength(1);
});
it('inactive panel content is not rendered; keepMounted keeps it hidden with data-hidden');
it('TabsList warns once without aria-label or aria-labelledby');
it('a disabled tab cannot be activated and has data-disabled');
it('a value with no matching Tab renders no active tab and no panel', () => { // Review Focus 4
  render(<Tabs value="gone">…</Tabs>);
  expect(screen.queryByRole('tab', { selected: true })).toBeNull();
  expect(screen.queryByRole('tabpanel')).toBeNull();
});
it('variant and size apply their classes');
```

`Tabs.test-d.tsx`: `<Tabs>` with neither `value` nor `defaultValue` is a type error; `Tab` without `value` is a type error.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Tabs`. Expected: fail, module missing.

- [ ] **Step 3: Implement.** `TabsList` passes `activateOnFocus={false}` and renders `Tabs.Indicator` (class `indicator`, no `renderBeforeHydration`) after its children; Task 6 styles it, so here it's `display: none`. The list scrolls sideways (`overflow-x: auto`, `scrollbar-width: thin`) with block padding enough to keep focus rings unclipped. `Tab` heights 28px (`sm`, `font.size.sm`) and 36px (`md`, `font.size.md`), `medium`. Colors per Spec 10's table; the selected marker here is the CSS one only: `[data-active]::after` draws the 2px `bg.accent` bar (`underline`) or the `bg.muted` + 1px `border.control` ring with `radius.full` (`pill`), behind the label (tab content stacks above). Forced colors: bar `Highlight`, pill 1px `Highlight` border. `TabsPanel`: `focusRing` only.

- [ ] **Step 4: Run** the Step 2 command. Expected: pass.

- [ ] **Step 5: Browser tests:** ArrowRight moves focus without changing the selected tab, Enter and Space activate, Home/End move to the ends, arrows skip or land on a disabled tab without activating it; at 320px a long list scrolls, focusing the last tab scrolls it into view, and its focus ring's box is inside the list's visible rect. Run `npx vitest run --project browser src/components/Tabs`.

- [ ] **Step 6: Commit** with message `Add Tabs`.

### Task 6: `Tabs` sliding marker and server handoff

**Files:**
- Modify: `src/components/Tabs/{Tabs.css.ts,Tabs.browser.test.tsx,Tabs.stories.tsx}`

**Interfaces:**
- Consumes: Task 5's `tabsList`, `tab`, `indicator` classes. Produces nothing new.

- [ ] **Step 1: Write the failing browser tests** (both variants each)

```tsx
it('server HTML has the CSS marker and a hidden Indicator', () => {
  container.innerHTML = renderToString(<Example />);
  expect(container.querySelector(`.${indicator}`)).toHaveAttribute('hidden');
  expect(getComputedStyle(activeTab, '::after').display).not.toBe('none');
});
it('after hydration, the Indicator matches the CSS marker, the CSS marker is off, and nothing animates', async () => {
  // record the ::after rect from server HTML, hydrateRoot, wait for Indicator to lose `hidden`
  expect(indicatorRect).toEqual(cssMarkerRect);          // within 0.5px
  expect(getComputedStyle(activeTab, '::after').display).toBe('none');
  expect(indicator.getAnimations()).toHaveLength(0);
});
it('switching tabs slides the Indicator (transform and width transition)');
it('reduced motion makes the transition duration 0s');   // cdp emulation
it('the Indicator stays aligned after the font loads, the window resizes, and the list scrolls');
it('hiding the Indicator again brings back the CSS marker');
it('forced colors: the Indicator uses Highlight');
```

`::after` geometry can't be read with `getBoundingClientRect`; compute it from the tab's rect plus the pseudo-element's computed `inset`/`width`/`height`, in a small helper in the test file.

- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Tabs`. Expected: the hydration, slide, and motion tests fail (the `Indicator` is `display: none`).

- [ ] **Step 3: Implement.** `indicator`: absolutely positioned in the list (`position: relative` on the list), `transform: translateX(var(--active-tab-left))`, `width: var(--active-tab-width)`, the same tokens and block position as the `::after` marker, below the tab labels; `transition` on `transform` and `width` with `motion.duration.base` and `motion.easing.standard`. `[hidden]` keeps `display: none`. The handoff is one rule: `.tabsList:has(> .indicator:not([hidden])) .tab[data-active]::after { display: none }`, built from the vanilla-extract classes, never literal class names. No React state, no inline script.

- [ ] **Step 4: Run** the Step 2 command. Expected: pass.

- [ ] **Step 5: Stories** for both variants × sizes, disabled, icons, `keepMounted` with a form, a long scrolling list, and a "Tabs or links?" docs block (Spec 10). Run `npm run test:stories`.

- [ ] **Step 6: Commit** with message `Add the Tabs sliding marker`.

### Task 7: `Prose` and `NotProse`

**Files:**
- Create: `src/components/Prose/{Prose.tsx,NotProse.tsx,Prose.css.ts,Prose.test.tsx,Prose.test-d.tsx,Prose.browser.test.tsx,Prose.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (`serverModules` += `components/Prose/Prose.js`, `components/Prose/NotProse.js`)

**Interfaces:**
- Consumes: `Box`, `cx`, `componentsLayer`, `PolymorphicProps`, and `withDefaultDisplay`'s logic generalized: rename it to `withDefault<T>(value: Responsive<T> | undefined, fallback: T): Responsive<T>` in the same file, keep `withDefaultDisplay` as a call to it, and use it for `maxWidth` with fallback `'prose'`.
- Produces: `Prose`, `ProseProps<E extends ElementType = 'div'>` (`size?: ProseSize`, layout props, `as`, `dangerouslySetInnerHTML`); `ProseSize` (`'sm' | 'md'`); `NotProse`, `NotProseProps<E extends ElementType = 'div'>`. Internal: classes `prose`, `proseSize.{sm,md}`, `notProse`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('defaults to a div with maxWidth prose and size md');
it('as="article" renders an article');
it('size="sm" applies the sm class');
it('dangerouslySetInnerHTML renders the HTML');
it('maxWidth="full" removes the limit');
it('a responsive maxWidth without base gets prose at base');  // Review Focus 5, class-level
it('NotProse renders a div, accepts as="span" and layout props');
```

`Prose.test-d.tsx`: `size="lg"` is a type error; `Prose` accepts `marginX`.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Prose`. Expected: fail, module missing.

- [ ] **Step 3: Implement.** Root and size classes per Spec 11's table. Every descendant rule is a `globalStyle` in `componentsLayer`, with selector `` `:where(${prose}) p:not(:where(${notProse}, ${notProse} *))` `` (one helper builds it, so the `NotProse` exclusion can't be forgotten). Margins in `em`; first child no top margin, last child no bottom margin. Block spacing includes direct-child `NotProse` and `[data-ds-table]`. Heading sizes per Spec 11's table for each `size`. Headings get `scroll-margin-block-start` computed from tokens as the sticky `NavBar`'s default height plus its offset plus `space.4`, so it tracks theme changes. `NotProse` resets per Spec 11.

- [ ] **Step 4: Run** the Step 2 command. Expected: pass.

- [ ] **Step 5: Browser tests** for every item in Spec 11's browser list, plus: at 1024px, `<Prose maxWidth={{ lg: 'full' }}>` is 68ch of its own font, and at 1280px it fills its parent (Review Focus 5); `Link tone="neutral"` inside `Prose` takes the paragraph color and `tone="accent"` keeps `fg.accent` (the existing Spec 11 addition); `<pre><Code>` and `<pre><span><code>` have no background. Font checks compare computed `font-family`'s first family. Run `npx vitest run --project browser src/components/Prose`.

- [ ] **Step 6: Stories:** a kitchen-sink article (every element in Spec 11's table, a `NotProse` `Card`, a focusable `pre`) at both sizes, and an MDX docs page covering Markdown/MDX setup, element mapping, `pre` `tabIndex={0}`, `NotProse`, and that `Prose` doesn't sanitize. Run `npm run test:stories && npm run build`.

- [ ] **Step 7: Commit** with message `Add Prose and NotProse`.

### Task 8: Docs pages, fixtures, and milestone acceptance

**Files:**
- Create: `src/components/Navigation.stories.tsx`, `fixtures/next-app/app/blog/page.tsx`, `fixtures/next-app/app/SiteNav.tsx` (server component rendering `NavBar` with `next/link`)
- Modify: `src/components/overviewPages.test.ts`, `fixtures/next-app/app/layout.tsx`, `fixtures/vite-app/src/main.tsx`, `tests/fixtures/smoke.spec.ts`, `README.md`, `docs/HANDOFF.md`

**Interfaces:**
- Consumes: everything above. Produces nothing new.

- [ ] **Step 1: Write the failing fixture tests.** Next: the raw HTML of `/` contains the `nav` with every link and the active tab's `data-active`; `/blog`'s raw HTML contains the `Prose` article; with `javaScriptEnabled: false` at 1280px the links are visible; at 390px, opening the menu and clicking the `/blog` `next/link` navigates client-side, closes the panel, and focuses the menu button; no hydration warnings on either page (reuse `color-mode.spec.ts`'s console check). Vite: `NavBar`, `Tabs`, and `Prose` render with styles. Run `npm run test:fixtures`; expected: fail, nothing rendered yet.

- [ ] **Step 2: Add the renders** (`Tabs` with server-rendered panel content on `/`) until they pass.

- [ ] **Step 3: Write `Navigation.stories.tsx`** (a site shell: sticky `NavBar`, `Tabs` in the page, a `Prose` article with an anchor link that lands below the `NavBar`), and add it to `overviewPages.test.ts`'s no-`style`/`className` list. The anchor test from Spec 11 lives here as a play function. Add `NavBar`, `Tabs`, `Prose` to the README's component list.

- [ ] **Step 4: Audit.** Walk Specs 10 and 11's acceptance criteria and test lists and record each as passed (with the test name) or as needing the owner. Run `npm ci && npm run check`. Expected: exit 0, all projects ran, no warnings.

- [ ] **Step 5: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the PR's merge box. Don't close and reopen the PR. Expected: all CI jobs pass.

- [ ] **Step 6: Manual checks to hand to the owner, not mark done,** listed in the PR body: screen reader passes on `NavBar` (desktop and menu), `Tabs`, and a `Prose` article; forced colors on all three; 200% text on `Prose` (Specs 10 and 11, Spec 05's checklist).

- [ ] **Step 7: Update `docs/HANDOFF.md` through the `handoff` skill** (pass `docs/HANDOFF.md`, per open thread 5), as a reconciliation: open thread 3 resolved by Tasks 1–2 with commits; threads 1, 2, 4, 5, 6 carried forward with their triggers (thread 4's trigger is the v0.4 plan); next steps become the owner's manual checks, merge, and `npm run release -- minor`. Commit with message `Add Navigation overview page and fixtures`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks above, merging, and releasing v0.3.0.
