# Components

Every component this package exports, grouped as in the specs. Each is documented, with live examples, in [Storybook](https://adeebali.github.io/design-system-react/).

## Layout

From [Spec 04](specs/04-box-and-style-props.md) and [Spec 06](specs/06-layout-and-typography.md).

| Component   | Use it for                                                           |
| ----------- | -------------------------------------------------------------------- |
| `Box`       | The base element, with token-only style props. `box()` gives a class |
| `Flex`      | Full flexbox control                                                 |
| `Stack`     | Children top to bottom                                               |
| `Inline`    | Children in a row that wraps, such as tags or buttons                |
| `Grid`      | CSS grid with equal columns; the base for bento layouts              |
| `Container` | A page's content, centered, with a maximum width and side padding    |
| `Center`    | Centering its content on one or both axes                            |
| `Inset`     | Padding from the spacing scale                                       |

## Typography

From [Spec 06](specs/06-layout-and-typography.md) and [Spec 11](specs/11-prose.md).

| Component            | Use it for                                                      |
| -------------------- | --------------------------------------------------------------- |
| `Text`               | Body text                                                       |
| `Heading`            | Headings; `level` is required and sets the tag                  |
| `Link`               | Links, in the accent color or the surrounding text color        |
| `Code`               | Inline code                                                     |
| `Kbd`                | A keyboard key; use one per key in a shortcut                   |
| `VisuallyHidden`     | Text for screen readers only                                    |
| `Prose`, `NotProse`  | Styling long-form HTML or MDX; `NotProse` opts a part out       |

## Icons

From [Spec 07](specs/07-icon.md).

| Component | Use it for                                                  |
| --------- | ----------------------------------------------------------- |
| `Icon`    | Any SVG icon component, such as one from `lucide-react`     |

## Display

From [Spec 08](specs/08-bento.md).

| Component | Use it for                                        |
| --------- | ------------------------------------------------- |
| `Card`    | A surface for grouping content; `interactive` for a whole-card link |
| `Stat`    | A labeled number                                  |
| `Badge`   | A small, non-interactive status label             |

## Forms and actions

From [Spec 09](specs/09-forms.md).

| Component                     | Use it for                                                |
| ----------------------------- | --------------------------------------------------------- |
| `Field`                       | Connecting a label, hint, and error to one control        |
| `Input`, `Textarea`           | Text entry                                                |
| `Select`                      | A single choice from a dropdown                           |
| `Checkbox`                    | An on/off choice that's submitted with a form             |
| `RadioGroup`, `Radio`         | One choice from a short, visible list                     |
| `Switch`                      | A setting that takes effect immediately                   |
| `ToggleChip`, `ToggleChipGroup` | Selectable pills, such as topic filters                 |
| `Button`                      | Actions                                                   |
| `IconButton`                  | A button with only an icon; needs `aria-label`            |
| `ColorModeToggle`             | An `IconButton` that switches between light and dark      |

## Navigation

From [Spec 10](specs/10-navigation.md).

| Component                             | Use it for                                            |
| ------------------------------------- | ----------------------------------------------------- |
| `NavBar`, `NavBarLink`                | The site's main navigation bar, with a menu below `md` |
| `Tabs`, `TabsList`, `Tab`, `TabsPanel` | Switching between panels on the same page            |

## Overlays

From [Spec 12](specs/12-overlays.md).

| Component  | Use it for                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| `Dialog`   | A modal task that needs full attention, including a confirmation (`alert`)                    |
| `Popover`  | A small panel beside its trigger, with the page still usable                                  |
| `Tooltip`  | A short, visual-only hint on hover or focus; `TooltipProvider` shares the delay               |
| `Menu`     | A list of actions, with submenus and checkbox or radio items                                  |
| `Toast`    | A brief message: mount `ToastProvider` once, then call `useToast()` or `createToastManager()` |

## Data

From [Spec 13](specs/13-data.md).

| Component    | Use it for                                                                        |
| ------------ | --------------------------------------------------------------------------------- |
| `Table`      | Styled semantic table parts, which work in server components                      |
| `DataTable`  | A table that manages sorting, pagination, selection, and loading and empty states |
| `Pagination` | Page links (`getHref`, server-friendly) or buttons (`onPageChange`)               |
| `Skeleton`   | A placeholder for content that's loading                                          |
| `EmptyState` | What to show when a list or table has nothing in it                               |

## Theming

From [Spec 02](specs/02-tokens-and-themes.md) and [Spec 03](specs/03-theme-provider.md). See [Theming](../README.md#theming) in the README.

| Export                                   | Use it for                                          |
| ---------------------------------------- | --------------------------------------------------- |
| `ThemeProvider`, `useColorMode`          | Applying a theme and reading or setting color mode  |
| `ColorModeScript`, `getColorModeScript`  | Avoiding a flash of the wrong mode                  |
| `defineTheme`, `defineFullTheme`, `themeToCss` | Token overrides and full themes               |
| `vars`, `tokens`, `breakpoints`, `softLight`, `softDark` | The theme contract and the Soft theme values |
