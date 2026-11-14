# Spec 05: Component conventions

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.1
- **Depends on:** [Spec 00](00-overview.md), [Spec 01](01-repo-and-tooling.md), [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [ADR 0002](../adr/0002-headless-primitives-with-base-ui.md)

## Purpose

The rules every component follows, so specs 06–13 only describe what's unique to
each component. If a component spec conflicts with this one, the component spec
must say so and explain why.

## Decided during planning

- Components are built on `Box` through composition.
- Every component accepts layout props. Visual styling comes from variants and the
  theme, with `className` and `style` as escape hatches.
- Interactive behavior comes from Base UI, wrapped behind this library's names and
  typed props. Consumers never import Base UI.
- WCAG 2.2 AA in both modes.
- Types serve the developer: readable hovers, doc comments on every prop,
  autocomplete with only valid values, and no casts for ordinary use.
- Ordinary components don't get type tests (Spec 01).
- Stories cover every variant and state, plus a Playground (Spec 01).

## Prop vocabulary

The same concept uses the same name everywhere.

| Prop | Meaning | Values |
|---|---|---|
| `variant` | Visual style | Component-specific, e.g., `solid`, `soft`, `outline`, `ghost` |
| `size` | Component scale | `sm`, `md`, `lg`; default `md` |
| `tone` | Color meaning | Subset of `neutral`, `accent`, `success`, `warning`, `danger`, `info` |
| `disabled` | Can't be interacted with | boolean |
| `invalid` | Failed validation | boolean |
| `required` | Must be filled | boolean |
| `loading` | Waiting on work | boolean |
| `value`, `defaultValue`, `onValueChange` | Controlled and uncontrolled value, on Base UI controls such as `Select` and `Tabs`. `DataTable` has several independent states, so it uses `selectedKeys`, `sort`, and `page`, each with its own change handler | Component-specific |
| `checked`, `defaultChecked`, `onCheckedChange` | Controlled and uncontrolled checked state, on `Checkbox` and `Switch` | boolean |
| `open`, `defaultOpen`, `onOpenChange` | Controlled and uncontrolled visibility | boolean |

- Booleans have no `is` or `has` prefix, and default to `false`, so `<Button loading />` reads naturally.
- Event props start with `on`.
- A prop is added only when a real use needs it.
- `disabled`, `invalid`, and `required` mirror native HTML wherever an element has
  them.
- **Components built on a native control keep its native API.** `Input` and `Textarea` use
  `value` and `onChange`, not `onValueChange`, so they work with form libraries directly.
  Spec 09 defines the form-library contract for Base UI controls.
- A design system prop replaces a native attribute of the same name, such as `size` on
  `input`.

## Component anatomy

```tsx
interface BadgeOwnProps {
  /** Color meaning. @default 'neutral' */
  tone?: BadgeTone;
}

export type BadgeProps = ComponentProps<'span', BadgeOwnProps>;

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <Box as="span" className={cx(badge({ tone }), className)} {...props} />;
}
```

`ComponentProps<E, Own>` combines the component's own props, `LayoutProps`, and `E`'s
native props. It removes native props that clash with either, plus `color`, so `<Badge
color="red" />` is a type error. `PolymorphicProps<E, Own>` is the same for components that
accept `as`.

**Every component the library renders itself goes through `Box`.** Where Base UI owns the
element, the wrapper passes the classes from `box()` instead, so layout props behave the same
and no extra element is added.

- **Named function components.** No default exports, `forwardRef`, or `displayName`.
- **Native props pass through.** Each component extends its root element's props,
  so `id`, `aria-*`, `data-*`, and event handlers work.
- **`ref`, `className`, `style`, and layout props go to the root element**, unless
  the component spec names another target. For form controls, `ref` goes to the
  control itself, so focus and form libraries work.
- **Visual Box props aren't accepted.** `<Badge padding="4" />` is a type error.
  Use a variant, or `className` for a one-off.
- **Type helpers and `cx` are internal,** built once with `Box`. A Base UI wrapper uses an
  internal `splitLayoutProps` to separate layout props from the rest.

## Which components accept `as`

`as` is for elements where swapping the tag is safe:

| `as` | Components |
|---|---|
| Yes | `Box`, layout components, `Text`, `VisuallyHidden`, `Card`, `Link`, `NavBarLink`, `SidebarLink`, `BreadcrumbItem`, `MenuLinkItem`, `Prose`, `NotProse`, `Skeleton`, `Image` (an `img` or an image component such as `next/image`; Spec 17), `Button` and `IconButton` (to render a link), `TableSortHeader` and `Pagination` (for their links, not their root elements) |
| No | `Heading` (its `level` prop sets the tag), form controls, overlays, and anything else whose behavior depends on its element |

Polymorphic types cost more editor work, so only components on the "Yes" list carry
them.

**A server component can't pass one of its own components to a client component's `as`.**
`Button` is a client component, so `as={Link}` works with `next/link`, which is already a client
component, but not with a component defined in a server file.

## Multi-part components

**Flat named exports**, not dot notation:

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@adeebali/design-system-react';
```

- **The root part can be plain `<Dialog>`.** Namespaces need `<Dialog.Root>`, because a namespace
  (`export * as Dialog`) can't also be a component. Attaching parts to a component instead
  (`Object.assign`) breaks in server components.
- Part names start with the component name, so they group together in autocomplete.
- **Simple cases get a shortcut when it helps**, such as `Select` with an `options`
  prop. Each component spec decides.

## Styling

- **Styles live in `<Name>.css.ts`.** Variants use `recipe()`, and shared styles use
  `style()`.
- **Everything goes in the `ds.components` layer.** `recipe()` has no layer option, so a small
  internal helper wraps each style in `'@layer'`. Checked with `@vanilla-extract/recipes`:
  base, variant, and compound styles all stay in the layer, including nested selectors and
  `@media` rules.
- **All values come from `vars`.** The Spec 02 lint rule enforces this.
- **Interaction states are styled from attributes and pseudo-classes:** `:hover`,
  `:focus-visible`, `:disabled`, `[data-disabled]`, `[data-open]`, `[aria-invalid]`.
  Not from JavaScript state.
- **Focus uses a shared style**, per Spec 02, on `:focus-visible` only. Removing the
  focus ring without a replacement is not allowed.
- **Motion uses `motion.*` tokens**, so reduced motion works automatically. Only
  `opacity`, `transform`, and colors animate, to avoid layout shifts.
- **Hover styles are wrapped in `@media (hover: hover)`**, so they don't stick on touch
  screens.
- **Component styles must not set their own margins.** Spacing between components
  belongs to the parent or to layout props.
- **Variants come first in `recipe()`, with named token types exported**, so the same
  values drive types and stories.

## Base UI wrappers

Base UI's parts are unstyled and supply behavior, so wrappers only add a name, typed
props, and classes.

- **Only wrapper modules import Base UI**, and those modules live under
  `src/components/**`.
- **Public types never mention Base UI.** Props are written by hand, using only the
  options this library supports. An option is added when a spec calls for it. This
  keeps ADR 0002's promise that Base UI can be replaced.
- **A check in CI enforces this**, failing the `package` job if `dist/index.d.ts` mentions
  `base-ui`.
- **Base UI's `render` prop isn't exposed**, and neither are its function-style
  `className` and `style`. Where `as` is allowed, it maps to `render` internally. The exception is `Button` rendering a link, which skips Base UI's `Button`, because that would add `role="button"` (Spec 09).
- **Each component spec lists its public state attributes**, such as `data-open`,
  `data-checked`, and `data-disabled`. Only those are public API. Other Base UI attributes,
  such as `data-starting-style`, are for internal styles only. If Base UI is ever replaced,
  the wrappers must keep producing the public ones.
- This library's own components use the same attribute names, including `data-invalid` and
  `data-loading`.
- **Portaled parts are included automatically.** `DialogContent` renders its own portal,
  and consumers don't compose one.
- **The package is `@base-ui/react`** (1.9.0 when checked; `@base-ui-components/react` is
  deprecated). Exact prop and part names are confirmed against the installed version when
  each component is built.

## Server and client boundaries

- **`"use client"` only where a component uses state, effects, context, or event
  handlers internally, or wraps Base UI.** Everything else stays usable in server
  components, as `Box` does.
- **Each client component is its own module**, per Spec 03's module rule.
- **No browser globals during render**, such as `window` and `document`. They belong in
  effects or event handlers.
- **Generated IDs use `useId`**, so server and client match.

## Accessibility checklist

Each component spec lists anything beyond these. Every interactive component must:

1. Use the native element or the matching WAI-ARIA pattern, usually through Base UI.
2. Work fully with a keyboard, with a visible focus ring.
3. Have an accessible name. **Where a name can't come from visible text, the types require
   one**, such as `aria-label` on an icon-only button.
4. Have targets of at least 24×24 CSS pixels (WCAG 2.5.8).
5. Not use color as the only signal. Errors have text, and selected states have a shape,
   weight, or icon change.
6. Meet Spec 02's contrast rules in both modes. A state's colors must be listed in the
   contrast test when they add new pairs.
7. Respect reduced motion, through the `motion.*` tokens.
8. Stay usable in forced-colors mode (Windows High Contrast): controls stay
   visible and states stay distinguishable. Checked manually in a story, since it isn't
   automated. Shadows disappear in this mode, so cards keep a `1px` border in
   `color.border.surface`: even when it's `transparent`, browsers draw it in forced colors. Rules
   inside `@media (forced-colors: active)` may use system colors, as an exception to the
   raw-value lint rule.
9. Announce changes where needed, for example errors and toasts, using live regions.
10. Remain usable when browser text is enlarged to 200% (WCAG 1.4.4), since sizes are in
    `rem`.

## Types

- **Every public component exports `<Name>Props`.**
- **Every public prop has a TSDoc comment, with `@default` where one applies.**
- **Value unions are named and exported**, such as `BadgeTone`, so hovers stay short.
- **No `any` in public types.** Inside the library, a cast needs a comment explaining why.
- **Invalid combinations are type errors when that's simple to express.** Otherwise, they
  log a development warning.
- **Type tests stay limited to Spec 01's three areas.**

## Development warnings

Warnings run only outside production, checking `process.env.NODE_ENV`, which is left for the
consumer's bundler to replace. A single internal helper reads it inside `try` / `catch`, so an
environment without a bundler gets no warnings rather than an error. A `typeof process` check
won't work, because browsers have no `process` even when the bundler replaces the expression.

Warnings name the component and say how to fix the problem, and they log once per problem. A
warning that indicates an accessibility failure is also checked in tests.

## Public API and breaking changes

The only public entry points are the package root and `./styles.css` (Spec 01).

From v1.0, each of these is a **breaking change** that needs a major version (and in `0.x`,
a minor version with a release note):

- Removing or renaming a component, prop, value, type, or export.
- Removing or renaming a CSS variable or token.
- Adding a **required** token to the theme contract, since custom themes would no longer
  satisfy it.
- Removing or renaming a documented `data-*` attribute.
- Changing a default in a way that alters behavior.

These are **not** breaking:

- Generated class names and internal DOM structure below the documented parts.
- Visual changes to Soft that keep the same API. They get a release note.
- Internal dependency changes, including replacing Base UI, as long as public state attributes
  still work.

## Definition of done

A component is finished when it has:

- [ ] The source, styles, and `index.ts` from Spec 01's folder layout, exported from
      `src/index.ts`.
- [ ] Stories for every variant and state, plus a Playground, passing axe in both modes.
- [ ] Behavior tests for its props, refs, events, and keyboard interaction.
- [ ] Visual baselines.
- [ ] TSDoc on every public prop, and a docs page as in Spec 18: Usage, Do's and don'ts,
      Accessibility, API with a props table, and Examples (amended by Spec 18, 2026-11-13).
- [ ] The accessibility checklist completed, including a manual screen reader check for
      anything interactive.
- [ ] A render in `fixtures/next-app`, if it's the first of its kind (server or client).

## Left to the builder

- Internal helper names and locations.
- Story file structure beyond Spec 01's rules.
- Exact development warning text.
