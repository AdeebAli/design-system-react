/** A value, or values per breakpoint. Each key applies from that breakpoint up. */
export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

/** The spacing scale. */
export type SpaceToken =
  | '0'
  | 'px'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24';
/** Spacing tokens, plus `auto`. */
export type MarginValue = SpaceToken | 'auto';
/** Container widths. */
export type ContainerToken =
  'container.sm' | 'container.md' | 'container.lg' | 'container.xl';
/** Values for `width` and `minWidth`. */
export type WidthValue =
  | SpaceToken
  | ContainerToken
  | 'auto'
  | 'full'
  | 'fit'
  | 'min'
  | 'max'
  | '1/2'
  | '1/3'
  | '2/3'
  | '1/4'
  | '3/4';
/** Values for `height` and `minHeight`. */
export type HeightValue = WidthValue | 'screen';
/** Values for `maxWidth`. */
export type MaxWidthValue = ContainerToken | 'none' | 'full' | 'fit' | 'prose';
/** Values for `maxHeight`. */
export type MaxHeightValue = 'none' | 'full' | 'fit' | 'screen';
/** Values for `flexGrow` and `flexShrink`. */
export type FlexFactor = '0' | '1';
/** Values for `alignSelf` and `justifySelf`. */
export type SelfAlignValue = 'auto' | 'start' | 'center' | 'end' | 'stretch';
/** A grid count: a positive whole number, as a number or a string (`16`, `'16'`). */
export type GridCount = number | `${number}`;
/** A grid span: a count (`14`), `'span-14'`, or `'full'`. */
export type GridSpanValue = number | `span-${number}` | 'full';
/** Values for `display`. */
export type DisplayValue =
  | 'none'
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid';
/** Values for `flexDirection`. */
export type FlexDirectionValue =
  'row' | 'column' | 'row-reverse' | 'column-reverse';
/** Values for `flexWrap`. */
export type FlexWrapValue = 'nowrap' | 'wrap';
/** Values for `alignItems`. */
export type AlignItemsValue =
  'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** Values for `justifyContent`. */
export type JustifyContentValue = 'start' | 'center' | 'end' | 'between';
/** Values for `position`. */
export type PositionValue =
  'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
/** Values for the inset props. */
export type InsetValue = SpaceToken | 'auto' | 'full';
/** Values for the overflow props. */
export type OverflowValue = 'visible' | 'hidden' | 'auto' | 'scroll';
/** `color.bg` tokens, plus `transparent`. */
export type BackgroundToken =
  | 'transparent'
  | 'canvas'
  | 'surface'
  | 'raised'
  | 'sunken'
  | 'muted'
  | 'mutedHover'
  | 'accent'
  | 'accentHover'
  | 'accentSubtle'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'successSubtle'
  | 'warningSubtle'
  | 'dangerSubtle'
  | 'infoSubtle'
  | 'dangerHover'
  | 'inverse'
  | 'disabled';
/** `color.fg` tokens, plus `inherit`. */
export type ColorToken =
  | 'inherit'
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'onAccent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'onStatus'
  | 'inverse'
  | 'disabled';
/** `color.border` tokens. */
export type BorderColorToken =
  'subtle' | 'control' | 'surface' | 'danger' | 'disabled';
/** Values for `borderWidth`. */
export type BorderWidthValue = 'none' | 'thin' | 'thick';
/** `radius` tokens. */
export type RadiusToken =
  'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'card' | 'control' | 'image';
/** `shadow` tokens. */
export type ShadowToken =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'card'
  | 'cardHover'
  | 'raised'
  | 'dialog';
/** `zIndex` tokens. */
export type ZIndexToken =
  | 'base'
  | 'sticky'
  | 'dropdown'
  | 'overlay'
  | 'modal'
  | 'popover'
  | 'toast'
  | 'tooltip';

