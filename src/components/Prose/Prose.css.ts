import { globalStyle, style, type GlobalStyleRule } from '@vanilla-extract/css';
import { componentsLayer } from '../../styles/layers.css';
import { vars } from '../../themes/contract.css';
import { layered } from '../../utils/recipe';
import { stickyClearance } from '../../styles/sticky';

const { font, color, space, radius, borderWidth } = vars;

/** Marks an area that `Prose` leaves alone, and resets what it inherits. */
export const notProse = style(
  layered({
    fontFamily: font.family.sans,
    fontFeatureSettings: font.features.sans,
    fontSize: font.size.md,
    lineHeight: font.lineHeight.normal,
    fontWeight: font.weight.regular,
    fontStyle: 'normal',
    letterSpacing: 'normal',
    color: color.fg.default,
    textWrap: 'wrap',
    overflowWrap: 'normal',
  }),
);

/**
 * The root sets the font, so `ch` in `maxWidth="prose"` measures the serif at
 * the reading size.
 */
export const prose = style(
  layered({
    fontFamily: font.family.prose,
    fontFeatureSettings: 'normal',
    lineHeight: font.lineHeight.relaxed,
    color: color.fg.default,
    overflowWrap: 'break-word',
  }),
);

export const proseSize = {
  sm: style(layered({ fontSize: font.size.lg })),
  md: style(layered({ fontSize: font.size.xl })),
};

/**
 * Builds a descendant rule with the specificity of the bare element, which
 * skips anything inside `NotProse`. Every descendant rule goes through this, so
 * the exclusion can't be forgotten.
 */
function scoped(root: string, selectors: string) {
  const outside = `:not(:where(${notProse}, ${notProse} *))`;
  return selectors
    .split(',')
    .map((selector) => {
      // A pseudo-element must come last, so the exclusion goes before it.
      const [element, pseudo] = selector.trim().split('::');
      return `:where(${root}) ${element}${outside}${pseudo ? `::${pseudo}` : ''}`;
    })
    .join(', ');
}

/** A rule in the components layer, so any component class or unlayered CSS beats it. */
function rule(selectors: string, styles: GlobalStyleRule, root = prose) {
  globalStyle(scoped(root, selectors), {
    '@layer': { [componentsLayer]: styles },
  });
}

/** A rule on the root's direct children, which includes `NotProse` itself. */
function childRule(selectors: string, styles: GlobalStyleRule) {
  globalStyle(
    selectors
      .split(',')
      .map((selector) => `:where(${prose}) > ${selector.trim()}`)
      .join(', '),
    { '@layer': { [componentsLayer]: styles } },
  );
}

// Blocks have vertical margins, which collapse between neighbors.
const blockGap = '1.25em';
rule('p, ul, ol, dl, blockquote, pre, figure, table, hr, [data-ds-table]', {
  marginBlock: blockGap,
});
childRule(`${notProse}`, { marginBlock: blockGap });
// Prose lines up with whatever surrounds it.
childRule(':first-child', { marginBlockStart: 0 });
childRule(':last-child', { marginBlockEnd: 0 });

rule('p', { textWrap: 'pretty' });

rule('h1, h2, h3, h4, h5, h6', {
  fontFamily: font.family.sans,
  fontFeatureSettings: font.features.sans,
  fontWeight: font.weight.semibold,
  textWrap: 'balance',
  color: color.fg.default,
  // More space above than below, so a heading belongs to what follows it.
  marginBlockStart: '1.6em',
  marginBlockEnd: '0.6em',
  // Anchor links land clear of a sticky NavBar at its default size. A project
  // with a taller header sets --ds-prose-scroll-margin.
  scrollMarginBlockStart: `var(--ds-prose-scroll-margin, calc(${stickyClearance} + ${space['4']}))`,
});

type FontSize = keyof typeof font.size;
type LineHeight = keyof typeof font.lineHeight;
type LetterSpacing = keyof typeof font.letterSpacing;

// Spec 06's line height and letter spacing for each size.
const scale: Partial<Record<FontSize, [LineHeight, LetterSpacing]>> = {
  lg: ['normal', 'normal'],
  xl: ['normal', 'normal'],
  '2xl': ['snug', 'tight'],
  '3xl': ['tight', 'tighter'],
  '4xl': ['tight', 'tighter'],
};

function heading(size: FontSize): GlobalStyleRule {
  const [lineHeight, letterSpacing] = scale[size]!;
  return {
    fontSize: font.size[size],
    lineHeight: font.lineHeight[lineHeight],
    letterSpacing: font.letterSpacing[letterSpacing],
  };
}

