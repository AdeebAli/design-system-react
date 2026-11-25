import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { extractExamples } from './extract-examples.mjs';

function workspace(files) {
  const root = mkdtempSync(join(tmpdir(), 'examples-'));
  const src = join(root, 'src');
  for (const [name, text] of Object.entries(files)) {
    const file = join(src, name);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, text);
  }
  return { src, out: join(root, '.generated/examples') };
}

const button = (example) => `/** A button.
 * ${example}
 */
export function Button(props) {
  return null;
}
`;
const fence =
  '@example\n * ```tsx\n * <Button variant="solid">Save</Button>\n * ```';

test('an example becomes one module that imports from src/index and wraps the expression', () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': button(fence),
  });
  const result = extractExamples(src, out);
  assert.deepEqual(result, { written: 1, errors: [] });
  const module = readFileSync(join(out, 'Button.tsx'), 'utf8');
  assert.match(module, /import \{ Button \} from '..\/..\/src\/index';/);
  assert.match(
    module,
    /export function Example\(\) \{\s+return \(\s+<Button variant="solid">Save<\/Button>\s+\);\s+\}/,
  );
});

test('a second @example on the same component is an error naming it', () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': button(`${fence}\n * ${fence}`),
  });
  const { errors } = extractExamples(src, out);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Button/);
  assert.match(errors[0], /more than one @example/);
});

test('an example with no fence is an error naming the component', () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': button(
      '@example\n * <Button>Save</Button>',
    ),
  });
  const { errors, written } = extractExamples(src, out);
  assert.equal(written, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Button/);
  assert.match(errors[0], /fenced/);
});

test("an import from the package is rewritten to src/index, and its names aren't imported twice", () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': button(
      "@example\n * ```tsx\n * import { Button } from '@adeebali/design-system-react';\n * import { Plus } from 'lucide-react';\n * <Button startIcon={<Icon icon={Plus} />}>Add</Button>\n * ```",
    ),
  });
  const { errors } = extractExamples(src, out);
  assert.deepEqual(errors, []);
  const module = readFileSync(join(out, 'Button.tsx'), 'utf8');
  assert.doesNotMatch(module, /@adeebali\/design-system-react/);
  assert.match(module, /import \{ Button, Icon \} from '..\/..\/src\/index';/);
  assert.match(module, /import \{ Plus \} from 'lucide-react';/);
  assert.equal(module.match(/src\/index/g).length, 1);
});

test('an @example on something that is not an exported component is an error', () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': `/** Helper.\n * ${fence}\n */\nfunction helper() {}\n`,
  });
  const { errors } = extractExamples(src, out);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /exported/);
});

test('the output folder is cleared first, so a removed example leaves no module', () => {
  const { src, out } = workspace({
    'components/Button/Button.tsx': button(fence),
  });
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'Stale.tsx'), 'export {};');
  extractExamples(src, out);
  assert.equal(existsSync(join(out, 'Stale.tsx')), false);
  assert.equal(existsSync(join(out, 'Button.tsx')), true);
});

test('test, story, and docs files are not read', () => {
  const { src, out } = workspace({
    'components/Button/Button.test.tsx': button(fence),
    'components/Button/Button.stories.tsx': button(fence),
    'docs/Page.tsx': button(fence),
  });
  assert.deepEqual(extractExamples(src, out), { written: 0, errors: [] });
});
