# Spec 12: Overlays

- **Status:** Accepted
- **Date:** 2026-11-06
- **Milestone:** v0.4
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 03](03-theme-provider.md), [Spec 05](05-component-conventions.md), [Spec 07](07-icon.md), [Spec 09](09-forms.md), [ADR 0002](../adr/0002-headless-primitives-with-base-ui.md)

## Purpose

Define `Dialog`, `Popover`, `Tooltip`, `Menu`, and `Toast`, all built on Base UI. Most interactive apps need them, and v0.4 adds them.

## Decided during planning

- Base UI supplies behavior, and consumers never import it (ADR 0002).
- Parts are flat named exports, with a plain root such as `<Dialog>`, and portals are included automatically (Spec 05).
- Overlays don't accept `as` (Spec 05).
- Client components take icons as elements (Spec 07).
- Tokens exist for all of these: `bg.raised`, `shadow.raised`, `shadow.dialog`, `color.overlay`, and the `zIndex` layers (Spec 02).
- Spec 02 left open whether tooltips use inverse colors. This spec decides it.

## Shared behavior

### Triggers

Triggers take one element, and pass behavior to it:

```tsx
<DialogTrigger><Button>Delete project</Button></DialogTrigger>
<MenuTrigger><IconButton aria-label="Row actions" icon={<Icon icon={MoreHorizontal} />} /></MenuTrigger>
```

- **The trigger doesn't render a button of its own,** so there's no unstyled button and no nested buttons. Internally the child is passed to Base UI's `render`, which merges props and `ref`.
- **The child must render a `button`, and forward props and `ref`.** `Button` and `IconButton` do. `Button as="a"` doesn't work here, since opening an overlay isn't navigation.
- **`children` is typed as one element.** It can be built in a server component. The wrapper passes `children` straight to `render`, and doesn't call `Children.only` or `isValidElement`, since a server-built child can arrive as a lazy wrapper that fails those checks. Base UI unwraps it.
- **Trigger parts spread unknown props and forward `ref` to Base UI's trigger,** so a tooltip can wrap them. `Tooltip` goes outside: `<Tooltip content="Actions"><MenuTrigger><IconButton … /></MenuTrigger></Tooltip>`. The reverse order fails, since `MenuTrigger`'s child must render a `button`.

### Positioning

`PopoverContent`, `MenuContent`, and `Tooltip` share these props:

| Prop | Values | Default |
|---|---|---|
| `side` | `top`, `bottom`, `start`, `end` | `bottom` (`Tooltip`: `top`) |
| `align` | `start`, `center`, `end` | `center` (`MenuContent`: `start`) |

Popups flip and shift to stay on screen, which is Base UI's behavior. `start` and `end` follow text direction. The gap from the trigger is a fixed `space.1.5`.

### Appearance and motion

- **Portaled content inherits the theme,** since variables are on the root (Spec 03). It's also outside any `Prose`.
- **Enter and exit use `opacity` and a small `transform`,** on `motion.*` tokens, using Base UI's transition attributes internally.
- **Every popup has a `1px` `border.surface` border,** so it stays visible in forced colors (Spec 05).
- **`onOpenChange` receives only the boolean,** as Spec 05 does for other change handlers. To block closing, control `open`.

### Stacking

`zIndex` tokens mean `Dialog` (`modal`) sits below `Popover` and `Menu` (`popover`), then `Toast`, then `Tooltip`. So a `Menu` or `Select` inside a `Dialog` works. **A `Dialog` opened from an open `Popover` would sit underneath it,** so the docs say to close the popover first. A `Menu` closes when a `MenuItem` or `MenuLinkItem` is clicked, so it doesn't have this problem.

## `Dialog`

```tsx
<Dialog>
  <DialogTrigger><Button>Edit profile</Button></DialogTrigger>
  <DialogContent>
    <DialogTitle>Edit profile</DialogTitle>
    <DialogDescription>Your team will see these changes.</DialogDescription>
    <Field label="Name"><Input /></Field>
    <Inline justify="end">
      <DialogClose><Button variant="soft">Cancel</Button></DialogClose>
      <Button>Save</Button>
    </Inline>
  </DialogContent>
</Dialog>
```

