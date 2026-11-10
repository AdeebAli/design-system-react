# Spec 03: Theme provider

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.1
- **Depends on:** [Spec 00](00-overview.md), [Spec 02](02-tokens-and-themes.md)

## Purpose

Define how themes reach the page: selecting light or dark, remembering a
user's choice, avoiding a flash of the wrong mode, and overriding tokens from
a project. [Spec 02](02-tokens-and-themes.md) defines what themes contain.

## Decided during planning

- Color mode follows the OS by default. A project can lock it to light or
  dark, or offer a toggle that remembers the user's choice.
- Switching changes CSS variables, so components don't re-render for it.
- Three customization levels: token overrides, a full theme, and per-instance
  `className` / `style`.
- Theme variables live on the root element in the `ds.theme` layer, so a
  project's unlayered `:root { --ds-… }` always wins (Spec 02).

## Design summary

The stylesheet alone does the default job. Importing
`styles.css` gives Soft following the OS, with no JavaScript, no flash, and
no provider. JavaScript is needed only for the three things CSS can't do:
remembering a choice, exposing the mode to React, and applying typed
overrides.

| Goal | Needs |
|---|---|
| Soft, following the OS | `styles.css` |
| Lock to light or dark | `styles.css` + `data-ds-mode` on `<html>` |
| Override tokens with plain CSS | `styles.css` + your CSS |
| Override tokens with typed objects | `ThemeProvider` |
| A toggle that remembers the choice | `ThemeProvider` + `ColorModeScript` |

The zero-configuration goal in Spec 00 ("wrap in the provider") is met either
way: the README shows the provider, because most projects will want the
toggle, but nothing breaks without it.

## Mode selection in CSS

`styles.css` emits the following in the `ds.theme` layer. The root attribute
**`data-ds-mode`** is the only switch.

```css
@layer ds.theme {
  :root { /* Soft Light variables */ color-scheme: light; }

  @media (prefers-color-scheme: dark) {
    :root:not([data-ds-mode]) { /* Soft Dark variables */ color-scheme: dark; }
  }

  :root[data-ds-mode='dark'] { /* Soft Dark variables */ color-scheme: dark; }
}
```

| `data-ds-mode` | Result |
|---|---|
| absent | Follows the OS, and updates live when the OS setting changes |
| `light` | Soft Light |
| `dark` | Soft Dark |

- Because variables live on the root, **portaled content (dialogs, menus,
  toasts) inherits the theme automatically**.
- Soft Dark's variables appear twice in the stylesheet. That's the cost of
  working without JavaScript, and it compresses well.

**Rejected:** CSS `light-dark()`. It would remove the duplication, but it only
accepts colors, and Soft's shadows also change by mode.

## Public API

### `ThemeProvider`

A client component (`"use client"`). Place one at the app root.