// No heading is smaller than the body text.
const headingSizes: Record<
  'sm' | 'md',
  [FontSize, FontSize, FontSize, FontSize]
> = {
  md: ['4xl', '3xl', '2xl', 'xl'],
  sm: ['3xl', '2xl', 'xl', 'lg'],
};
for (const size of ['sm', 'md'] as const) {
  const [h1, h2, h3, rest] = headingSizes[size];
  const root = proseSize[size];
  rule('h1', heading(h1), root);
  rule('h2', heading(h2), root);
  rule('h3', heading(h3), root);
  rule('h4, h5, h6', heading(rest), root);
}

// Matches Link.
rule('a', {
  color: color.fg.accent,
  textDecorationLine: 'underline',
});
rule('a:focus-visible', {
  outline: `${borderWidth.thick} solid ${color.focus}`,
  outlineOffset: space['0.5'],
});

rule('strong, b', { fontWeight: font.weight.semibold });
rule('em, i', { fontStyle: 'italic' });

rule('ul', { listStyleType: 'disc', paddingInlineStart: '1.5em' });
rule('ol', { listStyleType: 'decimal', paddingInlineStart: '1.5em' });
rule('ul ul, ol ul', { listStyleType: 'circle' });
rule('li::marker', { color: color.fg.muted });
rule('li + li', { marginBlockStart: '0.25em' });
rule('li > ul, li > ol', { marginBlock: '0.25em' });

rule('blockquote', {
  marginInline: 0,
  paddingInlineStart: '1em',
  borderInlineStart: `${borderWidth.thick} solid ${color.bg.accent}`,
  fontStyle: 'italic',
  color: color.fg.muted,
});

// Match Code and Kbd.
rule('code, kbd', {
  fontFamily: font.family.mono,
  fontFeatureSettings: 'normal',
  paddingInline: space['1'],
  color: color.fg.default,
  borderRadius: radius.sm,
});
rule('code', {
  fontSize: `max(${font.size.xs}, 0.88em)`,
  background: color.bg.sunken,
});
rule('kbd', {
  fontSize: `max(${font.size.xs}, 0.8em)`,
  background: color.bg.surface,
  borderStyle: 'solid',
  borderColor: color.border.control,
  borderWidth: borderWidth.thin,
  borderBlockEndWidth: borderWidth.thick,
});
rule('pre code', {
  fontSize: 'inherit',
  paddingInline: 0,
  background: 'transparent',
  borderRadius: 0,
});

rule('pre', {
  fontFamily: font.family.mono,
  fontFeatureSettings: 'normal',
  fontSize: font.size.sm,
  lineHeight: font.lineHeight.normal,
  color: color.fg.default,
  background: color.bg.sunken,
  borderRadius: radius.md,
  padding: space['4'],
  border: `${borderWidth.thin} solid ${color.border.subtle}`,
  overflowX: 'auto',
  overflowWrap: 'normal',
});

rule('img, video, iframe', { maxWidth: '100%' });
rule('img, video', { height: 'auto' });
rule('img', { borderRadius: radius.md });

rule('figure', { marginInline: 0 });
rule('figcaption', {
  fontFamily: font.family.sans,
  fontFeatureSettings: font.features.sans,
  fontSize: font.size.sm,
  lineHeight: font.lineHeight.normal,
  color: color.fg.muted,
  marginBlockStart: '0.75em',
});

rule('table', {
  fontFamily: font.family.sans,
  fontFeatureSettings: font.features.sans,
  fontSize: font.size.sm,
  lineHeight: font.lineHeight.normal,
  fontVariantNumeric: 'tabular-nums',
  width: '100%',
  borderCollapse: 'collapse',
});
rule('th, td', {
  textAlign: 'start',
  paddingBlock: '0.5em',
  paddingInline: '0.75em',
  borderBlockEnd: `${borderWidth.thin} solid ${color.border.subtle}`,
  overflowWrap: 'anywhere',
});
rule('th', {
  fontSize: font.size.xs,
  fontWeight: font.weight.medium,
  textTransform: 'uppercase',
  letterSpacing: font.letterSpacing.wide,
  color: color.fg.muted,
});

rule('hr', {
  border: 'none',
  borderBlockStart: `${borderWidth.thin} solid ${color.border.subtle}`,
  marginBlock: '2.5em',
});

rule('dt', { fontWeight: font.weight.semibold });
rule('dd', { marginInlineStart: 0, paddingInlineStart: '1.5em' });

rule('sub, sup', { lineHeight: 0 });
