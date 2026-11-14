# Spec 13: Data

- **Status:** Accepted
- **Date:** 2026-11-06
- **Milestone:** v0.4
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 07](07-icon.md), [Spec 09](09-forms.md)

## Purpose

Define `Table`, `DataTable`, `Pagination`, `Skeleton`, and `EmptyState`, the components for showing structured data and its loading and empty states.

## Decided during planning

- Charts aren't included (Spec 00).
- Table text is `font.size.sm` (13px), and `Table` and `Stat` apply tabular numerals (Spec 02).
- Table rules use `border.subtle` (Spec 02), and selected rows use `bg.accentSubtle` (Spec 02).
- `Table` owns its scroll container, so `Prose` can leave wide tables to it (Spec 11).
- Icons are passed as elements to client components (Spec 07).

## `Table`

Styled, semantic tables, as a set of parts. They hold no state and work in server components. A project keeps sorting, paging, and selection in its own state or a library such as TanStack Table, and renders the result with these parts.

```tsx
<Table aria-label="Customers" scrollable stickyHeader maxHeight="screen">
  <TableHead>
    <TableRow>
      <TableSortHeader direction="ascending" onSort={sortByName}>Name</TableSortHeader>
      <TableHeader>Plan</TableHeader>
      <TableSortHeader align="end" direction="none" onSort={sortBySpend}>Spend</TableSortHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableHeader scope="row">Ada Park</TableHeader>
      <TableCell>Pro</TableCell>
      <TableCell align="end">1,240</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

| Part | Renders | Props |
|---|---|---|
| `Table` | A scroll wrapper and `table` | `size` (`sm`, `md`; default `md`); `stickyHeader` (default `false`); `stickyFirstColumn` (default `false`); `stickyBackground` (`canvas`, `surface`, `raised`, `sunken`; default `surface`); `hoverable` (default `true`); `scrollable` (default `false`); layout props; `aria-label`, `aria-labelledby` |
| `TableCaption` | `caption` | `visuallyHidden` (default `false`): still names the table for screen readers |
| `TableHead`, `TableBody`, `TableFoot` | `thead`, `tbody`, `tfoot` | |
| `TableRow` | `tr` | `hoverable` (default `true`): turns hover off for one row, such as one holding an `EmptyState`; `selected` (default `false`): the selected style only, so the project's own control carries the state for assistive technology; `spanned` (default `false`): marks a row that a first-column `rowSpan` above covers, so its first cell doesn't stick |
| `TableHeader` | `th` | `scope` (`col`, `row`; default `col`); `align` (`start`, `center`, `end`; default `start`) |
| `TableSortHeader` | `th` with a `button` inside | `direction` (`ascending`, `descending`, `none`; **required**); `onSort` or `href`; `as`, with `href`; `align` |
| `TableCell` | `td` | `align`, plus native attributes such as `colSpan`, `rowSpan`, and `headers` |

`TableHeader` also takes native `th` attributes. `className`, `style`, `ref`, and the name (`aria-label`, `aria-labelledby`) go to the `table`. Layout props go to the wrapper.

### Layout and scrolling

- **The wrapper scrolls sideways when the table is wider than its space.** The table is at least full width.
- **`scrollable` makes the wrapper keyboard-accessible,** with `role="region"`, the table's name, and `tabIndex={0}`, since not every browser makes a scrolling region focusable. It's opt-in, for tables that may overflow. On by default, it would add a tab stop and a landmark to every small table, and turning it on only when overflowing means measuring, which makes `Table` a client component. It needs a name, and logs a development warning without one.
- **`stickyHeader` sticks to the wrapper, not the page,** because the wrapper is the scroll container. So it needs a height limit: `maxHeight="screen"`, or `maxHeight="full"` inside a parent with a height, which is also how to get an exact height. A development warning can't detect a missing limit from the server, so the docs cover it. Only a one-row `TableHead` sticks. A header with two or more rows, such as column groups over columns, scrolls with the table: its rows would stack at the same offset, and the scroll padding reserves one row, so focus could land under the second (WCAG 2.4.11).
- **`stickyFirstColumn` keeps each row's first cell in view while the table scrolls sideways,** including in `TableHead` and `TableFoot`. It uses `inset-inline-start`, so it follows text direction, and has a `border.subtle` end border as an edge. Its cells have a fixed width, half of `size.dialog.sm` (12rem in Soft), with `overflow-wrap: anywhere`, so long row headers wrap inside it instead of widening it. A width that follows the content was rejected: browsers ignore `max-width` on table cells, so a long row header could make the column wider than the scroll area and hide a focused cell entirely, and measuring it would make `Table` a client component. A cell with `colSpan` doesn't stick, so an `EmptyState` row is unaffected. A first-column cell with `rowSpan` sticks. Mark the rows it covers with `TableRow`'s `spanned`, since their first cell is really in the second column and would otherwise stick. Two limits follow. A covered row's selected bar is drawn on its first cell, which is in the second column, so while the table is scrolled sideways the bar scrolls under the sticky spanning cell, and the row's selection shows only as its background color. The spanning cell takes the hover and selected color of its own (first) row only, not of the rows it covers. Detecting spans in CSS with `:has()` was rejected: it made reordering a 2,000-row table about ten times slower (146ms against 15ms), capped spans at a fixed length, and misread a second-column span in a covered row. Don't set a width on first-column cells: the scroll reserve assumes the fixed width, so a wider column could hide a focused cell. Use it with `scrollable`, so keyboard users can reach what it scrolls past.
- **`stickyBackground` sets the background of sticky cells,** so rows don't show through. It should match what the table sits on: the default `surface` suits a `Card`, and `canvas` suits a table directly on the page. It has no effect without a sticky prop. In the first column, a hovered or selected row's background replaces it, and these are opaque too.
- **Sticky cells stack inside the wrapper,** which sets `isolation: isolate`. The corner cell sits above both the header row and the first column, and none of them can cover page overlays.
- **Sticky parts mustn't hide keyboard focus (WCAG 2.4.11).** The wrapper reserves space for them with `scroll-padding`, so a focused element scrolled into view lands clear of them. The first column's reserve is its fixed width plus a gap for the focus ring.
- **Cells use `overflow-wrap: break-word`,** so a long URL can break, while short words and headers don't. `anywhere` would shrink columns to one or two letters per line, and the table would never scroll. Sticky first-column cells are the exception, since their width is fixed.

### Appearance

- **Cells:** `font.size.sm`, `fg.default`, tabular numerals, and a `border.subtle` top border on body cells. The table uses `border-collapse: separate` with no spacing, because collapsed borders don't stay on sticky cells. Padding is `space.2` at `md`, and `space.1` block and `space.2` inline at `sm`.
- **Headers in `TableHead`:** `xs` uppercase `medium` labels with `wide` letter spacing, in `fg.muted`, with a `border.subtle` bottom border. Pass normal case, since CSS does the uppercase.
- **`TableFoot`:** `semibold`, with a `border.subtle` top border.
- **Row headers (`scope="row"`):** `medium` weight, with normal case and color. Styling depends on `tbody th`, since a server component can't use context here.
- **`hoverable`:** rows in `TableBody` use `bg.muted` on hover, inside `@media (hover: hover)`. It helps track across wide rows. It doesn't imply the row is clickable.
- **Muted text stays off `bg.mutedHover`,** since that pair fails contrast. Row hover uses `bg.muted`, where it passes.
- **New contrast pairs:** `fg.default` and `fg.muted` on `bg.accentSubtle`, at 14.5:1 and 4.8:1 in light and 14.1:1 and 6.4:1 in dark. This adds to Spec 02.
- **Forced colors:** table rules are borders, so they stay, and the sort icon inherits text color.

### Sorting

`TableSortHeader` displays a sort state. The project sorts its own data.

- **A real `button` or link fills the `th`,** with an internal arrow icon, and `aria-sort` on the `th`. `none` omits `aria-sort`, and shows a faint icon, so sorting is discoverable on touch screens too.
- **`onSort` receives nothing,** and the project decides the next direction. So tri-state or two-state sorting are both possible.
- **`href` renders a link instead**, for sorting through the URL, such as `?sort=spend`. A server component works out the next URL and passes it as a string, and `as` takes a router link. This matches `Pagination`.
- **It has no `"use client"`,** like `Pagination`, so `href` works from a server component. `onSort` needs a client component, since a server component can't pass a function to a client one.
- **Only one header should be sorted at a time.** The docs cover this, since a server component can't check it.

### `Table` inside `Prose`

MDX can map `table` to `Table` (Spec 11). `Table`'s classes beat `Prose`'s `:where()` rules, including `overflow-wrap`. `Table` sets the inner `table`'s margin to `0`, and the wrapper has a `data-ds-table` attribute, which `Prose` gives vertical margins. This adds to Spec 11.

## `DataTable`

Takes rows and column definitions, and handles sorting, pagination, selection, and the loading and empty states. It's built from the parts above, so it looks the same. **Use `Table` for display and server rendering, and `DataTable` when the table needs to manage its own behavior.**

```tsx
"use client";

