import { join } from 'node:path';
import ts from 'typescript';

// Reads the library's own props through the TypeScript compiler, the way a
// consumer's editor does (Spec 19, Editor help).

export interface ValueUnionProp {
  /** The first exported component found with this prop. */
  component: string;
  prop: string;
  /** The string literal values, whatever order the compiler gives. */
  members: string[];
  /** The prop's TSDoc text, without tags. */
  doc: string;
  /** Where it's declared, as `path:line`, so shared props count once. */
  declaredAt: string;
}

const BREAKPOINTS = new Set(['base', 'sm', 'md', 'lg', 'xl']);

function isBreakpointMap(type: ts.Type, checker: ts.TypeChecker): boolean {
  if (!(type.flags & ts.TypeFlags.Object)) return false;
  if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0) {
    return false;
  }
  const names = checker.getPropertiesOfType(type).map((p) => p.getName());
  return names.length > 0 && names.every((name) => BREAKPOINTS.has(name));
}

/** Props whose type is a union of string literals, alone or as `Responsive<…>`. */
export function valueUnionProps(root: string): ValueUnionProp[] {
  const configPath = ts.findConfigFile(
    root,
    (file) => ts.sys.fileExists(file),
    'tsconfig.json',
  );
  if (!configPath) throw new Error('No tsconfig.json');
  const config = ts.parseJsonConfigFileContent(
    ts.readConfigFile(configPath, (file) => ts.sys.readFile(file)).config,
    ts.sys,
    root,
  );
  const entry = join(root, 'src/index.ts');
  const program = ts.createProgram([entry], config.options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) throw new Error('No src/index.ts');
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error('src/index.ts has no exports');

  const found = new Map<string, ValueUnionProp>();
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    if (!/^[A-Z]/.test(name)) continue;
    const symbol =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    if (!(symbol.flags & ts.SymbolFlags.Function)) continue;
    const declaration = symbol.declarations?.[0];
    if (!declaration) continue;
    const signature = checker.getSignaturesOfType(
      checker.getTypeOfSymbolAtLocation(symbol, declaration),
      ts.SignatureKind.Call,
    )[0];
    const parameter = signature?.parameters[0];
    if (!parameter) continue;
    const propsType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
    for (const prop of checker.getPropertiesOfType(propsType)) {
      const propDeclaration = prop.declarations?.[0];
      if (!propDeclaration) continue;
      const file = propDeclaration.getSourceFile();
      if (file.fileName.includes('node_modules')) continue;
      if (!file.fileName.startsWith(join(root, 'src'))) continue;
      const type = checker.getNonNullableType(
        checker.getTypeOfSymbolAtLocation(prop, propDeclaration),
      );
      const parts = type.isUnion() ? type.types : [type];
      const literals = parts.filter((part) => part.isStringLiteral());
      const others = parts.filter(
        (part) => !part.isStringLiteral() && !isBreakpointMap(part, checker),
      );
      if (literals.length < 2 || others.length > 0) continue;
      const line = file.getLineAndCharacterOfPosition(
        propDeclaration.getStart(file),
      ).line;
      const declaredAt = `${file.fileName.slice(root.length + 1)}:${line + 1}`;
      if (found.has(declaredAt)) continue;
      found.set(declaredAt, {
        component: name,
        prop: prop.getName(),
        members: literals.map((part) => part.value),
        doc: ts.displayPartsToString(prop.getDocumentationComment(checker)),
        declaredAt,
      });
    }
  }
  return [...found.values()];
}
