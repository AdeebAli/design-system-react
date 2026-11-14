import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as api from '../index';

// Spec 18, Testing: every component has a docs page with its sections and a
// props table for each public part.

const components = join(
  dirname(fileURLToPath(import.meta.url)),
  '../components',
);

const storyFiles = readdirSync(components, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => join(components, file));

const componentStories = storyFiles.filter((file) =>
  readFileSync(file, 'utf8').includes("title: 'Components/"),
);

const pageOf = (story: string) => story.replace(/\.stories\.tsx$/, '.mdx');

const pages = componentStories.map(pageOf).filter((page) => existsSync(page));
const allMdx = pages.map((page) => readFileSync(page, 'utf8')).join('\n');

// Parts with no props of their own get a NoOwnProps line instead of a table
// (Spec 18, Component pages; v0.8.1 plan Departure 3).
const NO_OWN_PROPS = [
  'Code',
  'Kbd',
  'DialogDescription',
  'DrawerDescription',
  'PopoverDescription',
  'MenuGroup',
  'MenuGroupLabel',
  'MenuSeparator',
  'MenuSubmenuContent',
  'TableHead',
  'TableBody',
  'TableFoot',
];

// Theming exports are covered by the Themes guide.
const THEMING = ['ThemeProvider', 'ColorModeScript'];

it.each(componentStories.map((file) => [file.slice(components.length + 1)]))(
  '%s has a sibling docs page with <Meta of=',
  (file) => {
    const page = pageOf(join(components, file));
    expect(existsSync(page)).toBe(true);
    expect(readFileSync(page, 'utf8')).toContain('<Meta of=');
  },
);

it.each(pages.map((page) => [page.slice(components.length + 1)]))(
  '%s has its sections in order and a props table',
  (page) => {
    const source = readFileSync(join(components, page), 'utf8');
    const headings = source
      .split('\n')
      .filter((line) => line.startsWith('## '))
      .map((line) => line.slice(3));
    expect(headings).toEqual(
      expect.arrayContaining([
        'Usage',
        "Do's and don'ts",
        'Accessibility',
        'API',
      ]),
    );
    const order = ['Usage', "Do's and don'ts", 'Accessibility', 'API'].map(
      (heading) => headings.indexOf(heading),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(source).toMatch(/<ArgTypes of=|<NoOwnProps /);
  },
);

const exported = Object.keys(api).filter(
  (name) => /^[A-Z]/.test(name) && !THEMING.includes(name),
);

it.each(
  exported.filter((name) => !NO_OWN_PROPS.includes(name)).map((name) => [name]),
)('%s has a props table', (name) => {
  expect(allMdx).toContain(`<ArgTypes of={${name}} />`);
});

it.each(NO_OWN_PROPS.map((name) => [name]))(
  '%s says it has no props of its own',
  (name) => {
    expect(allMdx).toContain(`<NoOwnProps name="${name}"`);
  },
);

it.each(componentStories.map((file) => [file.slice(components.length + 1)]))(
  '%s has no parameters.docs.description.component',
  (file) => {
    expect(readFileSync(join(components, file), 'utf8')).not.toMatch(
      /description:\s*\{\s*component:/,
    );
  },
);

// react-docgen-typescript hides a `children` prop with no TSDoc, so an
// undocumented one leaves a part's props table incomplete (Spec 18).
const INTERNAL = ['InternalProps', 'SelectButtonProps'];
const sources = [
  ...readdirSync(components, { recursive: true, encoding: 'utf8' }).map(
    (file) => join(components, file),
  ),
  join(components, '../theme/ThemeProvider.tsx'),
].filter(
  (file) =>
    /\.tsx?$/.test(file) &&
    !/\.(test|test-d|stories|css)\.|fixtures/.test(file),
);
const undocumentedChildren = sources.flatMap((file) => {
  const lines = readFileSync(file, 'utf8').split('\n');
  return lines.flatMap((line, index) => {
    if (!/\bchildren\??: (React\.)?(ReactNode|ReactElement)/.test(line)) {
      return [];
    }
    // A function's own parameter types, such as an internal helper's.
    const above = lines.slice(Math.max(0, index - 6), index);
    if (line.includes('function') || above.some((l) => /^\}: \{$/.test(l))) {
      return [];
    }
    const owner = lines
      .slice(0, index + 1)
      .reverse()
      .find((above) => /^(export )?(interface|type) \w+/.test(above));
    const name = owner?.match(/(?:interface|type) (\w+)/)?.[1] ?? '';
    if (INTERNAL.includes(name)) return [];
    const documented =
      !line.includes('{ children') && /\*\/\s*$/.test(lines[index - 1] ?? '');
    return documented
      ? []
      : [`${file.slice(components.length + 1)}:${index + 1}`];
  });
});

it('every public children prop has TSDoc', () => {
  expect(undocumentedChildren).toEqual([]);
});

// Prettier formats a template literal in MDX as Markdown, which breaks CSS
// (`/*` becomes `/_`, indentation goes), so CSS examples live in .css files.
const docsRoot = join(components, '../docs');
const docsMdx = readdirSync(docsRoot, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.mdx'))
  .map((file) => join(docsRoot, file));

it.each([...docsMdx, ...pages].map((file) => [file]))(
  '%s keeps CSS examples in .css files',
  (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(
      /<Source\b[^>]*language="css"[^>]*code=\{`|<Source\b[^>]*code=\{`[^`]*`\}[^>]*language="css"/,
    );
  },
);