/** Layout props, which every component accepts. */
export interface LayoutProps {
  /**
   * Margin on all sides. `space` tokens (`'4'` is 16px, `'px'` is 1px), or
   * `'auto'`. Responsive.
   */
  margin?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin on the inline axis. `space` tokens (`'4'` is 16px, `'px'` is 1px), or
   * `'auto'`. Responsive.
   */
  marginX?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin on the block axis. `space` tokens (`'4'` is 16px, `'px'` is 1px), or
   * `'auto'`. Responsive.
   */
  marginY?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin above. `space` tokens (`'4'` is 16px, `'px'` is 1px), or `'auto'`.
   * Responsive.
   */
  marginTop?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin below. `space` tokens (`'4'` is 16px, `'px'` is 1px), or `'auto'`.
   * Responsive.
   */
  marginBottom?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin at the inline start. `space` tokens (`'4'` is 16px, `'px'` is 1px),
   * or `'auto'`. Responsive.
   */
  marginStart?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Margin at the inline end. `space` tokens (`'4'` is 16px, `'px'` is 1px), or
   * `'auto'`. Responsive.
   */
  marginEnd?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
  >;
  /**
   * Width. `space` tokens (`'4'` is 16px), `container` tokens
   * (`'container.md'`), `'full'` (100%), `'fit'`, `'min'`, `'max'`, `'auto'`, or
   * a fraction (`'1/2'` is 50%). Responsive.
   */
  width?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'container.sm'
    | 'container.md'
    | 'container.lg'
    | 'container.xl'
    | 'auto'
    | 'full'
    | 'fit'
    | 'min'
    | 'max'
    | '1/2'
    | '1/3'
    | '2/3'
    | '1/4'
    | '3/4'
  >;
  /**
   * Minimum width. `space` tokens (`'4'` is 16px), `container` tokens
   * (`'container.md'`), `'full'` (100%), `'fit'`, `'min'`, `'max'`, `'auto'`, or
   * a fraction (`'1/2'` is 50%). Responsive.
   */
  minWidth?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'container.sm'
    | 'container.md'
    | 'container.lg'
    | 'container.xl'
    | 'auto'
    | 'full'
    | 'fit'
    | 'min'
    | 'max'
    | '1/2'
    | '1/3'
    | '2/3'
    | '1/4'
    | '3/4'
  >;
  /**
   * Height. `space` tokens (`'4'` is 16px), `container` tokens
   * (`'container.md'`), `'full'` (100%), `'fit'`, `'min'`, `'max'`, `'auto'`,
   * `'screen'` (100dvh), or a fraction (`'1/2'` is 50%). Responsive.
   */
  height?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'container.sm'
    | 'container.md'
    | 'container.lg'
    | 'container.xl'
    | 'auto'
    | 'full'
    | 'fit'
    | 'min'
    | 'max'
    | '1/2'
    | '1/3'
    | '2/3'
    | '1/4'
    | '3/4'
    | 'screen'
  >;
  /**
   * Minimum height. `space` tokens (`'4'` is 16px), `container` tokens
   * (`'container.md'`), `'full'` (100%), `'fit'`, `'min'`, `'max'`, `'auto'`,
   * `'screen'` (100dvh), or a fraction (`'1/2'` is 50%). Responsive.
   */
  minHeight?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'container.sm'
    | 'container.md'
    | 'container.lg'
    | 'container.xl'
    | 'auto'
    | 'full'
    | 'fit'
    | 'min'
    | 'max'
    | '1/2'
    | '1/3'
    | '2/3'
    | '1/4'
    | '3/4'
    | 'screen'
  >;
  /**
   * Maximum width. One of `'container.sm'`, `'container.md'`, `'container.lg'`,
   * `'container.xl'`, `'none'`, `'full'`, `'fit'`, or `'prose'`. Responsive.
   */
  maxWidth?: Responsive<
    | 'container.sm'
    | 'container.md'
    | 'container.lg'
    | 'container.xl'
    | 'none'
    | 'full'
    | 'fit'
    | 'prose'
  >;
  /**
   * Maximum height. One of `'none'`, `'full'`, `'fit'`, or `'screen'`.
   * Responsive.
   */
  maxHeight?: Responsive<'none' | 'full' | 'fit' | 'screen'>;
  /** Whether it grows in a flex layout. One of `'0'` or `'1'`. Responsive. */
  flexGrow?: Responsive<'0' | '1'>;
  /** Whether it shrinks in a flex layout. One of `'0'` or `'1'`. Responsive. */
  flexShrink?: Responsive<'0' | '1'>;
  /**
   * Its alignment on the parent's cross axis. One of `'auto'`, `'start'`,
   * `'center'`, `'end'`, or `'stretch'`. Responsive.
   */
  alignSelf?: Responsive<'auto' | 'start' | 'center' | 'end' | 'stretch'>;
  /**
   * Its alignment on the parent's inline axis, in a grid. One of `'auto'`,
   * `'start'`, `'center'`, `'end'`, or `'stretch'`. Responsive.
   */
  justifySelf?: Responsive<'auto' | 'start' | 'center' | 'end' | 'stretch'>;
  /**
   * How many grid columns it spans: any positive whole number, as a number or
   * `'span-14'`, or `'full'` for every column. Responsive.
   */
  gridColumn?: Responsive<number | `span-${number}` | 'full'>;
  /**
   * How many grid rows it spans: any positive whole number, as a number or
   * `'span-3'`, or `'full'` for every row. Responsive.
   */
  gridRow?: Responsive<number | `span-${number}` | 'full'>;
}

