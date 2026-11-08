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
/** Grid column counts. */
export type GridCount =
  '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
/** Values for `gridColumn` and `gridRow`. */
export type GridSpanValue = `span-${GridCount}` | 'full';
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
  'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'card' | 'control';
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
  /** Margin on all sides. */
  margin?: Responsive<MarginValue>;
  /** Margin on the inline axis. */
  marginX?: Responsive<MarginValue>;
  /** Margin on the block axis. */
  marginY?: Responsive<MarginValue>;
  /** Margin above. */
  marginTop?: Responsive<MarginValue>;
  /** Margin below. */
  marginBottom?: Responsive<MarginValue>;
  /** Margin at the inline start. */
  marginStart?: Responsive<MarginValue>;
  /** Margin at the inline end. */
  marginEnd?: Responsive<MarginValue>;
  /** Width. */
  width?: Responsive<WidthValue>;
  /** Minimum width. */
  minWidth?: Responsive<WidthValue>;
  /** Height. */
  height?: Responsive<HeightValue>;
  /** Minimum height. */
  minHeight?: Responsive<HeightValue>;
  /** Maximum width. */
  maxWidth?: Responsive<MaxWidthValue>;
  /** Maximum height. */
  maxHeight?: Responsive<MaxHeightValue>;
  /** Whether it grows in a flex layout. */
  flexGrow?: Responsive<FlexFactor>;
  /** Whether it shrinks in a flex layout. */
  flexShrink?: Responsive<FlexFactor>;
  /** Its alignment on the parent's cross axis. */
  alignSelf?: Responsive<SelfAlignValue>;
  /** Its alignment on the parent's inline axis, in a grid. */
  justifySelf?: Responsive<SelfAlignValue>;
  /** How many grid columns it spans. */
  gridColumn?: Responsive<GridSpanValue>;
  /** How many grid rows it spans. */
  gridRow?: Responsive<GridSpanValue>;
}

/** Style props only `Box` accepts. Other components use variants and the theme. */
export interface BoxOnlyProps {
  /** Padding on all sides. */
  padding?: Responsive<SpaceToken>;
  /** Padding on the inline axis. */
  paddingX?: Responsive<SpaceToken>;
  /** Padding on the block axis. */
  paddingY?: Responsive<SpaceToken>;
  /** Padding above. */
  paddingTop?: Responsive<SpaceToken>;
  /** Padding below. */
  paddingBottom?: Responsive<SpaceToken>;
  /** Padding at the inline start. */
  paddingStart?: Responsive<SpaceToken>;
  /** Padding at the inline end. */
  paddingEnd?: Responsive<SpaceToken>;
  /** Gap between children. */
  gap?: Responsive<SpaceToken>;
  /** Gap between rows. */
  rowGap?: Responsive<SpaceToken>;
  /** Gap between columns. */
  columnGap?: Responsive<SpaceToken>;
  /** CSS display. */
  display?: Responsive<DisplayValue>;
  /** The flex main axis. */
  flexDirection?: Responsive<FlexDirectionValue>;
  /** Whether flex children wrap. */
  flexWrap?: Responsive<FlexWrapValue>;
  /** Children's alignment on the cross axis. */
  alignItems?: Responsive<AlignItemsValue>;
  /** Children's alignment on the main axis. */
  justifyContent?: Responsive<JustifyContentValue>;
  /** Equal grid columns, so long content can't stretch one. */
  gridTemplateColumns?: Responsive<GridCount>;
  /** CSS position. */
  position?: Responsive<PositionValue>;
  /** Offset from the top. */
  insetTop?: Responsive<InsetValue>;
  /** Offset from the bottom. */
  insetBottom?: Responsive<InsetValue>;
  /** Offset from the inline start. */
  insetStart?: Responsive<InsetValue>;
  /** Offset from the inline end. */
  insetEnd?: Responsive<InsetValue>;
  /** Overflow on both axes. */
  overflow?: Responsive<OverflowValue>;
  /** Overflow on the x axis. */
  overflowX?: Responsive<OverflowValue>;
  /** Overflow on the y axis. */
  overflowY?: Responsive<OverflowValue>;
  /** Background color. Not responsive. */
  background?: BackgroundToken;
  /** Text color. Not responsive. */
  color?: ColorToken;
  /** Border color. Not responsive. */
  borderColor?: BorderColorToken;
  /** Border width. Also sets the border style. Not responsive. */
  borderWidth?: BorderWidthValue;
  /** Corner radius. Not responsive. */
  borderRadius?: RadiusToken;
  /** Shadow. Not responsive. */
  boxShadow?: ShadowToken;
  /** Stacking layer. Not responsive. */
  zIndex?: ZIndexToken;
}

/** Every style prop `Box` accepts. */
export type BoxStyleProps = LayoutProps & BoxOnlyProps;
