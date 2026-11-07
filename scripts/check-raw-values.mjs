// Fails when component styles contain raw colors, px lengths, or shadows (Spec 02).
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RULES = [
  [/#[0-9a-fA-F]{3,8}\b/, 'raw color'],
  [/\b(?:rgb|rgba|hsl|hsla|oklch)\(/, 'raw color'],
  [/(?<![\d.])(?!1px)\d*\.?\d+px\b/, 'px length'],
  [/boxShadow:\s*['"`](?!none)/, 'shadow literal'],
];

export function findRawValues(source) {
  const findings = [];
  let forcedColorsDepth = 0;
  let depth = 0;
  source.split('\n').forEach((line, index) => {
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;
    if (forcedColorsDepth === 0 && line.includes('forced-colors')) {
      forcedColorsDepth = depth + 1;
    }
    if (forcedColorsDepth === 0) {
      const rule = RULES.find(([pattern]) => pattern.test(line));
      if (rule) findings.push(`${index + 1}: ${rule[1]}: ${line.trim()}`);
    }
    depth += opens - closes;
    if (forcedColorsDepth > 0 && depth < forcedColorsDepth)
      forcedColorsDepth = 0;
  });
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = globSync('src/components/**/*.css.ts').filter(
    (file) => !file.endsWith('sprinkles.css.ts'),
  );
  const failures = files.flatMap((file) =>
    findRawValues(readFileSync(file, 'utf8')).map(
      (finding) => `${file}:${finding}`,
    ),
  );
  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
}