| Part | Props |
|---|---|
| `Dialog` | `open`, `defaultOpen`, `onOpenChange`; `alert` (boolean, default `false`); `closeOnOutsideClick` (default `true`; ignored with `alert`, with a development warning) |
| `DialogTrigger` | One element |
| `DialogContent` | `size` (`sm`, `md`, `lg`; default `md`); `showClose` (default `true`, and `false` with `alert`); `closeLabel` (default `"Close"`); `initialFocus` and `finalFocus` (refs) |
| `DialogTitle` | Always renders `h2`, with no `level` prop, since a dialog starts its own heading structure |
| `DialogDescription` | Renders `p` |
| `DialogClose` | One element |

- **It renders the backdrop, popup, and portal together,** with `color.overlay` at `zIndex.overlay`, and `bg.raised`, `shadow.dialog`, `radius.card`, and `space.6` padding at `zIndex.modal`.
- **Modal only**. Focus is trapped, the page behind is inert, and scrolling is locked. Non-modal cases use `Popover`.
- **Scroll lock** uses `scrollbar-gutter`, which is Base UI's behavior, so the page doesn't shift where that's supported.
- **Focus** moves to the first focusable element or `initialFocus`, or to the popup itself on touch, which avoids opening the on-screen keyboard. It returns to the trigger on close, or to `finalFocus`.
- **The close button is last in the DOM,** and positioned at the top corner with CSS, so it doesn't take initial focus from a form's first field.
- **Without a close button,** as with `alert` or `showClose={false}`, the content needs a `DialogClose`, so touch screen reader users have a way out. A development warning fires otherwise.
- **`Escape` closes it.** So does clicking outside, unless `closeOnOutsideClick` is `false`, which suits long forms.
- **Opening from a `MenuItem`:** a `MenuItem` can't be a `DialogTrigger`, since its child isn't a `button`. Use a controlled `open`, with `finalFocus` pointing at the `MenuTrigger`'s child, because the item is gone once the menu closes. This confirm-delete flow is a docs recipe and a story test.
- **Name:** `DialogTitle` names it, and `DialogDescription` describes it. Without a title, `DialogContent` needs `aria-label`. Otherwise a development warning fires.
- **Layout:** children stack with `space.4` between them. The popup is centered, and fills the screen width less `space.4` on each side on small screens. Tall content scrolls inside the popup, which stays within the viewport using `dvh`.
- **Widths** come from new required tokens, `size.dialog.{sm,md,lg}`: 24, 32, and 44rem. This adds to Spec 02. **Alternative:** fixed values in the component, which themes couldn't change.

### `alert`

For confirming something destructive. It's built on Base UI's `AlertDialog`.

- `role="alertdialog"`, no close button, and clicking outside doesn't close it. `Escape` still does, which is Base UI's behavior.
- **`alert` is static.** Changing it while mounted remounts the dialog, because the root component changes.
- **`DialogDescription` is expected,** and its absence logs a development warning.
- **Alternative:** a separate `AlertDialog` component family, which adds six exports for the same parts.

## `Popover`

```tsx
<Popover>
  <PopoverTrigger><Button variant="soft">Filters</Button></PopoverTrigger>
  <PopoverContent aria-label="Filters">…</PopoverContent>
</Popover>
```

| Part | Props |
|---|---|
| `Popover` | `open`, `defaultOpen`, `onOpenChange` |
| `PopoverTrigger`, `PopoverClose` | One element |
| `PopoverContent` | `side`, `align`, `arrow`, `initialFocus`, layout props such as `width` and `maxWidth` |
| `PopoverTitle`, `PopoverDescription` | Render `h2` and `p` |

- **Appearance:** `bg.raised`, `shadow.raised`, `radius.lg`, `space.4` padding, `zIndex.popover`. Its width never exceeds the viewport.
- **Non-modal.** The page stays usable, and focus moves into the popup and back to the trigger on close.
- **`Escape` and clicking outside close it.**
- **Name:** `PopoverTitle` or `aria-label`, with a development warning otherwise.
- **`arrow` (boolean, default `false`) adds an arrow pointing at the trigger.** It's off by default because Soft's shadows already separate the popup. It uses Base UI's arrow, follows `side`, and matches the popup's background, border, and shadow, so the two read as one shape. Forced colors draw its border.
- **No open-on-hover.** That's what `Tooltip` is for.

## `Tooltip`

A short text hint on hover or keyboard focus. One component, not parts:

```tsx
<Tooltip content="Delete project">
  <IconButton aria-label="Delete project" icon={<Icon icon={Trash} />} />
</Tooltip>
```

