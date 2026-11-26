import { style, type StyleRule } from '@vanilla-extract/css';
import { utilitiesLayer } from '../../styles/layers.css';
import { breakpoints } from '../../tokens/breakpoints';

// Grid counts can't come from sprinkles, because a finite list of classes
// can't cover every count (ADR 0005). Each prop gets one class per
// breakpoint, which reads a variable that the element sets inline.
const names = ['base', 'sm', 'md', 'lg', 'xl'] as const;
type Name = (typeof names)[number];

const props = {
  gridTemplateColumns: 'columns',
  gridColumn: 'column',
  gridRow: 'row',
} as const;
type CountProp = keyof typeof props;
type SpanProp = 'gridColumn' | 'gridRow';

const variable = (prop: CountProp, name: Name) =>
  `--ds-grid-${props[prop]}-${name}` as const;

// In ds.utilities, where Box's other style props are, so a prop beats a
// component's own style and a project's unlayered CSS beats the prop.
function atBreakpoint(name: Name, rule: StyleRule): StyleRule {
  const media =
    name === 'base'
      ? rule
      : {
          '@media': { [`screen and (min-width: ${breakpoints[name]})`]: rule },
        };
  return { '@layer': { [utilitiesLayer]: media } };
}

function count(prop: CountProp, name: Name): string {
  const value = `var(${variable(prop, name)})`;
  return style(
    atBreakpoint(
      name,
      prop === 'gridTemplateColumns'
        ? { gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))` }
        : { [prop]: `span ${value} / span ${value}` },
    ),
  );
}

const countClass = {} as Record<CountProp, Record<Name, string>>;
const fullClass = {} as Record<SpanProp, Record<Name, string>>;
for (const prop of Object.keys(props) as CountProp[]) {
  countClass[prop] = {} as Record<Name, string>;
  if (prop !== 'gridTemplateColumns')
    fullClass[prop] = {} as Record<Name, string>;
}
// Breakpoint by breakpoint, so a larger one wins, whichever kind it is.
for (const name of names) {
  for (const prop of Object.keys(props) as CountProp[]) {
    countClass[prop][name] = count(prop, name);
    if (prop !== 'gridTemplateColumns') {
      fullClass[prop][name] = style(atBreakpoint(name, { [prop]: '1 / -1' }));
    }
  }
}

/** The class that reads the variable, by prop and breakpoint. */
export const gridCountClass: Record<
  CountProp,
  Record<Name, string>
> = countClass;
/** The class for `'full'`, by prop and breakpoint. It reads no variable. */
export const gridFullClass: Record<SpanProp, Record<Name, string>> = fullClass;
/** The variable each class reads. Fixed names, so docs and projects can use them. */
export const gridCountVar = {} as Record<
  CountProp,
  Record<Name, `--ds-grid-${string}`>
>;
for (const prop of Object.keys(props) as CountProp[]) {
  gridCountVar[prop] = {} as Record<Name, `--ds-grid-${string}`>;
  for (const name of names) gridCountVar[prop][name] = variable(prop, name);
}
