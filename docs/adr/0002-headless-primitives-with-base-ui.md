# ADR 0002: Build interactive components on Base UI

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

The v1 scope is the full kit (~30 components). Several of them have complex
interaction and accessibility requirements: keyboard navigation, focus
trapping and restoration, ARIA semantics, dismissal behavior, and positioning
relative to an anchor. These include `Dialog`, `Popover`, `Tooltip`, `Menu`,
`Toast`, `Select`, `Tabs`, `Checkbox`, `Radio`, and `Switch`.

Hand-building these is the largest source of accessibility bugs in design
systems. Styling is handled by vanilla-extract (see
[ADR 0001](0001-styling-with-vanilla-extract.md)), so the behavior layer must
be unstyled and accept our classes without fighting them.

## Decision

Use [Base UI](https://base-ui.com/) as the headless behavior layer for
interactive components. Pin the current stable 1.x release; confirm the
package name and version at setup time.

- Base UI supplies behavior, state, ARIA, focus management, and positioning.
- This library supplies all styling (vanilla-extract recipes and theme tokens)
  and the public API.
- Base UI is an implementation detail: consumers import only from this
  library, never from Base UI directly. Our component APIs wrap Base UI's
  compound parts with our own names and typed props, so the dependency can be
  replaced without breaking consumers.
- Components with no meaningful interactive behavior (`Box`, `Stack`, `Text`,
  `Card`, `Stat`, `Badge`, `Prose`, etc.) do not use Base UI.

## Package (verified 2026-11-08)

- The package is **`@base-ui/react`**. The earlier `@base-ui-components/react`
  is deprecated with "Package was renamed to @base-ui/react".
- Latest stable is **1.9.0** (MIT). Its peers are `react` and `react-dom`
  `^17 || ^18 || ^19`, so React 19 is covered. `date-fns` and `@date-fns/tz`
  are optional peers, needed only for date components.
- 1.9.0 exports every part Spec 09 builds on: `field`, `select`, `checkbox`,
  `radio-group` and `radio`, `switch`, `toggle`, `toggle-group`, and `button`.
  Spec 09's specific API claims hold in its types: `Field.Root` has `invalid`
  but no `required`, `Field.Label` has `nativeLabel`, parts take a `render`
  prop, `Select.Root` takes `items` and passes event details to
  `onValueChange`, `Checkbox` and `Switch` use `onCheckedChange`, `Toggle` uses
  `pressed` and `onPressedChange`, `ToggleGroup` has `multiple`, and buttons
  have `nativeButton`.
- Install it as `^1.9.0` when v0.2 begins.

## Alternatives considered

| Option | Why not chosen |
|---|---|
| **Radix Primitives** | Mature and widely used, but now in maintenance mode, with development shifting to Base UI. |
| **React Aria (Adobe)** | Most thorough accessibility and internationalization, but a larger, more verbose API with a heavier integration cost. Strong fallback if Base UI proves insufficient. |
| **Build in-house** | Full control, but the highest effort and the highest accessibility risk, with no upside that justifies it for a personal system. |

## Consequences

**Positive**

- Accessible keyboard, focus, and ARIA behavior out of the box, maintained upstream.
- Unstyled by design, so it composes cleanly with vanilla-extract classes and
  `data-*` state attributes (e.g., `[data-open]`, `[data-disabled]`).
- Actively developed, with an API familiar to Radix users.

**Negative / tradeoffs**

- Newer than Radix and React Aria, so there are fewer community examples and
  edge cases are less battle-tested.
- Adds a runtime dependency; its version upgrades must be tracked.
- Wrapping compound parts behind our own API adds a layer to maintain, which is
  the cost of keeping the dependency swappable.