| Prop | Values | Default |
|---|---|---|
| `content` | ReactNode; **required** | |
| `side`, `align` | As above | `top`, `center` |
| `delay` | ms | `TooltipProvider`'s `delay`, otherwise `600` |
| `open`, `defaultOpen`, `onOpenChange` | | |
| `disabled` | boolean: turns the tooltip off | `false` |

`TooltipProvider` is optional. Inside one, a second tooltip opens without delay soon after the first closes, so moving along a toolbar feels quick. Its only prop is `delay`, the default for all tooltips inside.

- **Inverse colors:** `bg.inverse`, `fg.inverse`, `font.size.xs`, `medium` weight, `radius.sm`, `zIndex.tooltip`. They contrast with both the page and `bg.raised` popups. The pair is already in Spec 02's contrast test. **Alternative:** `bg.raised`, which would blend into menus and dialogs.
- **Visual only.** Base UI's trigger adds no ARIA, so `content` isn't announced. The trigger needs its own name, which Spec 05 already requires of `IconButton`. So a tooltip mustn't hold anything a screen reader user needs.
- **It doesn't appear on touch screens,** so it can't be the only place for needed information. With `delay={0}`, a tap can flash it open for one frame (Base UI behavior); with any other delay, a tap never opens it.
- **A natively `disabled` button doesn't fire hover or focus,** so its tooltip won't open. The docs cover this.
- **Hover can move onto the tooltip without closing it,** and `Escape` dismisses it (WCAG 1.4.13). Clicking the trigger also closes it.
- **`delay` applies to hover only.** Keyboard focus opens it immediately.
- **The child can be any focusable element,** such as a `Link`, unlike other triggers.

## `Menu`

A list of actions.

```tsx
<Menu>
  <MenuTrigger><Button variant="soft">Actions</Button></MenuTrigger>
  <MenuContent>
    <MenuItem startIcon={<Icon icon={Pencil} />} onClick={edit}>Edit</MenuItem>
    <MenuLinkItem as={NextLink} href="/projects/1">View project</MenuLinkItem>
    <MenuSeparator />
    <MenuItem tone="danger" onClick={remove}>Delete</MenuItem>
  </MenuContent>
</Menu>
```