/** Style props only `Box` accepts. Other components use variants and the theme. */
export interface BoxOnlyProps {
  /**
   * Padding on all sides. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  padding?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the inline axis. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  paddingX?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding on the block axis. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  paddingY?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding above. `space` tokens (`'4'` is 16px, `'px'` is 1px). Responsive.
   */
  paddingTop?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding below. `space` tokens (`'4'` is 16px, `'px'` is 1px). Responsive.
   */
  paddingBottom?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding at the inline start. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  paddingStart?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Padding at the inline end. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  paddingEnd?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Gap between children. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  gap?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Gap between rows. `space` tokens (`'4'` is 16px, `'px'` is 1px). Responsive.
   */
  rowGap?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * Gap between columns. `space` tokens (`'4'` is 16px, `'px'` is 1px).
   * Responsive.
   */
  columnGap?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
  >;
  /**
   * CSS display. One of `'none'`, `'block'`, `'inline'`, `'inline-block'`,
   * `'flex'`, `'inline-flex'`, `'grid'`, or `'inline-grid'`. Responsive.
   */
  display?: Responsive<
    | 'none'
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
  >;
  /**
   * The flex main axis. One of `'row'`, `'column'`, `'row-reverse'`, or
   * `'column-reverse'`. Responsive.
   */
  flexDirection?: Responsive<
    'row' | 'column' | 'row-reverse' | 'column-reverse'
  >;
  /** Whether flex children wrap. One of `'nowrap'` or `'wrap'`. Responsive. */
  flexWrap?: Responsive<'nowrap' | 'wrap'>;
  /**
   * Children's alignment on the cross axis. One of `'start'`, `'center'`,
   * `'end'`, `'stretch'`, or `'baseline'`. Responsive.
   */
  alignItems?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /**
   * Children's alignment on the main axis. One of `'start'`, `'center'`,
   * `'end'`, or `'between'`. Responsive.
   */
  justifyContent?: Responsive<'start' | 'center' | 'end' | 'between'>;
  /**
   * Equal grid columns, so long content can't stretch one: any positive whole
   * number, as a number or a string (`16`, `'16'`). Responsive.
   */
  gridTemplateColumns?: Responsive<number | `${number}`>;
  /**
   * CSS position. One of `'static'`, `'relative'`, `'absolute'`, `'fixed'`, or
   * `'sticky'`. Responsive.
   */
  position?: Responsive<
    'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  >;
  /**
   * Offset from the top. `space` tokens (`'4'` is 16px), `'auto'`, or `'full'`
   * (100%). Responsive.
   */
  insetTop?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
    | 'full'
  >;
  /**
   * Offset from the bottom. `space` tokens (`'4'` is 16px), `'auto'`, or
   * `'full'` (100%). Responsive.
   */
  insetBottom?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
    | 'full'
  >;
  /**
   * Offset from the inline start. `space` tokens (`'4'` is 16px), `'auto'`, or
   * `'full'` (100%). Responsive.
   */
  insetStart?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
    | 'full'
  >;
  /**
   * Offset from the inline end. `space` tokens (`'4'` is 16px), `'auto'`, or
   * `'full'` (100%). Responsive.
   */
  insetEnd?: Responsive<
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '8'
    | '10'
    | '12'
    | '16'
    | '20'
    | '24'
    | 'auto'
    | 'full'
  >;
  /**
   * Overflow on both axes. One of `'visible'`, `'hidden'`, `'auto'`, or
   * `'scroll'`. Responsive.
   */
  overflow?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  /**
   * Overflow on the x axis. One of `'visible'`, `'hidden'`, `'auto'`, or
   * `'scroll'`. Responsive.
   */
  overflowX?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  /**
   * Overflow on the y axis. One of `'visible'`, `'hidden'`, `'auto'`, or
   * `'scroll'`. Responsive.
   */
  overflowY?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  /**
   * Background color. Not responsive. `color.bg` tokens, such as `'surface'`,
   * `'raised'`, and `'accent'`, or `'transparent'`.
   */
  background?:
    | 'transparent'
    | 'canvas'
    | 'surface'
    | 'raised'
    | 'sunken'
    | 'muted'
    | 'mutedHover'
    | 'accent'
    | 'accentHover'
    | 'accentSubtle'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'successSubtle'
    | 'warningSubtle'
    | 'dangerSubtle'
    | 'infoSubtle'
    | 'dangerHover'
    | 'inverse'
    | 'disabled';
  /**
   * Text color. Not responsive. `color.fg` tokens, such as `'default'`,
   * `'muted'`, and `'accent'`, or `'inherit'`.
   */
  color?:
    | 'inherit'
    | 'default'
    | 'muted'
    | 'subtle'
    | 'accent'
    | 'onAccent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'onStatus'
    | 'inverse'
    | 'disabled';
  /**
   * Border color. Not responsive. One of `'subtle'`, `'control'`, `'surface'`,
   * `'danger'`, or `'disabled'`.
   */
  borderColor?: 'subtle' | 'control' | 'surface' | 'danger' | 'disabled';
  /**
   * Border width. Also sets the border style. Not responsive. One of `'none'`,
   * `'thin'`, or `'thick'`.
   */
  borderWidth?: 'none' | 'thin' | 'thick';
  /**
   * Corner radius. Not responsive. `radius` tokens, from `'none'` to `'full'`,
   * plus `'card'`, `'control'`, and `'image'`.
   */
  borderRadius?:
    'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'card' | 'control' | 'image';
  /**
   * Shadow. Not responsive. `shadow` tokens, from `'none'` to `'xl'`, plus
   * `'card'`, `'cardHover'`, `'raised'`, and `'dialog'`.
   */
  boxShadow?:
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'card'
    | 'cardHover'
    | 'raised'
    | 'dialog';
  /**
   * Stacking layer. Not responsive. One of `'base'`, `'sticky'`, `'dropdown'`,
   * `'overlay'`, `'modal'`, `'popover'`, `'toast'`, or `'tooltip'`.
   */
  zIndex?:
    | 'base'
    | 'sticky'
    | 'dropdown'
    | 'overlay'
    | 'modal'
    | 'popover'
    | 'toast'
    | 'tooltip';
}

/** Every style prop `Box` accepts. */
export type BoxStyleProps = LayoutProps & BoxOnlyProps;
