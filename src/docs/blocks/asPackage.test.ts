import { asPackage } from './asPackage';

it('rewrites imports of src/index to the package name', () => {
  expect(asPackage("import { Box } from '../../../index';")).toBe(
    "import { Box } from '@adeebali/design-system-react';",
  );
});

it('leaves other imports alone', () => {
  const source = "import { useState } from 'react';\nimport x from './x';";
  expect(asPackage(source)).toBe(source);
});
