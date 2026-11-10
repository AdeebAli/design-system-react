// Finds built modules that need "use client" but don't begin with it. A module
// needs it when it imports Base UI, a hook (React's or ours), or createContext,
// since a server component can't run any of them.

const IMPORT =
  /^import\s*(?:\w+\s*,\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/gm;
const NAMESPACE =
  /^import\s+(?:\w+\s*,\s*)?\*\s+as\s+(\w+)\s+from\s*["']react["']/m;
const HOOK = /^(?:use[A-Z]\w*|createContext)$/;

// A barrel only imports and re-exports, so it runs nothing itself.
function isBarrel(source) {
  const lines = source.split('\n').filter((line) => line.trim() !== '');
  return (
    lines.some((line) => line.startsWith('export')) &&
    lines.every((line) => /^(import|export)\b/.test(line))
  );
}

function needsDirective(source) {
  if (isBarrel(source)) return false;
  for (const [, names, from] of source.matchAll(IMPORT)) {
    if (from.startsWith('@base-ui/react')) return true;
    const imported = names
      .split(',')
      .map((name) => name.trim().split(/\s+/)[0]);
    if (imported.some((name) => HOOK.test(name))) return true;
  }
  const namespace = source.match(NAMESPACE)?.[1];
  if (
    namespace &&
    new RegExp(`\\b${namespace}\\.(?:use[A-Z]\\w*|createContext)\\b`).test(
      source,
    )
  )
    return true;
  return /^import\s*["']@base-ui\/react/m.test(source);
}

/** @param {[path: string, source: string][]} files */
export function clientModuleFailures(files) {
  return files
    .filter(
      ([, source]) =>
        needsDirective(source) && !/^\s*['"]use client['"]/.test(source),
    )
    .map(
      ([path]) =>
        `${path} imports Base UI or a hook but doesn't begin with "use client"`,
    );
}