| Part | Props |
|---|---|
| `Menu` | `open`, `defaultOpen`, `onOpenChange` |
| `MenuTrigger` | One element |
| `MenuContent` | `side`, `align` |
| `MenuItem` | `onClick`, `disabled`, `startIcon`, `tone` (`neutral`, `danger`; default `neutral`), `closeOnClick` (default `true`) |
| `MenuLinkItem` | `href`, `as`, `disabled`, `startIcon`, `closeOnClick` (default `true`, unlike Base UI, so the menu doesn't stay open after client-side navigation) |
| `MenuCheckboxItem` | `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `closeOnClick` (default `false`) |
| `MenuRadioGroup` | `value`, `defaultValue`, `onValueChange` |
| `MenuRadioItem` | `value`, `disabled`, `closeOnClick` (default `false`) |
| `MenuGroup`, `MenuGroupLabel` | For a labeled section. The label names the group for screen readers, and isn't a heading |
| `MenuSeparator` | |
| `MenuSubmenu` | `open`, `defaultOpen`, `onOpenChange`, `disabled` |
| `MenuSubmenuTrigger` | `startIcon`, `disabled` |
| `MenuSubmenuContent` | Items, as in `MenuContent` |

- **It isn't for navigation bars or for choosing a form value.** Use `NavBar` and `Select`.
- **Keyboard:** Base UI handles arrow keys, Home, End, type-ahead, and `Escape`. Focus returns to the trigger on close.
- **Non-modal:** Base UI defaults to modal, which locks page scrolling while a small menu is open. This library sets `modal={false}`. Clicking outside still closes it.
- **Appearance:** `bg.raised`, `shadow.raised`, `radius.lg`, `space.1` padding, `zIndex.popover`. Items use `font.size.md`, are `size.control.md` tall at most, and at least 32px. Highlighted items use `bg.muted`, as `Select` does.
- **`tone="danger"`** uses `fg.danger`, and `bg.dangerSubtle` when highlighted, so the whole row reads as destructive. That pair is already in Spec 02's contrast test.
- **Selected checkbox and radio items show a check icon,** so color isn't the only signal. Icons are internal (Spec 07).
- **Tall menus scroll,** and stay within the viewport.
- **Submenus:** `MenuSubmenuTrigger` looks like a `MenuItem` with an internal chevron that flips with text direction, and `MenuSubmenuContent` opens beside it, flipping to stay on screen. Hover or tap opens it. The arrow key pointing toward the submenu opens it and the opposite one closes it, and `Escape` closes only the submenu. Nest them sparingly, since they're hard to use on touch screens.
- **`MenuLinkItem` accepts `as`,** which adds it to Spec 05's list.

## `Toast`

A brief message that appears and goes away by itself.

```tsx
// Once, near the root
<ToastProvider><App /></ToastProvider>

// Anywhere below it
const toast = useToast();
toast.add({ title: 'Changes saved', tone: 'success' });
toast.add({
  title: 'Could not save',
  description: 'Check your connection.',
  tone: 'danger',
  action: { label: 'Retry', onClick: retry },
});
```

**`ToastProvider`** props: `position` (`bottom-end`, `bottom-start`, `bottom`, `top-end`, `top-start`, `top`; default `bottom-end`), `limit` (default `3`), `duration` (default `5000`), `closeLabel` (default `"Dismiss"`), `viewportLabel` (default `"Notifications"`, the name of the toast region), `manager`.

**`useToast()`** returns:

- `add(options)`, which returns an id.
- `update(id, options)`, which changes an open toast.
- `close(id?)`, which closes one toast, or all of them without an id.
- `promise(promise, { loading, success, error })`, which ties one toast to a promise.

```tsx
toast.promise(saveChanges(), {
  loading: 'Saving…',
  success: 'Changes saved',
  error: (err) => ({ title: 'Could not save', description: err.message }),
});
```

- **Each state** is a string (the title), toast options, or a function receiving the result or error that returns either.
- **Tones default to `neutral` with a spinner, then `success` or `danger`.** A state's own `tone` overrides these.
- **It returns the original promise,** so a rejection still rejects, and the caller handles it.
- **It's built on `add` and `update`, not Base UI's helper.** Base UI's forces its own types, so `tone` couldn't be overridden, and treats a string as the description rather than the title.
- **The loading toast never times out.** The result follows the duration rules below, so an error stays until dismissed, and it's announced urgently.

**Options:** `title`, `description`, `tone` (`neutral`, `success`, `warning`, `danger`, `info`; default `neutral`), `action` (`{ label, onClick }`), `duration` (ms; `0` means it stays), `id`.

- **Outside React:** `createToastManager()` returns the same methods, and is passed as `manager`, so API helpers can show toasts. It's created once, outside render. Calls made before its `ToastProvider` first connects are queued and run in order when it does, so a toast added from a mount effect still shows; if no provider ever mounts, they stay queued. Once a provider has connected, calls made while it's unmounted are dropped, with a development warning on `add`, so a stale toast can't appear when a provider mounts again. An unmount and remount within the same task, such as StrictMode's, doesn't count.
- **Appearance:** `bg.raised`, `shadow.raised`, `radius.lg`, `zIndex.toast`. A list with a `space.2` gap, not a collapsed stack. `tone` adds a colored icon (`fg.{tone}`), and the title carries the meaning, so color isn't the only signal.
- **Duration:** a toast's own `duration` always wins, so any toast can time out or stay. Without one, **a toast with an `action`, or with `tone="danger"`, stays until dismissed,** since someone may need longer to read or act. Everything else uses the provider's `duration`. So `toast.add({ title: 'Could not save', tone: 'danger', duration: 5000 })` times out, and `duration: 0` keeps any toast open. Base UI pauses the timer on hover and focus. The docs say an `action` that times out must also be available somewhere else.
- **`action` closes the toast after its `onClick` runs.** Base UI's action doesn't, so a Retry toast would otherwise never go away.
- **Announcements:** toasts are announced politely. `tone="danger"` is announced urgently, using Base UI's `priority: 'high'`, which announces through a separate hidden `role="alert"` element.
- **Keyboard:** `F6` moves focus to the toasts, which is Base UI's behavior. Each has a dismiss button, with `closeLabel` as its name. The wrapper sets `aria-hidden={false}` on it, because Base UI hides it from screen readers unless the stack is expanded, and this library's list is never collapsed.
- **Base UI mapping:** `tone` becomes `type`, and the wrapper adds `data-tone`. `action` becomes `actionProps`, with `label` as its `children`. `duration` becomes `timeout`. `manager` becomes `toastManager`.
- **Swipe to dismiss** on touch screens, toward the nearest edge.
- **Toasts stay usable while a `Dialog` is open.** Checked on Base UI 1.9.0: the modal dialog doesn't hide `aria-live` regions from screen readers, a toast's action can be clicked without closing the dialog, and `F6` then `Tab` reaches the toast. This assumes the provider, and so the toast region, is mounted before the dialog opens, which is why it goes near the root.
- **Don't put the only copy of important information in a toast.**

## Server and client

All overlay parts are client components, and can be used from a server component with server-rendered children. `useToast` needs a client component. `ToastProvider` can wrap a server-rendered app. `createToastManager` can be called from any client module, outside render.

## Public state attributes

- `data-open` on `DialogContent`, `PopoverContent`, `MenuContent`, and the `Tooltip` popup.
- `data-popup-open` on the children of `DialogTrigger`, `PopoverTrigger`, and `MenuTrigger`.
- `data-highlighted` and `data-disabled` on menu items, plus `data-checked` and `data-unchecked` on checkbox and radio items.
- `data-tone` on toasts, set by the wrapper. Base UI's `data-type` stays internal.

## Differences from Spec 05

- **Triggers take one element,** rather than rendering their own.
- **`MenuLinkItem` accepts `as`,** unlike other overlay parts.
- **`Tooltip` has no parts,** and `Toast` is an API more than a component.
- **`onClick` is kept on `MenuItem`,** matching Base UI and native buttons, rather than adding `onSelect`.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- Each root works controlled and uncontrolled, and `onOpenChange` receives only the boolean.
- Trigger children receive props and `ref`, and keep their own `onClick`.
- Development warnings fire for a missing name, `alert` without `DialogDescription`, no way to close, and `closeOnOutsideClick` with `alert`.
- `action` closes its toast, and a toast's own `duration` beats the default rules.
- `promise` accepts strings, options, and functions, applies a state's own `tone`, and returns a promise that rejects when the original does.
- `useToast` outside a provider throws a clear error.

**Browser (story tests):**

- `Dialog`: focus trap, focus return, `Escape`, outside click, `closeOnOutsideClick`, scroll lock without layout shift, and tall content scrolling. `alert` has its role and can't be dismissed from outside.
- `Select`, `Menu`, and `Tooltip` work inside a `Dialog`.
- Opening a `Dialog` from a `MenuItem` returns focus to the menu's trigger through `finalFocus`.
- `Tooltip` wrapping `MenuTrigger`: hover shows the tooltip, and a click opens the menu.
- `Popover`: focus moves in and back, and the page stays usable. `arrow` points at the trigger on every `side`, including after flipping.
- `Tooltip`: opens on hover and focus, dismisses on `Escape`, stays open when hovered, and doesn't open on touch. `TooltipProvider` skips the delay on the next one.
- `Menu`: submenus by hover, tap, and arrow keys in both text directions, `Escape` closing only the submenu, keyboard use, type-ahead, `closeOnClick`, checkbox and radio state, and `MenuLinkItem` with `as`. The page can still scroll while it's open.
- `Toast`: announced in the right region, urgent for `danger`. Timer pauses on hover. `action` and `danger` toasts stay by default and time out when given a `duration`, `duration: 0` persists, `limit` applies, `promise` moves through its states and is announced urgently on failure, and `F6` works. A toast's buttons work while a `Dialog` is open, and a `danger` toast raised during a `Dialog` is announced.
- Popups flip near the viewport's edge, in both text directions.
- Motion is off with reduced motion, and popups still close.

**`fixtures/next-app`:** a server component renders each overlay with a server-rendered `Button` as the trigger child, with no hydration warnings.

**Manual:** a screen reader pass, and forced colors, per Spec 05.

## Storybook

- A page per component, in both modes.
- Docs on choosing between `Dialog`, `Popover`, `Tooltip`, and `Menu`.
- The overview page above is `Patterns/Overlays`, and the component pages follow Spec 18's docs page format (amended by Spec 18, 2026-11-13). The choosing guidance moves into each component page's Usage.

## Acceptance criteria

- All five match this spec, and meet Spec 05's definition of done.
- All states meet Spec 02's contrast rules in both modes.
- A consumer never imports Base UI, and public types don't mention it.

## Left to the builder

- The exact transform distances and enter and exit timings.
- The maximum widths of tooltips and toasts.
- Internal file organization.