<DataTable
  aria-label="Customers"
  rows={customers}
  getRowId={(c) => c.id}
  columns={[
    { id: "name", header: "Name", cell: (c) => c.name, sortValue: (c) => c.name, rowHeader: true },
    { id: "plan", header: "Plan", cell: (c) => c.plan },
    { id: "spend", header: "Spend", cell: (c) => c.spend.toFixed(2), sortValue: (c) => c.spend, align: "end" },
  ]}
  pageSize={25}
  selectionMode="multiple"
  selectedKeys={selected}
  onSelectionChange={setSelected}
  stickyHeader
  maxHeight="screen"
/>
```

| Prop | Values | Default |
|---|---|---|
| `rows` | An array; **required** | |
| `columns` | Column definitions, below; **required** | |
| `getRowId` | `(row) => string`, unique and stable; **required** | |
| `aria-label`, `aria-labelledby` | One is required by the types | |
| `sort`, `defaultSort`, `onSortChange` | `{ column: string, direction: "ascending" \| "descending" }` or `null` | `null` |
| `pageSize` | number: turns on pagination | none, all rows show |
| `page`, `defaultPage`, `onPageChange` | number, starting at 1 | `1` |
| `totalRows` | number, for rows paged by a server. Needs `pageSize`, by the types | `rows.length` |
| `selectionMode` | `none`, `single`, `multiple` | `none` |
| `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange` | `string[]` | `[]` |
| `disabledKeys` | `string[]`: rows that can't be selected | `[]` |
| `selectOnRowClick` | boolean: clicking anywhere on a row toggles it, with `selectionMode` | `true` |
| `loading` | boolean: shows `Skeleton` rows, and sets `aria-busy` on the wrapper | `false` |
| `empty` | ReactNode, usually an `EmptyState`, shown when there are no rows | none |
| `labels` | Strings for translation: `selectRow`, `selectPage`, `clearSelection`, `selectedCount` (`"{count} selected"`), `selection` (the toolbar's name), and `Pagination`'s | English |
| `locale` | A BCP 47 tag for sorting strings, fixed so the server and browser produce the same order | `"en-US"` |

It also accepts `size`, `stickyHeader`, `stickyFirstColumn`, `stickyBackground`, `hoverable`, `scrollable`, and layout props, which work as they do on `Table`, except that layout props go to an outer element holding the toolbar, scroll wrapper, and `Pagination`, and `height` and `maxHeight` go to the scroll wrapper, so sticky parts work. `className`, `style`, and `ref` go to the `table`. It's generic over the row type, so `cell` and `sortValue` are typed from `rows`. `aria-label` and `aria-labelledby` are a union, so exactly one is set.

**Columns:**

| Field | Values | |
|---|---|---|
| `id` | string; **required** | Identifies the column in `sort` |
| `header` | ReactNode; **required** | |
| `cell` | `(row) => ReactNode`; **required** | |
| `rowHeader` | boolean | Exactly one column needs it, and a development warning covers this |
| `sortValue` | `(row) => string \| number \| null` | Makes the column sortable, sorted by `DataTable` |
| `sortable` | boolean | Makes the column sortable without sorting: the project sorts in `onSortChange`, such as on a server. The types allow this or `sortValue`, not both |
| `align` | `start`, `center`, `end` | |

### Behavior

- **Sorting:** a sortable header cycles through ascending, descending, and unsorted. Sorting is stable, strings use `Intl.Collator` with `locale`, and `null` sorts last in both directions. Only one column sorts at a time. A controlled `sort` still sorts locally through `sortValue`, and only the state moves to the project.
- **Pagination:** renders `Pagination` with `onPageChange` under the table, using buttons. Changing the sort goes back to page 1. If `rows` shrinks past the current page, an uncontrolled page moves to the last one. With `totalRows`, `rows` is taken as the current page and isn't sliced. Since `sortValue` would then sort only that page, a development warning says to use `sortable`.
- **Loading:** with no rows, `loading` shows `pageSize` `Skeleton` rows, or 5 without it, and these rows can't be selected. With rows, as in a refetch, the rows stay and `aria-busy` is set. `loading` wins over `empty`.
- **Not included:** filtering, since a project passes filtered `rows`; virtualization; cell editing; column resizing; and footers. A table that needs them uses the parts with a library such as TanStack Table.

### Selection

With `selectionMode`, the table stays a plain table with its normal `Tab` order. It uses neither checkboxes nor an ARIA grid.

- **The `rowHeader` cell's content becomes a toggle button,** with `aria-pressed`, wrapping whatever `cell` returns. That must be phrasing content, and images need alt text. A visually hidden `labels.selectRow` comes first, so a screen reader hears "Select Ada Park, toggle button", and the visible text stays in the name (WCAG 2.5.3). A selected row's button also shows an internal check icon. A dotted underline, solid on hover, shows it can be pressed. It's at least 24px tall (WCAG 2.5.8) at both sizes.
- **So the `rowHeader` cell can't hold links or buttons,** because they'd be nested inside this one. A development-only check of the rendered cell warns about this, once per column. Put a link to the row's page in another column.
- **Clicking anywhere on a row also toggles it,** with a pointer cursor to show this. It's for pointer users, and the button stays the keyboard and screen reader route. `selectOnRowClick={false}` turns it off, for rows where clicks would mostly be accidental. The button has its own click handler, since it has to work with row clicks off, and the row's handler ignores clicks from inside any interactive element, so a click on the button toggles once.
- **Some clicks don't toggle the row:** those inside `a`, `button`, `input`, `select`, `textarea`, `label`, `summary`, or an element with an interactive ARIA role, and any that end a text selection, so copying text doesn't change the selection.
- **Keyboard:** each row's button is a `Tab` stop, and `Space` or `Enter` toggles it. Arrow-key navigation and `Shift` range selection aren't included, and can be added later without breaking anything.
- **`single`** replaces the selection, and toggling the selected row clears it.
- **`multiple` adds a toolbar above the scroll wrapper,** so it doesn't scroll with the table. `single` has none. It's a named `role="group"` with a "Select page" toggle, a count of selected rows, and a Clear button. Select page has `aria-pressed` of `true`, `false`, or `mixed`, and skips disabled rows. It lives outside the table because the name header is already the sort control. The count is a `role="status"` element, so it's announced once per change, including when Select page adds many rows, and not on first render.
- **Selection persists across pages,** and `onSelectionChange` always receives an array of every selected key, in any order.
- **`disabledKeys` rows** have a `disabled` button that keeps its normal text color, since it's also the row's name, and row clicks do nothing. Their links and other controls still work.
- **`Skeleton` rows have no button.**
- **Selected rows** use `bg.accentSubtle` with a `borderWidth.thick` `bg.accent` bar at the start of the row, since color can't be the only signal (Spec 05). The bar is a `::before` on the row's first cell, positioned with `inset-inline-start`, because pseudo-elements on a `tr` aren't reliable. A selected row's hover stays `bg.accentSubtle`, and the bar uses `Highlight` in forced colors. `TableRow selected` uses the same styles.

## `Pagination`

```tsx
// With links, which works from a server component
<Pagination page={3} totalPages={10} getHref={(p) => `/customers?page=${p}`} as={NextLink} />