```tsx
<ThemeProvider
  defaultMode="system"       // used when nothing is stored
  forcedMode={undefined}     // 'light' | 'dark' locks the mode
  theme={myTheme}            // from defineTheme / defineFullTheme
  storageKey="ds-color-mode"
  nonce={cspNonce}           // applied to the theme <style>
>
  {children}
</ThemeProvider>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `defaultMode` | `'system' \| 'light' \| 'dark'` | `'system'` | Used only when no choice is stored |
| `forcedMode` | `'light' \| 'dark'` | none | Overrides everything; the stored choice is left untouched. The provider can only apply it after hydration, so a lock that must not flash also needs `ColorModeScript forcedMode` or a static `data-ds-mode` on `<html>` |
| `theme` | `Theme` | none | Token overrides or a full theme |
| `storageKey` | `string` | `'ds-color-mode'` | `localStorage` key. Must match `ColorModeScript` |
| `nonce` | `string` | none | For strict Content Security Policies |
| `children` | `ReactNode` | | |

Behavior:

- Sets or removes `data-ds-mode` on `<html>`, and restores the previous value
  on unmount as cleanup.
- Renders no wrapper element, so it never affects layout.
- **Only one provider per app.** Variables live on the root, so nesting can't
  scope a theme. A nested provider logs a development warning and does nothing.
  To lock the mode on certain routes, compute `forcedMode` at the root provider
  from the current route.
- Listens for `storage` events, so a choice made in one tab updates the others.
- Suppresses CSS transitions for one frame while switching, so components
  don't animate at different speeds during the change.

### `useColorMode()`

```ts
const { mode, resolvedMode, setMode, isForced } = useColorMode();
```

| Field | Type | Notes |
|---|---|---|
| `mode` | `'system' \| 'light' \| 'dark'` | The current setting |
| `resolvedMode` | `'light' \| 'dark' \| undefined` | What's on screen. **`undefined` during server rendering and hydration**, because the server can't know the OS setting or stored choice |
| `setMode` | `(mode) => void` | Stores the choice, including `'system'`, so "System" sticks even when `defaultMode` is `light` or `dark`. No-op with a development warning when forced |
| `isForced` | `boolean` | True when `forcedMode` is set, so a toggle can hide itself |

Implemented with `useSyncExternalStore`, so hydration never mismatches and
only components calling this hook re-render. Throws a clear error outside a
`ThemeProvider`.

A toggle must not render mode-specific content until `resolvedMode` is defined.

A ready-made `ColorModeToggle` is deferred to
[Spec 09](09-forms.md), since it depends on `Button` (v0.2). v0.1 ships the
hook only.

### `ColorModeScript`

Applies a stored choice or lock before first paint. Renders an inline blocking
`<script>`. Works in server components. Place it at the start of `<body>`, or
in `<head>`.

```tsx
// Next.js App Router: app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ColorModeScript />
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

| Prop | Type | Default |
|---|---|---|
| `defaultMode` | `'system' \| 'light' \| 'dark'` | `'system'` |
| `forcedMode` | `'light' \| 'dark'` | none |
| `storageKey` | `string` | `'ds-color-mode'` |
| `nonce` | `string` | none |

- The script is small and has no dependencies. It wraps `localStorage` access
  in `try` / `catch` and ignores invalid stored values. It resolves
  `forcedMode`, then the stored value, then `defaultMode`, and sets
  `data-ds-mode` only when the result is `light` or `dark`.
- **Server rendering only.** React doesn't execute `<script>` elements it creates
  on the client, so client-rendered apps use `getColorModeScript` instead.
- `suppressHydrationWarning` on `<html>` is required, because the script
  changes that element before React hydrates. It only applies one level deep.
- The `storageKey` and mode props must match `ThemeProvider`. A shared config
  object is the documented way to keep them in sync.

### `getColorModeScript(options)`

Returns the same script as a string, for setups without React on the server.
In a Vite app, paste it into `index.html`, or inject it with a small plugin:
the README gives the snippet, and `fixtures/vite-app` follows it.

### `defineTheme` and `defineFullTheme`

Typed theme builders. Call them at module scope and pass the result to
`ThemeProvider`.

```ts
// Token overrides: everything else stays Soft
const myTheme = defineTheme({
  shared: { radius: { control: '8px' }, font: { family: { sans: 'Figtree, sans-serif' } } },
  light: { color: { bg: { accent: '#0f766e' } } },
  dark: { color: { bg: { accent: '#2dd4bf' } } },
});

// Full theme: TypeScript requires every token in both modes
const crisp = defineFullTheme({ light: crispLight, dark: crispDark });
```

| Type | Shape |
|---|---|
| `ThemeTokens` | The complete contract (Spec 02) |
| `ThemeOverrides` | Deep partial of `ThemeTokens` |
| `defineTheme` input | `{ shared?: ThemeOverrides; light?: ThemeOverrides; dark?: ThemeOverrides }` |
| `defineFullTheme` input | `{ light: ThemeTokens; dark: ThemeTokens }` |
| `Theme` (result) | Opaque, serializable, safe to pass from a server component |

