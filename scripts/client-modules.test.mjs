import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clientModuleFailures } from './client-modules.mjs';

const directive = '"use client";\n';

test('a module importing Base UI must begin with "use client"', () => {
  const source = 'import { Tabs as e } from "@base-ui/react/tabs";\n';
  assert.deepEqual(clientModuleFailures([['dist/a.js', source]]), [
    'dist/a.js imports Base UI or a hook but doesn\'t begin with "use client"',
  ]);
  assert.deepEqual(
    clientModuleFailures([['dist/a.js', directive + source]]),
    [],
  );
});

test('a module importing a React or internal hook, or createContext, must begin with "use client"', () => {
  for (const source of [
    'import { useState as e } from "react";\n',
    'import { createContext as e } from "react";\n',
    'import { useRadioGroup as o } from "../RadioGroup/RadioGroup.js";\n',
  ]) {
    assert.equal(
      clientModuleFailures([['dist/a.js', source]]).length,
      1,
      source,
    );
    assert.deepEqual(
      clientModuleFailures([['dist/a.js', directive + source]]),
      [],
    );
  }
});

test('a module with no hooks and no Base UI needs no directive', () => {
  const source =
    'import { cx as e } from "../../utils/cx.js";\nimport { jsx as o } from "react/jsx-runtime";\n';
  assert.deepEqual(clientModuleFailures([['dist/a.js', source]]), []);
});

test("a name that only starts with 'use' in lowercase words isn't a hook", () => {
  const source = 'import { user as e, useless as t } from "./x.js";\n';
  assert.deepEqual(clientModuleFailures([['dist/a.js', source]]), []);
});

test('a barrel that only re-exports a hook needs no directive', () => {
  const source =
    'import "./styles/index.js";\nimport { ThemeProvider as B, useColorMode as V } from "./theme/ThemeProvider.js";\nexport { B as ThemeProvider, V as useColorMode };\n';
  assert.deepEqual(clientModuleFailures([['dist/index.js', source]]), []);
});
