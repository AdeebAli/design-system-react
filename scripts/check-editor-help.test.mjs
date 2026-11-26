import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkEditorHelp } from './check-editor-help.mjs';

const globals = `declare global { namespace JSX { interface Element {} interface IntrinsicElements {} } }\n`;
const example = `/**
 * A widget.
 * @example
 * \`\`\`tsx
 * <Widget variant="solid" />
 * \`\`\`
 */\n`;
const hoverCases = [
  { component: 'Widget', prop: 'variant', mustShow: ['"solid"', '"ghost"'] },
];

function fixture({ variant, docs = example, part = '' }) {
  return `${globals}export declare type Variant = 'solid' | 'ghost';
${docs}export declare function Widget(props: { variant?: ${variant} }): JSX.Element;
${part}`;
}

const options = (compoundParts = []) => ({ hoverCases, compoundParts });

test('a prop typed by a bare alias fails, naming the component and prop', () => {
  const failures = checkEditorHelp(fixture({ variant: 'Variant' }), options());
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^Widget\.variant: /);
  assert.match(failures[0], /"solid"/);
});

test('a component without an @example fails, naming it', () => {
  const failures = checkEditorHelp(
    fixture({ variant: "'solid' | 'ghost'", docs: '/** A widget. */\n' }),
    options(),
  );
  assert.deepEqual(failures, ['Widget: no @example in its documentation']);
});

test('a name in compoundParts needs no @example, and any other name does', () => {
  const part = 'export declare function WidgetPart(props: {}): JSX.Element;\n';
  const source = fixture({ variant: "'solid' | 'ghost'", part });
  assert.deepEqual(checkEditorHelp(source, options(['WidgetPart'])), []);
  assert.deepEqual(checkEditorHelp(source, options()), [
    'WidgetPart: no @example in its documentation',
  ]);
});

test('literals and examples return no failures', () => {
  assert.deepEqual(
    checkEditorHelp(fixture({ variant: "'solid' | 'ghost'" }), options()),
    [],
  );
});

test('a hover case naming a component or prop that is missing fails', () => {
  const failures = checkEditorHelp(fixture({ variant: "'solid' | 'ghost'" }), {
    hoverCases: [{ component: 'Widget', prop: 'nope', mustShow: ['x'] }],
    compoundParts: [],
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^Widget\.nope: /);
});
