// Copies the bundled fonts into dist/fonts, and puts the layer order and font
// faces first in dist/styles.css (Spec 02).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LAYERS = '@layer ds.theme,ds.reset,ds.base,ds.components,ds.utilities;';
const SUBSETS = ['latin', 'latin-ext'];

const inter = 'inter-ui';
const serif = '@fontsource-variable/source-serif-4';
const mono = '@fontsource/ibm-plex-mono';

// Inter comes from inter-ui, because Fontsource's files drop the cv05 and cv08
// features that make I, l, and 1 distinct (Spec 02). Its Latin subset holds the
// common characters, and the full file covers the rest of latin-ext, so most
// pages only load the subset. These ranges are the exact characters each file
// holds within Fontsource's latin and latin-ext ranges, read from inter-ui
// 4.1.1 with fontTools. Recompute them if inter-ui's version changes.
const INTER_LATIN =
  'U+0000,U+0020-007E,U+00A0-00AC,U+00AE-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-200B,U+2010-2027,U+202F-2055,U+2057,U+205F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+FEFF';
const INTER_EXTENDED =
  'U+0100-0130,U+0132-0148,U+014A-0151,U+0154-01C3,U+01C5-0254,U+0256-027B,U+027E-0284,U+0286-0290,U+0292-02A4,U+02A6-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+1D00,U+1D0D,U+1D1B,U+1D43,U+1D47-1D49,U+1D4D,U+1D4F-1D50,U+1D52,U+1D56-1D58,U+1D5B,U+1D62-1D65,U+1D9C,U+1DA0,U+1DBB,U+1DBF,U+1E00-1E9B,U+1E9D-1E9F,U+1EF2-1EFF,U+20A0-20AB,U+20AD-20AF,U+20B1-20B5,U+20B8-20BA,U+20BC-20C0,U+2113,U+2C7C,U+2C7F,U+A7FF';

const interFaces = [
  [
    'normal',
    'variable-latin/InterVariable-subset.woff2',
    'variable/InterVariable.woff2',
  ],
  [
    'italic',
    'variable-latin/InterVariable-Italic-subset.woff2',
    'variable/InterVariable-Italic.woff2',
  ],
].flatMap(([style, latin, extended]) => [
  {
    style,
    source: latin,
    file: `inter-latin-opsz-${style}.woff2`,
    range: INTER_LATIN,
  },
  {
    style,
    source: extended,
    file: `inter-extended-opsz-${style}.woff2`,
    range: INTER_EXTENDED,
  },
]);

const faces = [
  {
    family: 'Source Serif 4',
    pkg: serif,
    prefix: 'source-serif-4',
    css: 'opsz.css',
    variant: 'opsz-normal',
    style: 'normal',
    weight: '200 900',
  },
  {
    family: 'Source Serif 4',
    pkg: serif,
    prefix: 'source-serif-4',
    css: 'opsz-italic.css',
    variant: 'opsz-italic',
    style: 'italic',
    weight: '200 900',
  },
  {
    family: 'IBM Plex Mono',
    pkg: mono,
    prefix: 'ibm-plex-mono',
    css: '400.css',
    variant: '400-normal',
    style: 'normal',
    weight: '400',
  },
  {
    family: 'IBM Plex Mono',
    pkg: mono,
    prefix: 'ibm-plex-mono',
    css: '500.css',
    variant: '500-normal',
    style: 'normal',
    weight: '500',
  },
  {
    family: 'IBM Plex Mono',
    pkg: mono,
    prefix: 'ibm-plex-mono',
    css: '400-italic.css',
    variant: '400-italic',
    style: 'italic',
    weight: '400',
  },
];

// Fallback faces shaped like each font, to limit layout shift while it loads.
const FALLBACKS = `@font-face{font-family:"Inter Fallback";src:local("Arial");size-adjust:107.12%;ascent-override:90.2%;descent-override:22.48%;line-gap-override:0%}
@font-face{font-family:"IBM Plex Mono Fallback";src:local("Courier New");size-adjust:100%;ascent-override:102.5%;descent-override:27.5%;line-gap-override:0%}
@font-face{font-family:"Source Serif 4 Fallback";src:local("Times New Roman");size-adjust:111%;ascent-override:93.3%;descent-override:30.2%;line-gap-override:0%}
`;

function unicodeRange(pkg, cssFile, prefix, subset, variant) {
  const css = readFileSync(join('node_modules', pkg, cssFile), 'utf8');
  const file = `${prefix}-${subset}-${variant}.woff2`;
  const block = css.split('@font-face').find((part) => part.includes(file));
  const range = block && /unicode-range:\s*([^;]+);/.exec(block)?.[1];
  if (!range)
    throw new Error(`No unicode-range for ${file} in ${pkg}/${cssFile}`);
  return range;
}

const out = join('dist', 'fonts');
mkdirSync(out, { recursive: true });

const interRules = interFaces.map(({ style, source, file, range }) => {
  copyFileSync(join('node_modules', inter, source), join(out, file));
  return `@font-face{font-family:"Inter";font-style:${style};font-weight:100 900;font-display:swap;src:url(./fonts/${file}) format("woff2");unicode-range:${range}}`;
});

const otherRules = faces.flatMap((face) =>
  SUBSETS.map((subset) => {
    const file = `${face.prefix}-${subset}-${face.variant}.woff2`;
    copyFileSync(
      join('node_modules', face.pkg, 'files', file),
      join(out, file),
    );
    const range = unicodeRange(
      face.pkg,
      face.css,
      face.prefix,
      subset,
      face.variant,
    );
    return `@font-face{font-family:"${face.family}";font-style:${face.style};font-weight:${face.weight};font-display:swap;src:url(./fonts/${file}) format("woff2");unicode-range:${range}}`;
  }),
);

for (const [path, name] of [
  [join(inter, 'LICENSE.txt'), 'inter'],
  [join(serif, 'LICENSE'), 'source-serif-4'],
  [join(mono, 'LICENSE'), 'ibm-plex-mono'],
]) {
  copyFileSync(join('node_modules', path), join(out, `LICENSE-${name}.txt`));
}

const licenses = join('dist', 'licenses');
mkdirSync(licenses, { recursive: true });
copyFileSync(
  join('node_modules', 'lucide-react', 'LICENSE'),
  join(licenses, 'LICENSE-lucide.txt'),
);

const stylesPath = join('dist', 'styles.css');
const styles = readFileSync(stylesPath, 'utf8');
writeFileSync(
  stylesPath,
  `${LAYERS}\n${[...interRules, ...otherRules].join('\n')}\n${FALLBACKS}${styles}`,
);
