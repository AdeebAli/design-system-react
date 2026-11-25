// Checks what an editor shows for the built package (Spec 19): every component
// has an @example, and chosen props' hovers show literal values. It runs the
// TypeScript language service over dist/index.d.ts, so it sees what a
// consumer's editor sees.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

/**
 * While the editor-help work lands (Spec 19, plan tasks 1 to 6), failures are
 * printed but don't fail the build. Task 6 sets this to true.
 */
export const EDITOR_HELP_STRICT = false;

/**
 * Parts of compound components. They get no @example, because the example is
 * on the root part (Spec 19): `Tabs` has one, `TabsList` doesn't.
 */
export const COMPOUND_PARTS = [
  'AccordionItem',
  'BreadcrumbItem',
  'DialogClose',
  'DialogContent',
  'DialogDescription',
  'DialogTitle',
  'DialogTrigger',
  'DrawerClose',
  'DrawerContent',
  'DrawerDescription',
  'DrawerTitle',
  'DrawerTrigger',
  'MenuCheckboxItem',
  'MenuContent',
  'MenuGroup',
  'MenuGroupLabel',
  'MenuItem',
  'MenuLinkItem',
  'MenuRadioGroup',
  'MenuRadioItem',
  'MenuSeparator',
  'MenuSubmenu',
  'MenuSubmenuContent',
  'MenuSubmenuTrigger',
  'MenuTrigger',
  'NavBarLink',
  'PopoverClose',
  'PopoverContent',
  'PopoverDescription',
  'PopoverTitle',
  'PopoverTrigger',
  'Radio',
  'SidebarGroup',
  'SidebarLink',
  'Tab',
  'TableBody',
  'TableCaption',
  'TableCell',
  'TableFoot',
  'TableHead',
  'TableHeader',
  'TableRow',
  'TableSortHeader',
  'TabsList',
  'TabsPanel',
];

/** Spec 19's acceptance list: each hover's type line must show these. */
export const HOVER_CASES = [
  { component: 'Button', prop: 'variant', mustShow: ['"solid"', '"ghost"'] },
  { component: 'Button', prop: 'tone', mustShow: ['"accent"', '"danger"'] },
  { component: 'Button', prop: 'size', mustShow: ['"sm"', '"lg"'] },
  { component: 'Box', prop: 'width', mustShow: ['"full"', '"1/2"'] },
  { component: 'Box', prop: 'gap', mustShow: ['"4"', '"px"'] },
  { component: 'Grid', prop: 'columns', mustShow: ['number'] },
];

const DIR = join(process.cwd(), '__editor_help__');
const INDEX = join(DIR, 'index.d.ts');
const PROBE = join(DIR, 'probe.tsx');

/**
 * Returns failure messages; an empty array means the declarations pass.
 * `options` replaces the component exemptions and hover cases (for tests).
 */
export function checkEditorHelp(
  distIndexDts,
  { hoverCases = HOVER_CASES, compoundParts = COMPOUND_PARTS } = {},
) {
  const probe = [];
  const positions = [];
  const names = [...new Set(hoverCases.map((hover) => hover.component))];
  let source = `import { ${names.join(', ')} } from './index';\n`;
  for (const { component, prop } of hoverCases) {
    const before = `export const c${probe.length} = <${component} `;
    positions.push(source.length + before.length + 1);
    source += `${before}${prop}="x" />;\n`;
    probe.push({ component, prop });
  }
  const files = { [INDEX]: distIndexDts, [PROBE]: source };
  const read = (file) =>
    file in files
      ? files[file]
      : existsSync(file)
        ? readFileSync(file, 'utf8')
        : undefined;
  const host = {
    getScriptFileNames: () => Object.keys(files),
    getScriptVersion: () => '1',
    getScriptSnapshot: (file) => {
      const text = read(file);
      return text == null ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => ({
      jsx: ts.JsxEmit.Preserve,
      strict: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      skipLibCheck: true,
      noEmit: true,
    }),
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: (file) => file in files || existsSync(file),
    readFile: read,
    readDirectory: ts.sys.readDirectory,
    directoryExists: (dir) => dir === DIR || ts.sys.directoryExists(dir),
    getDirectories: ts.sys.getDirectories,
  };
  const service = ts.createLanguageService(host);
  const program = service.getProgram();
  const indexFile = program.getSourceFile(INDEX);
  const checker = program.getTypeChecker();
  const failures = [];

  const moduleSymbol = checker.getSymbolAtLocation(indexFile);
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    if (!/^[A-Z]/.test(name) || compoundParts.includes(name)) continue;
    const symbol =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    if (!(symbol.flags & ts.SymbolFlags.Function)) continue;
    const declaration = symbol.declarations[0];
    const info = service.getQuickInfoAtPosition(
      INDEX,
      declaration.name.getStart(indexFile),
    );
    if (!info?.tags?.some((tag) => tag.name === 'example')) {
      failures.push(`${name}: no @example in its documentation`);
    }
  }

  probe.forEach(({ component, prop }, index) => {
    const mustShow = hoverCases[index].mustShow;
    const info = service.getQuickInfoAtPosition(PROBE, positions[index]);
    const shown = ts.displayPartsToString(info?.displayParts ?? []);
    const missing = mustShow.filter((text) => !shown.includes(text));
    if (missing.length > 0) {
      failures.push(
        `${component}.${prop}: hover should show ${missing.join(', ')} but shows: ${shown || '(nothing)'}`,
      );
    }
  });
  return failures;
}