// With state, from a client component
<Pagination page={page} totalPages={10} onPageChange={setPage} />
```

| Prop | Values | Default |
|---|---|---|
| `page` | number, starting at 1; **required** | |
| `totalPages` | number; **required** | |
| `getHref` | `(page) => string`: renders links | none |
| `onPageChange` | `(page) => void`: renders buttons | none |
| `as` | A router link, used with `getHref` | `a` |
| `siblingCount` | `0`, `1`, `2`: pages shown beside the current one | `1` |
| `size` | `sm`, `md` | `md` |
| `aria-label` | string | `"Pagination"` |
| `labels` | Strings: `previous`, `next`, `page` (`"Page {page}"`), and `status` (`"Page {page} of {total}"`), for translation | English |

One of `getHref` or `onPageChange` is required by the types. It accepts layout props.

- **Links are the better default**. They work without JavaScript, support opening in a new tab, and keep the page in the URL.
- **It has no `"use client"`,** so `getHref` works when rendered from a server component, since the function runs on the server and never crosses a boundary. It renders `Button` and `IconButton`, which are client components, using strings and elements.
- **Functions can't cross from a server component to a client one.** So `onPageChange` needs a client parent, and if a client module imports `Pagination`, a server component above that module can't pass `getHref` through it. `labels` are strings with placeholders, so they always work.
- **Markup:** one `nav` with its label, containing both layouts. The current page has `aria-current="page"`, and `Pagination` also sets `data-current` on it.
- **Which pages show,** with `slots = 2 × siblingCount + 5`. If `totalPages` fits in `slots`, all of them show. Otherwise: near the start, `1` to `slots - 2`, an ellipsis, and the last page. Near the end, the first page, an ellipsis, and the last `slots - 2`. In the middle, the first page, an ellipsis, the current page with its siblings, an ellipsis, and the last page. An ellipsis never replaces a single page. So above `slots`, the number of items stays constant and buttons don't shift while paging. The ellipsis is `aria-hidden`.
- **Previous and next** use internal chevrons, with `labels` as their accessible names. At the first or last page, they render as a `disabled` `IconButton`, even in link mode, because a router link without `href` can throw. They stay visible, so the width doesn't change.
- **Appearance:** `ghost` `Button`s and `IconButton`s, so pages are square at their control height. The current page is `soft` with `semibold` weight, so weight separates it from a hovered page, and it hovers to `bg.mutedHover`, as `soft` does.
- **Small screens:** below `sm`, it shows previous, "Page 3 of 10" (`labels.status`), and next. CSS switches between the two, and both are in the DOM, with the hidden one `display: none`.
- **Invalid `page`** outside `1` to `totalPages` logs a development warning. `totalPages` of `0` or `1` renders nothing.

## `Skeleton`

A placeholder for content that's loading.

```tsx
<Skeleton width="full" height="10" />
<Skeleton variant="circle" width="10" height="10" />
<Skeleton variant="text" lines={3} />
```

| Prop | Values | Default |
|---|---|---|
| `variant` | `rect`, `circle`, `text` | `rect` |
| `lines` | number, with `text` | `1` |

It accepts layout props, including `width` and `height`. `rect` and `text` default to full width, and are `display: block`, or `inline-block` with `as="span"`. `circle` needs a size.

- **`rect`** uses `radius.md`, `circle` uses `radius.full`, and `text` uses `radius.sm`.
- **`text`** is `1em` tall with line spacing to match, so it takes on the surrounding font size. The last of several lines is 60% wide. Lines are `span`s, so they're valid inside `as="span"`.
- **Appearance:** `bg.mutedHover`, because `bg.muted` nearly disappears on the light canvas at 1.05:1, pulsing `opacity`. **Alternative:** a moving shimmer gradient, which is more noticeable and uses more paint.
- **Reduced motion:** the pulse's duration is a multiple of `motion.duration.slow`, so it becomes `0ms` and doesn't pulse (Spec 02). It stays visible.
- **`aria-hidden="true"` always,** since a screen reader gains nothing from it. Set `aria-busy` on the region that's loading, and add `VisuallyHidden` loading text or a live region when it's needed. The docs show this.
- **Forced colors:** a `1px` transparent border keeps it visible, as cards do (Spec 05).
- **No delay built in.** Showing a skeleton for a very fast load is a flash. That depends on the data layer, so the project controls it.
- Default element: `div`, or `span` with `as`. Add `Skeleton` to Spec 05's `as` list, so it can sit in text.

## `EmptyState`

What to show when a list or table has nothing in it.

```tsx
<EmptyState
  icon={<Icon icon={Search} size="lg" tone="muted" />}
  title="No results"
  description="Try a different search."
  action={<Button variant="soft">Clear filters</Button>}
