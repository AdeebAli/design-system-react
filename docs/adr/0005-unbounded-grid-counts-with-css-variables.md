# ADR 0005: Unbounded grid counts with CSS variables

- **Status:** Accepted
- **Date:** 2026-11-25
- **Amends:** [ADR 0001](0001-styling-with-vanilla-extract.md), for three props

## Context

ADR 0001 generates `Box`'s style props with `@vanilla-extract/sprinkles`: "a finite, typed set of atomic classes constrained to tokens". For tokens, a finite set is the point. Grid counts aren't tokens. They're counts, and Spec 19 removes the limit of 12 on `gridTemplateColumns` (`Grid`'s `columns`), `gridColumn`, and `gridRow` (owner, 2026-11-25). A finite class list can't cover every count.

Constraints:

- All CSS still compiles at library build time into the one static `styles.css` (ADR 0001).
- A project's CSS must still be able to override a component's layout. Spec 06 avoids inline styles because an inline declaration beats it.
- The layout components work in server components, so the mechanism can't need client JS.
- About 38 components apply layout props through `box()`, which returns only a class string.

## Decision

Those three props stop coming from sprinkles:

- For each prop and breakpoint (15 in all), one static class sets the CSS property from a CSS variable, for example `grid-template-columns: repeat(var(--…-md), minmax(0, 1fr))` inside the `md` media query. `full` (`1 / -1`) stays its own class.
- The element gets that class, and the count goes in its inline `style` as the variable only, for example `--…-md: 16`. The `grid-*` property itself is still set by a class.
- `Box` and an internal helper that returns `{ className, style }` apply them. The components that used `box()` for layout props switch to the helper. The public `box()` no longer accepts the three props.
- The variable names are exported from the `.css.ts` file. No runtime dependency is added.

## Alternatives considered

| Option | Why not chosen |
|---|---|
| **Raise the limit** (for example to 24) | Still a limit, which the owner ruled out. Adds 12 classes per breakpoint for each of the three props. |
| **Inline `grid-template-columns`** | Simplest, but the inline declaration beats a project's CSS, the reason Spec 06 avoids inline styles. Responsive values need media queries, which inline styles can't have. |
| **`@vanilla-extract/dynamic`'s `assignInlineVars`** | Does the same job as hand-setting the variable, but adds a runtime dependency for a few lines of code. |
| **`box()` returns `{ className, style }`** | Would keep the props on `box()`, but breaks every `className={box(…)}` call. The owner chose to remove the props from `box()`. |

## Consequences

**Positive**

- Any positive count works, responsively, on every component.
- `styles.css` gets smaller: 15 classes replace 12 per breakpoint for each prop.
- A project's CSS still overrides `grid-*` as before, and there's still no client JS.

**Negative / tradeoffs**

- Three style props no longer come from sprinkles, so `Box` has two code paths, and the type test that keeps prop types in sync with sprinkles must exclude them.
- Elements with a count get an inline `style` attribute, which a consumer's own `style` can override.
- A count can't be validated by the types (`1.5` type-checks), so invalid values are caught by a development warning.
- `box()` can't place a third-party component in a grid. Wrap it in `Box` or use `style`.
