# v0.4 Overlays and Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.4: `Dialog`, `Popover`, `Tooltip`, `Menu`, `Toast` (Spec 12) and `Table`, `DataTable`, `Pagination`, `Skeleton`, `EmptyState` (Spec 13), plus the handoff's open threads 1–3.

**Architecture:** Overlays are `"use client"` wrappers over Base UI 1.9.0, sharing one internal module (`src/components/overlays/`) for the trigger type, positioning props, token-driven gap, popup surface, and motion. Data parts are server-safe `Box`-style components; only `DataTable` is a client component, composed from the same parts plus `Pagination` and `Skeleton`.

**Tech Stack:** As v0.3. `@base-ui/react` stays at `^1.9.0` (installed 1.9.0, latest on npm 1.9.0, checked 2026-11-10). No new runtime dependencies.

**Spec:** `docs/specs/12-overlays.md` and `docs/specs/13-data.md`, with `docs/specs/05-component-conventions.md`. Read the task's spec section before starting it. Exact values (tokens, sizes, defaults, copy) live there, and this plan doesn't repeat tables.

## Decisions on the open threads

**Thread 1 (deferred v0.3 minors).** All five become Task 1, since each is a few lines and two of them guard work this milestone adds (13 new client modules; RTL popups).

| Minor | Decision |
|---|---|
| Tabs `Indicator` uses `insetInlineStart` with physical `translateX` | Fix: physical `left: 0`, plus an RTL test |
| `onValueChange(null)` when no tab is enabled | Fix: the wrapper calls the consumer only when the value is a string |
| `Prose` inside `NotProse` gets no styles | Document it in the Prose docs (no code change; Spec 11 says `NotProse` excludes descendants) |
| `client-modules.mjs` misses `import * as React` and `import React, { useState }` | Fix, with script tests |
| `Prose` `kbd` uses physical `borderBottomWidth` | Fix: `borderBlockEndWidth` |

**Thread 2 (`npm audit`).** Task 17 Step 4 reruns it. Installed `typescript-eslint` is 8.72.1; npm's latest is 8.72.2, which the handoff recorded as still affected.

**Thread 3 (`ColorModeToggle` pass-through).** Task 6, after `Tooltip` exists, with the wrapping test.

## Departures from the spec

None found while planning. Two Base UI mappings that are internal, not departures: `closeOnOutsideClick={false}` becomes `Dialog.Root`'s `disablePointerDismissal`, and `Tooltip`'s `delay` goes to `Tooltip.Trigger` (where 1.9.0 puts it). If a task can't meet the spec as written, stop and raise it.

## Global Constraints