- **Precedence:** Soft < `shared` < the current mode's values.
- **Unknown keys are type errors**, and autocomplete lists every token. Covered
  by the type tests required by Spec 01.
- **Value types:** strings, plus numbers for the unitless categories
  (`zIndex`, `font.weight`, `font.lineHeight`). A number elsewhere is a type
  error, so `radius: { control: 8 }` can't produce invalid CSS.
- **Values are validated.** A value containing `{`, `}`, `;`, `<`, `\`, `/*`,
  a line break inside quotes, a control character other than a tab or line
  break, an unclosed quote, or an unclosed or misordered `(` or `[` (outside
  quotes) throws. This prevents CSS injection if a value ever comes from user
  input, and stops one malformed value, such as a `calc(` missing its `)`, from
  swallowing the rules after it. Tabs, and line breaks outside quotes, are
  whitespace, so a multi-line template literal works.
- **Values can't load resources.** A value using `url()` or `image-set()`
  (any case, including `-webkit-image-set()`) throws, so a theme from user
  input can't make the browser fetch a URL.
- **A custom font is the project's to load.** Browsers won't download the
  bundled fonts when nothing uses them (Spec 02).

### `themeToCss(theme)`

Returns the theme as a CSS string, for projects that want a static stylesheet,
for example under a strict Content Security Policy.

### Under a strict Content Security Policy

`ColorModeScript` and `ThemeProvider` take the page's `nonce`. The policy must
also allow style attributes (`style-src-attr 'unsafe-inline'`): Base UI hides
the native inputs of form controls with a `style` attribute in server HTML, and
`style` props render the same way. Style attributes can't run script, so
scripts and style elements stay nonce-only. `fixtures/next-app` serves `/csp`
with such a policy and checks there are no violations or console errors.

## How overrides reach the page

`ThemeProvider` renders a plain `<style>` element (no `href` or `precedence`),
containing **unlayered** rules with the same selectors as the built-in themes:

```css
:root { /* shared overrides */ }

:root[data-ds-mode='light'] { /* light overrides */ }
@media (prefers-color-scheme: light) {
  :root:not([data-ds-mode]) { /* light overrides */ }
}

:root[data-ds-mode='dark'] { /* dark overrides */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-ds-mode]) { /* dark overrides */ }
}
```

- **Light values need their own mode selectors.** An unlayered `:root` rule also
  beats the built-in dark values, so a light-only override placed there would
  leak into dark mode. The mode selectors are also more specific than `:root`,
  which is what gives mode values precedence over `shared`.
- **Rendered with `dangerouslySetInnerHTML`.** React may escape quotes in
  `<style>` children during server rendering, which would break selectors and
  font stacks. This is safe because validation rejects `<`.
- **When server-rendered, overrides don't flash.** In a client-rendered app they
  arrive with the app's JavaScript; a project that wants them sooner can ship
  `themeToCss` output as a static stylesheet.
- It's unlayered, so it beats `ds.theme` regardless of stylesheet order.
- **It's a plain element on purpose.** React 19 keeps hoisted styles (those with
  `href` and `precedence`) in the document after unmount, so a project switching
  themes at runtime would accumulate stale rules.
- **Zero runtime styling (ADR 0001) still holds.** Components compile to static
  CSS. This is one string built from a theme object, only when a project uses
  typed overrides.

## Overriding with plain CSS

Documented in the README and Storybook:

```css
/* Both modes */
:root { --ds-radius-control: 8px; }

