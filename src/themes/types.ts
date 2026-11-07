/** A complete theme: a value for every token in the contract (Spec 02). */
export interface ThemeTokens {
  color: {
    bg: Record<
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
      | 'disabled',
      string
    >;
    fg: Record<
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
      | 'disabled',
      string
    >;
    border: Record<
      'subtle' | 'control' | 'surface' | 'danger' | 'disabled',
      string
    >;
    focus: string;
    overlay: string;
  };
  font: {
    family: Record<'sans' | 'mono' | 'prose', string>;
    features: { sans: string };
    size: Record<
      'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl',
      string
    >;
    weight: Record<'regular' | 'medium' | 'semibold' | 'bold', string>;
    lineHeight: Record<'tight' | 'snug' | 'normal' | 'relaxed', string>;
    letterSpacing: Record<'tighter' | 'tight' | 'normal' | 'wide', string>;
  };
  space: Record<
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
    | '24',
    string
  >;
  size: {
    control: Record<'sm' | 'md' | 'lg', string>;
    icon: Record<'sm' | 'md' | 'lg', string>;
    container: Record<'sm' | 'md' | 'lg' | 'xl', string>;
    prose: string;
    dialog: Record<'sm' | 'md' | 'lg', string>;
    sidebar: string;
    sidebarRail: string;
    drawer: Record<'sm' | 'md' | 'lg', string>;
    avatar: Record<'sm' | 'md' | 'lg' | 'xl', string>;
  };
  radius: Record<
    'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'card' | 'control',
    string
  >;
  borderWidth: Record<'thin' | 'thick', string>;
  shadow: Record<
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'card'
    | 'cardHover'
    | 'raised'
    | 'dialog',
    string
  >;
  motion: {
    duration: Record<'fast' | 'base' | 'slow', string>;
    easing: Record<'standard' | 'enter' | 'exit', string>;
  };
  zIndex: Record<
    | 'base'
    | 'sticky'
    | 'dropdown'
    | 'overlay'
    | 'modal'
    | 'popover'
    | 'toast'
    | 'tooltip',
    string
  >;
}