- Branch `feat/v0.4-overlays-and-data` from an up-to-date `main`. One commit per task, one PR. **No co-author or generated-by lines in commits or the PR body** (owner's standing rule). The first commit adds this plan.
- Base UI 1.9.0 names, confirmed in the installed types: `Dialog.{Root,Trigger,Portal,Backdrop,Popup,Title,Description,Close}` (`Root`: `open`, `defaultOpen`, `onOpenChange(open, details)`, `disablePointerDismissal`, `modal`; `Popup`: `initialFocus`, `finalFocus`); `AlertDialog` (same parts); `Popover.{Root,Trigger,Portal,Positioner,Popup,Arrow,Title,Description,Close}`; `Tooltip.{Provider,Root,Trigger,Portal,Positioner,Popup}` (`Provider`: `delay`, `closeDelay`, `timeout`; `Root`: `disabled`, `open`, `defaultOpen`, `onOpenChange`; `Trigger`: `delay`, `closeOnClick`); `Menu.{Root,Trigger,Portal,Positioner,Popup,Item,LinkItem,CheckboxItem,CheckboxItemIndicator,RadioGroup,RadioItem,RadioItemIndicator,Group,GroupLabel,Separator,SubmenuRoot,SubmenuTrigger}` (`Root`: `modal`; `LinkItem`: `closeOnClick`); `Toast.{Provider,Viewport,Portal,Root,Content,Title,Description,Close,Action}`, `useToastManager`, `createToastManager` (options: `title`, `description`, `type`, `timeout`, `priority: 'low' | 'high'`, `actionProps`, `id`, `onClose`; `Provider`: `limit`, `timeout`, `toastManager`). Positioner `side` is `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`; `sideOffset` takes a number or `({ side, align, anchor, positioner }) => number`.
- Only `src/components/**` imports Base UI; `dist/index.d.ts` never mentions `base-ui` (existing check).
- All Spec 12 modules and `DataTable` begin with `"use client"`. `Table*`, `Pagination`, `Skeleton`, `EmptyState` don't, and go in `verify-dist`'s `serverModules`.
- Change handlers receive only the value (`onOpenChange(open)`), per Spec 05.
- Style values come from `vars` only. Hover inside `@media (hover: hover)`. Only `opacity`, `transform`, and colors animate, on `motion.*` tokens. Logical properties throughout. Forced-colors rules where the spec names them.
- Development warnings use `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix it.
- New internal icons are copied from `node_modules/lucide-react` into `src/components/Icon/internal/` with the same ISC header as `ChevronDown.tsx`: `X`, `ChevronRight`, `ChevronLeft`, `ArrowUpDown`, `CircleCheck`, `CircleAlert`, `TriangleAlert`, `Info`. Reuse the existing `Check`, `ArrowUp`, `ArrowDown`, and `Button/Spinner`.
- Viewport checks go in `*.browser.test.tsx` with `page.viewport(w, h)`; media emulation (reduced motion, forced colors) through `cdp()`, as in v0.3.
- Don't change anything a spec doesn't ask for.

## Review Focus

Each has a test in the named task.

1. **A theme that overrides `space['1.5']` (Task 2).** `space` is in the theme contract, so the popup gap must follow the theme, not a hardcoded `6`. A `ThemeProvider` with `space: { '1.5': '1rem' }` puts a `Popover` 16px from its trigger.
2. **`Tooltip` around a `ColorModeToggle` under a forced `ThemeProvider` (Task 6).** The toggle renders `null`; the tooltip must render nothing and not throw.
3. **`toast.promise` whose loading toast was dismissed before it settles (Task 10).** No toast reappears, and the returned promise still resolves or rejects with the original value.
4. **`DataTable` Select page when every row on the page is disabled (Task 16).** `aria-pressed="false"`, and pressing it changes nothing and doesn't call `onSelectionChange`.
5. **A `Menu` opened from a cell under `stickyHeader` and `stickyFirstColumn` (Task 12).** Spec 13 says sticky cells can't cover page overlays; the menu popup is the top element at its center point (`document.elementFromPoint`).

---

### Task 1: Deferred v0.3 minors

**Files:**
- Modify: `src/components/Tabs/{Tabs.tsx,Tabs.css.ts,Tabs.test.tsx,Tabs.browser.test.tsx}`, `src/components/Prose/{Prose.css.ts,Prose.stories.tsx}` (docs block), `scripts/{client-modules.mjs,client-modules.test.mjs}`

**Interfaces:** None new.

- [ ] **Step 1: Write the failing tests.** `Tabs.browser.test.tsx`: `it('the Indicator sits under the active tab in RTL')`: in `<div dir="rtl">`, after hydration the `Indicator`'s rect matches the active tab's within 0.5px. `Tabs.test.tsx`: `it('onValueChange is never called with null when no tab is enabled')`: uncontrolled, every `Tab disabled`, spy never receives a non-string. `client-modules.test.mjs`: modules using `import * as React from 'react'; React.useState(...)` and `import React, { useState } from 'react'` are detected as client modules.
- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Tabs && npx vitest run --project unit src/components/Tabs && node --test scripts/client-modules.test.mjs`. Expected: the three new tests fail for their stated reasons.
- [ ] **Step 3: Implement.** Indicator: `left: 0` instead of `insetInlineStart: 0` (`Tabs.css.ts:153`). `Tabs.tsx:59`: forward only `typeof value === 'string'`. `client-modules.mjs`: namespace and default-plus-named React imports. `Prose.css.ts:190`: `borderBlockEndWidth`. Prose docs: one line that a `Prose` nested inside `NotProse` is unstyled; close the `NotProse` instead.
- [ ] **Step 4: Run** the Step 2 commands plus `npx vitest run --project browser src/components/Prose`. Expected: all pass.
- [ ] **Step 5: Commit** `Fix deferred v0.3 review minors`.

### Task 2: Overlay foundations

**Files:**
- Create: `src/components/overlays/{trigger.ts,positioning.ts,positioning.test.ts,popup.css.ts,overlays.browser.test.tsx}`, the eight internal icons above

**Interfaces:**
- Produces:
  - `trigger.ts`: `type OverlayTriggerProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & { children: ReactElement }`. Each trigger part renders `<Base.Trigger {...props} render={children} />` with no `Children.only`/`isValidElement`.
  - `positioning.ts`: `type OverlaySide = 'top' | 'bottom' | 'start' | 'end'`; `type OverlayAlign = 'start' | 'center' | 'end'`; `toBaseSide(side: OverlaySide)` (`start` → `inline-start`, `end` → `inline-end`); `gapOffset: OffsetFunction` that reads `space['1.5']`'s custom property from the positioner's computed style and converts `rem`/`px` to px (root font size for `rem`).
  - `popup.css.ts`: `popupSurface` (`bg.raised`, `1px solid border.surface`, `shadow.raised`, `radius.lg`), `popupMotion` (opacity plus a small translate toward the trigger per `[data-side]`, on `[data-starting-style]`/`[data-ending-style]`, `motion.duration.fast`, `motion.easing.enter`/`exit`), `positioner` (`zIndex.popover`, `maxWidth: calc(100vw - 2 * space.4)`).

- [ ] **Step 1: Write the failing tests.** `positioning.test.ts`: `toBaseSide` maps all four; `gapOffset` returns `6` for `0.375rem` at a 16px root and `10` for `10px`. `overlays.browser.test.tsx` uses a minimal internal `Popover.Root` fixture: `it('the gap is 6px by default')`; `it('the gap follows a theme override of space 1.5')` (Review Focus 1: `ThemeProvider` with `space: { '1.5': '1rem' }` → 16px); `it('reduced motion makes popup transitions 0s')`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/overlays && npx vitest run --project browser src/components/overlays`. Expected: fail, modules missing.
- [ ] **Step 3: Implement** the three modules and icons.
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Commit** `Add shared overlay internals`.

### Task 3: `Dialog`

**Files:**
- Create: `src/components/Dialog/{Dialog.tsx,DialogTrigger.tsx,DialogContent.tsx,DialogTitle.tsx,DialogDescription.tsx,DialogClose.tsx,DialogContext.ts,Dialog.css.ts,Dialog.test.tsx,Dialog.test-d.tsx,Dialog.browser.test.tsx,Dialog.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Task 2's `OverlayTriggerProps`, `popupMotion`; `IconButton`, `Icon`, `XIcon`, `Heading`/`Text` styles as needed.
- Produces: `Dialog`, `DialogProps` (`open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`, `alert?: boolean`, `closeOnOutsideClick?: boolean`, `children`); `DialogTrigger`, `DialogClose` (`OverlayTriggerProps`); `DialogContent`, `DialogContentProps` (`size?: DialogSize`, `showClose?`, `closeLabel?`, `initialFocus?`, `finalFocus?`: `RefObject<HTMLElement | null>`, `aria-label?`, `className`, `style`); `DialogSize` (`'sm' | 'md' | 'lg'`); `DialogTitle`, `DialogDescription`. Internal `DialogContext` `{ alert: boolean; titleMounted; descriptionMounted; closeMounted }` for the warnings.

- [ ] **Step 1: Write the failing tests**

```tsx
it('uncontrolled: the trigger opens it; DialogClose closes it');
it('controlled: onOpenChange receives only the boolean', async () => {
  // click trigger; expect(onOpenChange).toHaveBeenCalledWith(true); expect(onOpenChange.mock.calls[0]).toHaveLength(1)
});
it("the trigger child gets props and ref, and keeps its own onClick");
it('DialogTitle is an h2 naming the dialog; DialogDescription is a p describing it');
it('the close button is last in the popup, named by closeLabel ("Close" by default)');
it('alert renders role="alertdialog" with no close button');
it('open: DialogContent has data-open and the trigger child has data-popup-open');
it('warns: no title and no aria-label; alert without DialogDescription; no close button and no DialogClose; closeOnOutsideClick with alert');
```

`Dialog.test-d.tsx`: `DialogTrigger` with two children or a string is a type error; `DialogContent size="xl"` is a type error; `DialogContent as` is a type error.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Dialog`. Expected: fail, module missing.
- [ ] **Step 3: Implement.** `alert` picks `AlertDialog` or `Dialog` as the root (so changing it remounts, per spec). `DialogContent` renders `Portal` → `Backdrop` (`color.overlay`, `zIndex.overlay`) → `Popup` (`bg.raised`, `1px border.surface`, `shadow.dialog`, `radius.card`, `space.6` padding, `zIndex.modal`, `display: flex` column, `gap: space.4`, `width: min(size.dialog.{size}, 100% - 2 * space.4)`, `maxHeight: calc(100dvh - 2 * space.4)`, `overflowY: auto`, centered), children, then the close `IconButton` (`ghost`, `sm`, absolutely positioned at the top inline-end corner). Pass `initialFocus`/`finalFocus` through; leave touch focus to Base UI. Title/description/close presence registers in context via effects; warnings fire on open.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests:** focus trap (Tab and Shift+Tab cycle inside); focus returns to the trigger, or to `finalFocus`; `initialFocus` wins; `Escape` closes (also with `alert`); outside click closes, not with `closeOnOutsideClick={false}` or `alert`; scroll lock: the body doesn't scroll and a reference element's `getBoundingClientRect().left` is unchanged on open (with a page scrollbar); tall content scrolls inside a popup that stays within the viewport; at 320×600, the popup is `320 - 2 × space.4` wide; reduced motion still closes. Run `npx vitest run --project browser src/components/Dialog`.
- [ ] **Step 6: Stories:** sizes, form dialog with `closeOnOutsideClick={false}`, `alert` confirm-delete, tall content. Run `npm run test:stories`.
- [ ] **Step 7: Commit** `Add Dialog`.

### Task 4: `Popover`

**Files:**
- Create: `src/components/Popover/{Popover.tsx,PopoverTrigger.tsx,PopoverContent.tsx,PopoverTitle.tsx,PopoverDescription.tsx,PopoverClose.tsx,Popover.css.ts,Popover.test.tsx,Popover.test-d.tsx,Popover.browser.test.tsx,Popover.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Task 2 (all of it); `splitLayoutProps`.
- Produces: `Popover`, `PopoverProps` (`open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`); `PopoverTrigger`, `PopoverClose` (`OverlayTriggerProps`); `PopoverContent`, `PopoverContentProps` (`side?: OverlaySide` = `'bottom'`, `align?: OverlayAlign` = `'center'`, `arrow?: boolean`, `initialFocus?`, layout props, `aria-label?`); `PopoverTitle` (`h2`), `PopoverDescription` (`p`).

- [ ] **Step 1: Write the failing tests:** controlled and uncontrolled with boolean-only `onOpenChange`; trigger child props/ref/onClick; title names the popup; warns without `PopoverTitle` or `aria-label`; `width`/`maxWidth` layout props apply to the popup; `arrow` renders the arrow only when set; open, `PopoverContent` has `data-open` and the trigger child `data-popup-open`. Type test: `side="left"` is a type error.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Popover`. Expected: fail, module missing.
- [ ] **Step 3: Implement.** `Positioner` with `toBaseSide(side)`, `align`, `sideOffset={gapOffset}`, class `positioner`. `Popup`: `popupSurface`, `popupMotion`, `space.4` padding, layout props. `Arrow`: same background, border, and shadow as the popup, rotated per `[data-side]`, forced colors draw its border with `CanvasText`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests:** focus moves into the popup and returns to the trigger on close; the page stays usable (a button outside can be clicked, which also closes it); `Escape` and outside click close; the arrow's center is within 1px of the trigger's center on each `side`, including after flipping near the bottom edge; flips near the viewport edge with `side="end"` in LTR and RTL; popup width ≤ viewport at 320px. Run `npx vitest run --project browser src/components/Popover`.
- [ ] **Step 6: Stories** (filters popover, each side, `arrow`) and **commit** `Add Popover`.

### Task 5: `Tooltip` and `TooltipProvider`

**Files:**
- Create: `src/components/Tooltip/{Tooltip.tsx,TooltipProvider.tsx,Tooltip.css.ts,Tooltip.test.tsx,Tooltip.test-d.tsx,Tooltip.browser.test.tsx,Tooltip.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Task 2's positioning and `popupMotion`.
- Produces: `Tooltip`, `TooltipProps` (`content: ReactNode` required, `children: ReactElement`, `side?` = `'top'`, `align?` = `'center'`, `delay?: number`, `open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`, `disabled?: boolean`); `TooltipProvider`, `TooltipProviderProps` (`delay?: number`, `children`). Internal: a context carrying the provider's `delay` so `Tooltip` resolves `delay ?? providerDelay ?? 600`.

- [ ] **Step 1: Write the failing tests:** `content` renders in the popup when open, which has `data-open`; `disabled` never opens; controlled/uncontrolled with boolean-only `onOpenChange`; the trigger child gets no `aria-describedby` or other ARIA from the tooltip (visual only); a `Link` child works. Type test: missing `content` is a type error.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Tooltip`. Expected: fail, module missing.
- [ ] **Step 3: Implement.** `Tooltip.Root` + `Trigger render={children}` with `delay` + `Portal`/`Positioner` (`zIndex.tooltip`) + `Popup`: `bg.inverse`, `fg.inverse`, `font.size.xs`, `medium`, `radius.sm`, `space.1`/`space.2` padding, `1px border.surface`, a max width (builder's choice, e.g. `20rem`). `TooltipProvider` wraps `Tooltip.Provider` and the delay context.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests:** opens after `delay` on hover and immediately on keyboard focus; `Escape` dismisses; moving the pointer onto the popup keeps it open; clicking the trigger closes it; a touch tap (`pointerType: 'touch'`) doesn't open it; inside `TooltipProvider`, a second tooltip opens with no delay right after the first closes. Run `npx vitest run --project browser src/components/Tooltip`.
- [ ] **Step 6: Stories** (toolbar in a provider; disabled-button docs note) and **commit** `Add Tooltip`.

### Task 6: `ColorModeToggle` pass-through (thread 3)

**Files:**
- Modify: `src/components/ColorModeToggle/{ColorModeToggle.tsx,ColorModeToggle.test.tsx,ColorModeToggle.test-d.tsx}`

**Interfaces:**
- Produces: `ColorModeToggleProps` becomes `Omit<IconButtonProps<'button'>, 'icon' | 'aria-label' | 'variant' | 'as' | 'children'> & { labels?; variant? }`, so `ref`, `style`, `className`, layout props, and button props pass to the `IconButton`. The consumer's `onClick` runs first; the toggle flips unless `event.defaultPrevented`.

- [ ] **Step 1: Write the failing tests**

```tsx
it('forwards ref, style, data-*, and onClick to the button');
it('works as a Tooltip child: hover shows the tooltip, click toggles the mode');
it('a forced ThemeProvider inside a Tooltip renders nothing and does not throw'); // Review Focus 2
```

Type test: `<ColorModeToggle ref={createRef<HTMLButtonElement>()} style={{}} />` compiles; `icon` and `aria-label` are type errors.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/ColorModeToggle`. Expected: the forwarding and Tooltip tests fail (props aren't typed or merged).
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the Step 2 command plus `npm run typecheck`. Expected: pass.
- [ ] **Step 5: Commit** `Let ColorModeToggle take ref, style, and button props`.

### Task 7: `Menu`

**Files:**
- Create: `src/components/Menu/{Menu.tsx,MenuTrigger.tsx,MenuContent.tsx,MenuItem.tsx,MenuLinkItem.tsx,MenuCheckboxItem.tsx,MenuRadioGroup.tsx,MenuRadioItem.tsx,MenuGroup.tsx,MenuSeparator.tsx,Menu.css.ts,Menu.test.tsx,Menu.test-d.tsx,Menu.browser.test.tsx,Menu.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Task 2; `CheckIcon`; `PolymorphicProps` (for `MenuLinkItem` only).
- Produces: `Menu`, `MenuProps` (`open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`); `MenuTrigger`; `MenuContent`, `MenuContentProps` (`side?` = `'bottom'`, `align?` = `'start'`); `MenuItem`, `MenuItemProps` (`onClick?`, `disabled?`, `startIcon?: ReactElement`, `tone?: 'neutral' | 'danger'`, `closeOnClick?` = `true`); `MenuLinkItem`, `MenuLinkItemProps<E extends ElementType = 'a'>` (`href`, `as`, `disabled?`, `startIcon?`, `closeOnClick?` = `true`); `MenuCheckboxItem` (`checked?`, `defaultChecked?`, `onCheckedChange?(checked: boolean)`, `disabled?`, `closeOnClick?` = `false`); `MenuRadioGroup` (`value?`, `defaultValue?`, `onValueChange?(value: string)`); `MenuRadioItem` (`value`, `disabled?`, `closeOnClick?` = `false`); `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`. Internal class `menuItem` (Task 8's submenu trigger reuses it).

- [ ] **Step 1: Write the failing tests:** controlled/uncontrolled, boolean-only `onOpenChange`; `MenuItem` `onClick` fires and closes, `closeOnClick={false}` keeps it open; `MenuLinkItem` renders a link, `as` renders the given component with `href`, and it closes on click; checkbox and radio items set `data-checked`/`data-unchecked` and show the check icon only when checked, with `onCheckedChange`/`onValueChange` receiving only the value; `MenuGroupLabel` names its group (`getByRole('group', { name })`); `tone="danger"` sets its class; disabled items have `data-disabled`; highlighted items `data-highlighted`; open, `MenuContent` has `data-open` and the trigger child `data-popup-open`. Type test: `MenuItem as` is a type error; `MenuLinkItem as={Stub}` accepts `Stub`'s props.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Menu`. Expected: fail, module missing.
- [ ] **Step 3: Implement.** `Menu.Root modal={false}`. Popup: `popupSurface`, `space.1` padding, `maxHeight: var(--available-height)`, `overflowY: auto`. Items: `font.size.md`, `minBlockSize: max(2rem, …)` and at most `size.control.md`, `space.2` inline padding, `radius.md`, `[data-highlighted]` → `bg.muted`; danger → `fg.danger`, highlighted `bg.dangerSubtle`; the indicator column reserves space only when the menu has checkable items (builder's choice how).
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests:** arrow keys, Home/End, and type-ahead move highlight; `Escape` closes and returns focus to the trigger; the page still scrolls with the menu open (`window.scrollBy` changes `scrollY`); a tall menu scrolls and stays in the viewport; flips near the edge in LTR and RTL. Run `npx vitest run --project browser src/components/Menu`.
- [ ] **Step 6: Commit** `Add Menu`.

### Task 8: Submenus and overlays together

**Files:**
- Create: `src/components/Menu/{MenuSubmenu.tsx,MenuSubmenuTrigger.tsx,MenuSubmenuContent.tsx}`, `src/components/Overlays.browser.test.tsx`
- Modify: `src/components/Menu/{Menu.css.ts,Menu.test.tsx,Menu.browser.test.tsx,Menu.stories.tsx,index.ts}`, `src/index.ts`

**Interfaces:**
- Consumes: Task 7's `menuItem`; `ChevronRightIcon`.
- Produces: `MenuSubmenu` (`open?`, `defaultOpen?`, `onOpenChange?(open: boolean)`, `disabled?`), `MenuSubmenuTrigger` (`startIcon?`, `disabled?`), `MenuSubmenuContent` (children).

- [ ] **Step 1: Write the failing browser tests**

```tsx
it('opens a submenu on hover, on tap, and with ArrowRight (LTR) / ArrowLeft (RTL)');
it('the opposite arrow and Escape close only the submenu');
it('the submenu chevron flips in RTL');
// Overlays.browser.test.tsx
it('Select, Menu, and Tooltip open above a Dialog and work inside it');
it('a Dialog opened from a MenuItem returns focus to the MenuTrigger child via finalFocus');
it('Tooltip around MenuTrigger: hover shows the tooltip, click opens the menu');
```

- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Menu src/components/Overlays.browser.test.tsx`. Expected: fail, submenu parts missing (the cross-overlay tests may already pass; if so, break `finalFocus` passing in `DialogContent`, see the test fail, and restore it).
- [ ] **Step 3: Implement** on `Menu.SubmenuRoot`/`SubmenuTrigger` with `toBaseSide('end')`; the chevron flips with `:dir(rtl)`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Stories:** row actions with `IconButton`, checkbox/radio view options, submenu, the confirm-delete recipe (Spec 12 "Opening from a `MenuItem`"). Run `npm run test:stories`.
- [ ] **Step 6: Commit** `Add Menu submenus and cross-overlay tests`.

### Task 9: `Toast`

**Files:**
- Create: `src/components/Toast/{ToastProvider.tsx,useToast.ts,createToastManager.ts,toastOptions.ts,ToastList.tsx,Toast.css.ts,toastOptions.test.ts,Toast.test.tsx,Toast.test-d.tsx,Toast.browser.test.tsx,Toast.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Base UI `Toast`; tone icons from Task 2; `IconButton`, `XIcon`, `Button`.
- Produces: `ToastProvider`, `ToastProviderProps` (`position?: ToastPosition` = `'bottom-end'`, `limit?` = `3`, `duration?` = `5000`, `closeLabel?` = `'Dismiss'`, `viewportLabel?` = `'Notifications'`, `manager?: ToastManager`, `children`); `ToastPosition`; `ToastTone` (`'neutral' | 'success' | 'warning' | 'danger' | 'info'`); `ToastOptions` (`title?`, `description?`, `tone?`, `action?: { label: ReactNode; onClick(): void }`, `duration?: number`, `id?: string`); `ToastManager` `{ add(o): string; update(id, o): void; close(id?): void; promise<T>(p: Promise<T>, states: ToastPromiseStates<T>): Promise<T> }`; `ToastPromiseStates<T>` (`loading`, `success`, `error`, each `string | ToastOptions | ((v) => string | ToastOptions)`, `loading` without the function form); `useToast(): ToastManager`; `createToastManager(): ToastManager`. Internal: `toBaseOptions(o: ToastOptions, providerDuration: number)` in `toastOptions.ts`.

- [ ] **Step 1: Write the failing tests**

```ts
// toastOptions.test.ts
it('maps tone to type and priority: danger is high, others low');
it('duration rules', () => {
  expect(toBaseOptions({ title: 'x' }, 5000).timeout).toBe(5000);
  expect(toBaseOptions({ title: 'x', tone: 'danger' }, 5000).timeout).toBe(0);
  expect(toBaseOptions({ title: 'x', action: { label: 'Retry', onClick() {} } }, 5000).timeout).toBe(0);
  expect(toBaseOptions({ title: 'x', tone: 'danger', duration: 5000 }, 9000).timeout).toBe(5000);
  expect(toBaseOptions({ title: 'x', duration: 0 }, 5000).timeout).toBe(0);
});
```

```tsx
// Toast.test.tsx
it('add renders title, description, and data-tone; returns an id');
it('update changes an open toast; close(id) closes one; close() closes all');
it('action runs onClick, then closes its toast');
it('the dismiss button is named by closeLabel and is not aria-hidden');
it('the viewport is named by viewportLabel');
it('useToast outside a provider throws "useToast must be used inside a ToastProvider"');
it('a manager from createToastManager shows toasts when passed as manager');
```

Type test: `tone="error"` is a type error; `ToastManager` has no Base UI types in its signature.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Toast`. Expected: fail, modules missing.
- [ ] **Step 3: Implement.** `ToastProvider` wraps `Toast.Provider` (`limit`, `toastManager`) and renders `Portal` → `Viewport` (`aria-label={viewportLabel}`, fixed at `position`, `zIndex.toast`, list with `space.2` gap, not collapsed) → `ToastList`. The provider puts `duration` in a context; `useToast` wraps `useToastManager` and passes every option through `toBaseOptions`. `createToastManager` wraps Base UI's and applies the provider's `duration` at render time (store the raw `duration` in `data`, resolve in `ToastList`), so it works before a provider mounts. Each toast: `popupSurface`, tone icon in `fg.{tone}` (none for `neutral`), title, description, action `Button size="sm" variant="soft"` that calls `onClick` then closes, dismiss `IconButton` with `aria-hidden={false}`. Swipe direction toward the nearest edge from `position`. Max width is the builder's choice (e.g. `24rem`).
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Commit** `Add Toast`.

### Task 10: `toast.promise` and Toast in the browser

**Files:**
- Modify: `src/components/Toast/{useToast.ts,createToastManager.ts,Toast.test.tsx,Toast.browser.test.tsx,Toast.stories.tsx}`, `src/components/Overlays.browser.test.tsx`

**Interfaces:** Fills in `ToastManager.promise` from Task 9.

- [ ] **Step 1: Write the failing tests**

```tsx
it('promise: loading is neutral with a spinner and never times out; success and error follow');
it('promise accepts strings (as title), options, and functions of the result or error');
it("a state's own tone overrides the default");
it('promise returns the original promise: a rejection still rejects', async () => {
  await expect(toast.promise(Promise.reject(new Error('x')), states)).rejects.toThrow('x');
});
it('a dismissed loading toast does not reappear when the promise settles'); // Review Focus 3
```

Browser (`Toast.browser.test.tsx`): polite region for `neutral`, the `role="alert"` element for `danger` and a failed `promise`; the timer pauses on hover; `action` and `danger` toasts stay, and time out with `duration`; `duration: 0` persists; `limit` applies; `F6` moves focus to the toasts. `Overlays.browser.test.tsx`: with a `Dialog` open, a toast's action button works without closing the dialog, and a `danger` toast's text appears in the `role="alert"` element. Reduced motion: transitions are 0s and toasts still close.

- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Toast && npx vitest run --project browser src/components/Toast src/components/Overlays.browser.test.tsx`. Expected: the `promise` tests fail (not implemented).
- [ ] **Step 3: Implement** `promise` with `add` (loading, `duration: 0`) and `update` on settle, skipping the update when the toast is no longer open; resolve string states to `{ title }`.
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Stories** (each tone, action, promise, position) and **commit** `Add toast.promise`.

### Task 11: `Table` parts

**Files:**
- Create: `src/components/Table/{Table.tsx,TableCaption.tsx,TableSections.tsx,TableRow.tsx,TableHeader.tsx,TableSortHeader.tsx,TableCell.tsx,Table.css.ts,Table.test.tsx,Table.test-d.tsx,Table.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `src/themes/contrast.ts` and its test, `scripts/verify-dist.mjs` (`serverModules`)

**Interfaces:**
- Consumes: `Box`/`splitLayoutProps`, `VisuallyHidden`, `ArrowUp`/`ArrowDown`/`ArrowUpDown` icons, `focusRing`, `PolymorphicProps`.
- Produces: `Table`, `TableProps` (`size?: TableSize`, `stickyHeader?`, `stickyFirstColumn?`, `stickyBackground?: 'canvas' | 'surface' | 'raised' | 'sunken'`, `hoverable?`, `scrollable?`, layout props → wrapper; `aria-label`, `aria-labelledby`, `className`, `style`, `ref`, other `table` attributes → `table`); `TableSize` (`'sm' | 'md'`); `TableCaption` (`visuallyHidden?`); `TableHead`, `TableBody`, `TableFoot`; `TableRow` (`hoverable?` = `true`, `selected?` = `false`); `TableHeader` (`scope?` = `'col'`, `align?: TableAlign`); `TableAlign` (`'start' | 'center' | 'end'`); `TableSortHeader<E extends ElementType = 'a'>` (`direction: 'ascending' | 'descending' | 'none'`, `align?`, and `{ onSort(): void } | { href: string; as?: E }`); `TableCell` (`align?`). Internal classes `cell`, `rowSelected`, `stickyCell` for Task 15/16. Server-safe: no hooks, no context.

- [ ] **Step 1: Write the failing tests:** each part renders its element; `scope`/`align` apply; `TableSortHeader` `direction` sets `aria-sort` and `data-direction`, `none` omits `aria-sort`, `onSort` fires with no arguments, `href` renders a link and `as` a router link; `scrollable` puts `role="region"`, `tabIndex=0`, and the name on the wrapper and warns without a name; without it the wrapper has none of these and the name is on the `table`; the wrapper has `data-ds-table`; `TableRow selected` sets `data-selected`. Contrast test: `fg.default` and `fg.muted` on `bg.accentSubtle` pass 4.5:1 in both modes. Type test: `TableSortHeader` without `direction`, or with both `onSort` and `href`, is a type error.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Table src/themes`. Expected: fail, modules and pairs missing.
- [ ] **Step 3: Implement** per Spec 13's "Appearance". `border-collapse: separate`, `borderSpacing: 0`, `width: 100%`, `margin: 0`; wrapper `overflowX: auto`, `isolation: isolate`. Row headers styled from `tbody th`. Hover in `@media (hover: hover)` → `bg.muted`. Selected: `bg.accentSubtle`, a `borderWidth.thick` `bg.accent` `::before` on the row's first cell at `inset-inline-start`, `Highlight` in forced colors. The sort button fills the `th`; `none` shows a faint `ArrowUpDown`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Commit** `Add Table parts`.

### Task 12: `Table` sticky parts and layout in the browser

**Files:**
- Create: `src/components/Table/Table.browser.test.tsx`
- Modify: `src/components/Table/{Table.css.ts,Table.stories.tsx}`

**Interfaces:** Consumes Task 11's classes; produces nothing new.

- [ ] **Step 1: Write the failing browser tests**

```tsx
it('a wide table scrolls in its wrapper at 320px without widening the page or breaking short words');
it('scrollable scrolls by keyboard');
it('stickyHeader stays visible with its bottom border; rows do not show through');
it('stickyFirstColumn stays in view in LTR and RTL, with stickyHeader, and a colSpan cell does not stick');
it('hovered and selected rows keep their background and bar in the sticky column');
it('stickyBackground applies each value to sticky cells only');
it('a focused element scrolled into view is not under a sticky part');
it('focus rings and the selected bar are not clipped by the wrapper');
it('a Menu opened from a cell sits above the sticky header and column'); // Review Focus 5
it('inside Prose: keeps its own styles, the wrapper has Prose margins, and still scrolls');
```

- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Table`. Expected: the sticky tests fail.
- [ ] **Step 3: Implement** sticky rules: header cells `position: sticky; insetBlockStart: 0`; first cells `insetInlineStart: 0` with a `border.subtle` end border, excluding `[colspan]`; corner cell above both; backgrounds from `stickyBackground`, replaced by opaque hover/selected colors; the wrapper's `scroll-padding` reserves the sticky header height and first-column width (CSS custom properties set from the header's `blockSize` token-derived values, builder's choice); the wrapper's `zIndex` stays at `base` so overlays win. `maxHeight` on the wrapper confirms `"screen"` is a valid `maxHeight` value (typecheck fails otherwise; if it isn't, stop and raise it).
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Stories** (sizes, sticky combinations, sortable headers) and **commit** `Add Table sticky header and column`.

### Task 13: `Pagination`

**Files:**
- Create: `src/components/Pagination/{Pagination.tsx,pageRange.ts,pageRange.test.ts,Pagination.css.ts,Pagination.test.tsx,Pagination.test-d.tsx,Pagination.browser.test.tsx,Pagination.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (`serverModules`)

**Interfaces:**
- Produces: `pageRange(page: number, totalPages: number, siblingCount: 0 | 1 | 2): Array<number | 'ellipsis'>`; `Pagination`, `PaginationProps<E extends ElementType = 'a'>` (`page`, `totalPages`, `{ getHref(page: number): string; as?: E } | { onPageChange(page: number): void }`, `siblingCount?` = `1`, `size?: 'sm' | 'md'`, `aria-label?` = `'Pagination'`, `labels?: PaginationLabels`, layout props); `PaginationLabels` (`previous`, `next`, `page` = `'Page {page}'`, `status` = `'Page {page} of {total}'`). `DataTable` (Task 15) uses the `onPageChange` form.

- [ ] **Step 1: Write the failing tests.** `pageRange.test.ts`: for `totalPages` 1–20 × `siblingCount` 0–2 × every `page`: all pages when `totalPages ≤ slots`; otherwise length is exactly `slots`, first is `1`, last is `totalPages`, `page` is present, and no `'ellipsis'` stands for a single page. Spot-check `pageRange(1, 10, 1)` → `[1, 2, 3, 4, 5, 'ellipsis', 10]`. `Pagination.test.tsx`: `getHref` renders links (and `as`), `onPageChange` renders buttons and receives the page; current page has `aria-current="page"` and `data-current`; ends render a `disabled` `IconButton` in both modes; `totalPages` 0 and 1 render nothing; an out-of-range `page` warns; ellipses are `aria-hidden`; labels interpolate `{page}` and `{total}`. Type test: neither or both of `getHref`/`onPageChange` is a type error.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Pagination`. Expected: fail, modules missing.
- [ ] **Step 3: Implement.** `ghost` `Button`/`IconButton` per page, current `soft` + `semibold`; chevrons are internal icons that flip in RTL; both layouts in one `nav`, switched with `display: none` at `sm`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser test:** below and above `sm`, exactly one layout is in the accessibility tree (`cdp()` `Accessibility.getFullAXTree`). Run `npx vitest run --project browser src/components/Pagination`.
- [ ] **Step 6: Stories** and **commit** `Add Pagination`.

### Task 14: `Skeleton` and `EmptyState`

**Files:**
- Create: `src/components/Skeleton/{Skeleton.tsx,Skeleton.css.ts,Skeleton.test.tsx,Skeleton.test-d.tsx,Skeleton.browser.test.tsx,Skeleton.stories.tsx,index.ts}`, `src/components/EmptyState/{EmptyState.tsx,EmptyState.css.ts,EmptyState.test.tsx,EmptyState.test-d.tsx,EmptyState.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs` (`serverModules`)

**Interfaces:**
- Produces: `Skeleton`, `SkeletonProps<E extends 'div' | 'span' = 'div'>` (`variant?: 'rect' | 'circle' | 'text'`, `lines?: number`, layout props, `as`); `EmptyState`, `EmptyStateProps` (`title: ReactNode`, `description?`, `icon?: ReactElement`, `action?: ReactNode`, `headingLevel?: 1 | 2 | 3 | 4 | 5 | 6` = `3`, `size?: 'sm' | 'md'`, layout props).

- [ ] **Step 1: Write the failing tests:** `Skeleton` is always `aria-hidden`; `lines={3}` renders three `span` lines; variants apply classes; `as="span"` renders a span. `EmptyState`: `headingLevel` changes the tag, not the size class; description, icon, action render. Browser: `Skeleton` doesn't animate with reduced motion and stays visible; `text` lines are the parent's font size (1em); forced colors keeps a visible border.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Skeleton src/components/EmptyState && npx vitest run --project browser src/components/Skeleton`. Expected: fail, modules missing.
- [ ] **Step 3: Implement** per Spec 13 (`bg.mutedHover`, opacity pulse with duration `calc(motion.duration.slow * N)`, last of several lines 60% wide; `EmptyState` centered `Stack`, `Heading` `lg`/`md` `semibold`, description `fg.muted`, `space.8`/`space.4` padding).
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Stories** (including the `aria-busy` + `VisuallyHidden` pattern, and `EmptyState` in a `TableRow hoverable={false}` with a full `colSpan` cell) and **commit** `Add Skeleton and EmptyState`.

### Task 15: `DataTable` sorting, paging, loading, and empty

**Files:**
- Create: `src/components/DataTable/{DataTable.tsx,sortRows.ts,sortRows.test.ts,DataTable.css.ts,DataTable.test.tsx,DataTable.test-d.tsx,DataTable.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Tasks 11, 13, 14.
- Produces: `DataTable<Row>`, `DataTableProps<Row>` (Spec 13's table, with `aria-label`/`aria-labelledby` as an exclusive union and `totalRows` only with `pageSize`); `DataTableColumn<Row>` (`id`, `header`, `cell(row)`, `rowHeader?`, `align?`, and `{ sortValue(row): string | number | null } | { sortable: true } | {}`); `DataTableSort` (`{ column: string; direction: 'ascending' | 'descending' } | null`); `DataTableLabels`. `sortRows<Row>(rows: Row[], sortValue, direction, collator: Intl.Collator): Row[]` (stable, `null` last both ways).

- [ ] **Step 1: Write the failing tests.** `sortRows.test.ts`: stable for ties; `null` last ascending and descending; `locale="sv-SE"` puts `ä` after `z` while `en-US` doesn't. `DataTable.test.tsx`: a sortable header cycles ascending → descending → none; `sortable` calls `onSortChange` without reordering; `pageSize` slices and renders `Pagination`; changing the sort returns to page 1; an uncontrolled page past the end after `rows` shrinks moves to the last page; `totalRows` doesn't slice, and with `sortValue` warns to use `sortable`; `loading` with no rows renders `pageSize` (or 5) skeleton rows and wins over `empty`; `loading` with rows keeps them and sets `aria-busy`; `empty` renders in one full-width `colSpan` row; controlled and uncontrolled `sort` and `page`; warns without exactly one `rowHeader`; never `role="grid"`. Type test: `sortValue` and `sortable` together, `totalRows` without `pageSize`, and both or neither `aria-label`/`aria-labelledby` are type errors; `cell`'s argument is typed from `rows`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/DataTable`. Expected: fail, modules missing.
- [ ] **Step 3: Implement.** Layout props → outer element; `height`/`maxHeight` → the `Table` wrapper; `className`/`style`/`ref` → the `table`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Commit** `Add DataTable`.

### Task 16: `DataTable` selection

**Files:**
- Create: `src/components/DataTable/{SelectionToolbar.tsx,isInteractiveTarget.ts,isInteractiveTarget.test.ts,DataTable.browser.test.tsx}`
- Modify: `src/components/DataTable/{DataTable.tsx,DataTable.css.ts,DataTable.test.tsx,DataTable.stories.tsx}`

**Interfaces:**
- Consumes: Task 11's `rowSelected`; `CheckIcon`; `VisuallyHidden`; `Button`.
- Produces: `isInteractiveTarget(target: Element, row: Element): boolean` (true inside `a`, `button`, `input`, `select`, `textarea`, `label`, `summary`, or an interactive ARIA role, up to `row`).

- [ ] **Step 1: Write the failing tests.** Unit: with `selectionMode`, the `rowHeader` cell renders a `button` with `aria-pressed` whose name starts with `labels.selectRow` then the cell text; none without it; `disabledKeys` disables the button and keeps its text color class; a link or button in the `rowHeader` cell warns once per column; `single` replaces and clears; `multiple` renders a named `role="group"` toolbar with Select page (`aria-pressed` `false`/`mixed`/`true`, skipping disabled rows), a `role="status"` count that is empty on first render, and Clear; selection persists across pages and `onSelectionChange` gets every key; skeleton rows have no button; Select page with every row on the page disabled stays `false` and doesn't call `onSelectionChange` (Review Focus 4). Browser: `Space`/`Enter` toggle; a row click toggles once, including on the button; no toggle with `selectOnRowClick={false}`, on a disabled row, on a link or control in a cell, or when the click ends a text selection; the button is at least 24px tall at both sizes; `DataTable` and an equivalent `Table` render the same cell rects and colors, with and without selection, at both sizes and each sticky prop.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/DataTable && npx vitest run --project browser src/components/DataTable`. Expected: the selection tests fail.
- [ ] **Step 3: Implement.** The row handler returns early when `isInteractiveTarget` or `getSelection()?.toString()` is non-empty; the button has its own handler. Toolbar above the scroll wrapper, `multiple` only. Dotted underline on the button, solid on hover.
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Stories:** the full `DataTable` page (sorting, selection, pagination, loading, empty) and a TanStack Table recipe using the parts (docs code only; don't add `@tanstack/react-table` as a dependency). Run `npm run test:stories`.
- [ ] **Step 6: Commit** `Add DataTable selection`.

### Task 17: Docs pages, fixtures, audit, and milestone acceptance

**Files:**
- Create: `src/components/Overlays.stories.tsx` (choosing between `Dialog`, `Popover`, `Tooltip`, `Menu`; the "close the popover before opening a dialog" note), `src/components/Data.stories.tsx`, `fixtures/next-app/app/(site)/overlays/page.tsx`, `fixtures/next-app/app/(site)/data/page.tsx`, `fixtures/next-app/app/(site)/CustomersTable.tsx` (`'use client'` `DataTable`), `tests/fixtures/{overlays,data}.spec.ts`
- Modify: `src/components/overviewPages.test.ts`, `fixtures/next-app/app/(site)/layout.tsx` (`ToastProvider`), `fixtures/vite-app/src/main.tsx`, `README.md`, `docs/specs/00-overview.md` (status only if the milestone table needs it), `docs/HANDOFF.md`

**Interfaces:** Consumes everything above.

- [ ] **Step 1: Write the failing fixture tests.** Next `/overlays`: a server component renders each overlay with a server-rendered `Button` trigger child; each opens on click; no hydration warnings (reuse `color-mode.spec.ts`'s console check). Next `/data`: raw HTML contains a server-rendered `Table` and a `Pagination` with `next/link` hrefs; clicking page 2 navigates client-side; the `DataTable` with selection and `defaultSort` hydrates without warnings. Vite: one overlay and one table render with styles. Run `npm run test:fixtures`. Expected: fail, pages missing.
- [ ] **Step 2: Add the pages** until they pass.
- [ ] **Step 3: Overview pages:** add both stories to `overviewPages.test.ts`'s no-`style`/`className` list (Spec 13's acceptance: a full table without `style` or `className`). README component list gains all ten.
- [ ] **Step 4: Audit (thread 2).** Run `npm audit` and `npm view typescript-eslint version`. If a fixed `typescript-eslint` exists, upgrade it in this step and rerun `npm run lint`. Record the advisory count and versions for the handoff either way.
- [ ] **Step 5: Acceptance.** Walk Specs 12 and 13's acceptance criteria and test lists, recording each as passed (test name) or needing the owner. Run `npm ci && npm run check`. Expected: exit 0, every project ran, no warnings.
- [ ] **Step 6: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the merge box. Don't close and reopen the PR. Expected: all CI jobs pass.
- [ ] **Step 7: Manual checks to hand to the owner, not mark done,** in the PR body: screen reader passes on each overlay, tables, sorting, and selection; forced colors on all ten (Specs 12, 13, and 05's checklist).
- [ ] **Step 8: Update `docs/HANDOFF.md` through the `handoff` skill** as a reconciliation: threads 1–3 resolved with commits; thread 2 resolved or carried with the Step 4 versions; threads 4–7 carried with their triggers; next steps become the owner's manual checks, merge, and `npm run release -- minor`. Commit `Add overlay and data overview pages and fixtures`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks, merging, and releasing v0.4.0.