/* Per mode: a plain :root rule would apply to both modes */
:root[data-ds-mode='light'] { --ds-color-bg-accent: #0f766e; }
@media (prefers-color-scheme: light) {
  :root:not([data-ds-mode]) { --ds-color-bg-accent: #0f766e; }
}

:root[data-ds-mode='dark'] { --ds-color-bg-accent: #2dd4bf; }
@media (prefers-color-scheme: dark) {
  :root:not([data-ds-mode]) { --ds-color-bg-accent: #2dd4bf; }
}
```

The rules must be unlayered, or in a layer declared after `ds.theme`.

## Alias tokens

**This amends Spec 02.** Aliases reference another token instead of copying its
value. In Soft, `radius.control` is `var(--ds-radius-md)`, not `12px`, and
`fg.accent` and `focus` are `var(--ds-color-bg-accent)`. So:

- Overriding `radius.md` also changes controls.
- Overriding `radius.control` changes controls only.
- Overriding `bg.accent` also changes links, accent text, and focus rings.

Without this, changing a value would silently miss everything using an alias.

**Changing the accent takes more than one token.** `bg.accentHover`,
`bg.accentSubtle`, and `fg.onAccent` are separate values, so a project changing
the accent should set those too. Otherwise the hover state keeps the old color,
and text on the new accent may lose contrast. The examples in this spec are
shortened.

## Module boundaries

`"use client"` is preserved per output file (Spec 01), so these must be in
separate modules for server components to work:

| Client modules | Modules without the directive |
|---|---|
| `ThemeProvider`, `useColorMode` | `defineTheme`, `defineFullTheme`, `themeToCss`, `ColorModeScript`, `getColorModeScript` |

`fixtures/next-app` calls `defineTheme` and renders `ColorModeScript` from a
server component to enforce this.

## Non-goals (v1)

- **Scoped themes**, such as a dark section on a light page.
  Variables live on the root, which is what makes portals work. Adding scoping
  later wouldn't break anything, so it can wait for a real need.
- **Storing the choice in a cookie.** The choice is stored in `localStorage`. The inline script needs no
  server code and works with static hosting. The cost is that the server can't
  render mode-specific markup, which is why `resolvedMode` starts `undefined`.
- **Automatic `<meta name="theme-color">`.** A project can set it per mode.

## Testing

**Unit (Vitest):**

- `defineTheme` and `themeToCss` output, precedence, and value validation.
- A light-only override leaves dark mode unchanged, and the reverse.
- Choosing `'system'` persists when `defaultMode` is `dark`.
- `useColorMode`: setting and clearing, `forcedMode`, storage events, the
  error outside a provider, and failing `localStorage` (e.g., blocked storage).
- `data-ds-mode` restored on provider unmount; nested-provider warning.

**Type tests (Spec 01):** `defineTheme` rejects unknown tokens;
`defineFullTheme` rejects a missing token.

**Browser (Playwright, in both fixtures):**

- With a stored `dark`, the canvas color is correct at first paint, before the
  app's JavaScript loads (block the bundle and assert on the computed style).
- With no stored value, emulating `prefers-color-scheme` selects the right mode
  and updates live.
- With JavaScript disabled, `styles.css` alone follows the OS.
- No hydration warnings in `fixtures/next-app`.
- A dialog-like portaled element inherits the theme. Until `Dialog` exists, a
  test-only portal is enough.
- In `fixtures/next-app`, typed overrides appear in the server-rendered HTML
  unescaped, with no flash.

**Storybook:** the toolbar sets `data-ds-mode` on the preview's root, so axe and
visual tests run both modes through the same mechanism as production.

## Acceptance criteria

- `styles.css` alone renders Soft following the OS, with JavaScript disabled.
- A stored choice shows no flash of the wrong mode in either fixture, using
  `ColorModeScript` in Next.js and `getColorModeScript` in Vite.
- `forcedMode` and `data-ds-mode` lock the mode regardless of the OS or stored
  choice.
- Switching modes re-renders only components that call `useColorMode`.
- A typed override and the equivalent plain CSS produce the same result in both
  modes, and an override for one mode doesn't affect the other.
- A misspelled token in `defineTheme` is a compile error.
- All browser tests above pass.

## Left to the builder

- Internal file organization.
- How transitions are suppressed during a switch.
- Exact development warning text.