/>
```

| Prop | Values | Default |
|---|---|---|
| `title` | ReactNode; **required** | |
| `description` | ReactNode | none |
| `icon` | An `Icon` element | none |
| `action` | ReactNode | none |
| `headingLevel` | `1`–`6` | `3` |
| `size` | `sm`, `md` | `md` |

It accepts layout props. Default element: `div`.

- **Appearance:** centered and stacked, with `title` as a `semibold` `Heading` (`lg` at `md`, `md` at `sm`), and `description` in `fg.muted`. `space.8` padding at `md`, and `space.4` at `sm`. It has no surface of its own, so it goes in a `Card` or anywhere else.
- **`icon`** is styled by whoever passes it, as with other icon props (Spec 07), so the example sets its size and tone.
- **`headingLevel`** matches the page's structure, and only changes the tag. The size stays the same.
- **In a table:** one `TableRow hoverable={false}`, with a `TableCell` whose `colSpan` covers every column.
- **Announcing:** it has no live region, since it isn't always a change. If it appears after a search, the project wraps it in one.

## Server and client

**`DataTable` is a client component,** and `columns` holds functions, so its columns must be defined in client code. The others have no `"use client"`, so **they work in server components**. `onSort` and `onPageChange` are the exception: both need a client parent. A sortable `Table` using them lives entirely in a client component, and one using `href` can stay on the server.

## Public state attributes

- `data-selected` on selected rows, from `DataTable` or `TableRow selected`.
- `data-direction` on `TableSortHeader`: `ascending`, `descending`, or `none`.
- `data-current` on `Pagination`'s current page, set by `Pagination`, not `Button`.
- `data-ds-table` on `Table`'s wrapper.

## Differences from Spec 05

- **`DataTable` uses `selectedKeys`, `sort`, and `page` with their own change handlers,** not `value` and `onValueChange`, since it has several independent states.
- **`DataTable`'s layout props go to an outer element,** apart from `height` and `maxHeight`, and `className`, `style`, and `ref` go to the `table`.
- **`Table`'s layout props go to its wrapper,** and other attributes to the `table`. With `scrollable`, the name goes to both.
- **`TableSortHeader`'s `as` is for its link,** not its `th`.
- **`Skeleton` accepts `as`,** which adds it to Spec 05's list.
- **`Pagination`'s `as` is for its links,** not its root.
- **`Pagination` accepts `aria-label` with a default,** unlike `NavBar`, since a page has few of them and "Pagination" is a useful name.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- Each part renders its element, and `scope` and `align` apply.
- `TableSortHeader`: `direction` sets `aria-sort`, `none` omits it, `onSort` fires, and `href` renders a link.
- `scrollable` adds `role="region"`, `tabIndex`, and the name to the wrapper, and warns without a name. Without it, the wrapper has none of these, and the name is on the `table`.
- `DataTable`: sorting cycles and sorts stably with `null` last, `sortable` reports without reordering, paging slices rows unless `totalRows` is set, changing the sort returns to page 1, and `loading` and `empty` render. Controlled and uncontrolled state both work. It warns without exactly one `rowHeader`.
- `DataTable` selection: the `rowHeader` cell renders a button with `aria-pressed` and the hidden `selectRow` text only with `selectionMode`, `disabledKeys` disables it, and interactive content in that cell warns. It never renders `role="grid"`. `locale` sets the string sort order.
- `Pagination`: page ranges follow the `slots` rule for `totalPages` from 1 to 20 at each `siblingCount`, with a constant length above `slots`, and no ellipsis replacing a single page. `getHref` renders links, `onPageChange` renders buttons, the current page has `aria-current`, and the ends disable correctly. `totalPages` of `1` renders nothing. An invalid `page` warns.
- `Skeleton`: `aria-hidden`, `lines`, and variants. `EmptyState`: `headingLevel` sets the tag, not the size.

**Browser (story tests):**

- A wide table scrolls inside its wrapper at 320px, doesn't widen the page, and doesn't break short words. With `scrollable`, it scrolls by keyboard.
- `stickyHeader` stays visible with its bottom border while the wrapper scrolls, and rows don't show through.
- A two-row `TableHead` doesn't stick, so neither header row covers the other; a one-row header still sticks.
- `stickyFirstColumn` stays in view while scrolling sideways, in both text directions and together with `stickyHeader`. Hovered and selected rows keep their background and selected bar, and a `colSpan` cell doesn't stick. A focused element is never hidden under a sticky part, and the table stays usable at 320px.
- `stickyBackground` applies each value to sticky cells only.
- `hoverable`, selected rows, and focus rings aren't clipped by the wrapper.
- Selection: `Space` and `Enter` toggle the button. A row click toggles once, including on the button, and never with `selectOnRowClick={false}` or on a disabled row. Clicks on links and controls in cells, and clicks that end a text selection, don't toggle. Select page moves through `mixed` and `true`, skips disabled rows, and keeps off-page selections. `single` replaces and clears. `Skeleton` rows can't be selected.
- `DataTable` matches an equivalent `Table` visually, with and without selection, at both sizes and with each sticky prop.
- `Pagination` switches layouts at `sm`, and keeps one visible set in the accessibility tree.
- `Skeleton` doesn't animate with reduced motion, and `text` matches its parent's font size.
- `Table` inside `Prose` keeps its own styles, its wrapper has `Prose`'s margins, and it still scrolls.

**`fixtures/next-app`:** a server-rendered `Table` and `Pagination` with `getHref` and `next/link`, and a `DataTable` with selection and `defaultSort`, with no hydration warnings.

**Manual:** a screen reader pass on tables, sorting, and selection, and forced colors, per Spec 05.

## Storybook

- A page per component, in both modes.
- A full `DataTable` page, with sorting, selection, pagination, loading, and empty states.
- A TanStack Table recipe.
- The overview page above is `Patterns/Data`, and the component pages follow Spec 18's docs page format (amended by Spec 18, 2026-11-13).

## Acceptance criteria

- All five match this spec, and meet Spec 05's definition of done.
- A table with sorting, selection, pagination, and loading and empty states can be built with `DataTable`, without `style` or `className`.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- The sort and chevron icons.
- The pulse's timing, as a multiple of `motion.duration.slow`.
- Internal file organization.
