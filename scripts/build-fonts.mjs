// Copies the bundled fonts into dist/fonts, and puts the layer order and font
// faces first in dist/styles.css (Spec 02).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fontsourceRange, INTER_FILES, interRanges } from './font-ranges.mjs';

const LAYERS = '@layer ds.theme,ds.reset,ds.base,ds.components,ds.utilities;';
const SUBSETS = ['latin', 'latin-ext'];

const inter = 'inter-ui';
const serif = '@fontsource-variable/source-serif-4';
const mono = '@fontsource/ibm-plex-mono';

// Inter comes from inter-ui, because Fontsource's files drop the cv05 and cv08
// features that make I, l, and 1 distinct (Spec 02). Its Latin subset file
// holds the common characters, and the full file covers the rest of
// latin-ext, so most pages only load the subset. Each file's unicode-range is
// read from its own character map, so it stays right when inter-ui updates.
const interFaces = ['normal', 'italic'].flatMap((style) => {
  const ranges = interRanges(style);
  return [
    {
      style,
      source: INTER_FILES[style].latin,
      file: `inter-latin-opsz-${style}.woff2`,
      range: ranges.latin,
    },
    {
      style,
      source: INTER_FILES[style].extended,
      file: `inter-extended-opsz-${style}.woff2`,
      range: ranges.extended,
    },
  ];
});

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
    const range = fontsourceRange(
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
