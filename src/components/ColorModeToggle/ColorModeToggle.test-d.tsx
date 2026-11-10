import { createRef } from 'react';
import { ColorModeToggle } from './index';

test('takes a button style other than solid, and a size', () => {
  <ColorModeToggle labels={{ toDark: 'Dark' }} />;
  <ColorModeToggle variant="ghost" />;
  <ColorModeToggle variant="soft" />;
  <ColorModeToggle variant="outline" />;
  <ColorModeToggle size="sm" />;
  <ColorModeToggle size="lg" />;
  // @ts-expect-error solid is too loud for a utility control
  <ColorModeToggle variant="solid" />;
});

test('takes ref, style, and button props, but not icon', () => {
  <ColorModeToggle ref={createRef<HTMLButtonElement>()} style={{}} />;
  <ColorModeToggle onClick={() => undefined} data-testid="x" />;
  // @ts-expect-error the toggle picks its own icon
  <ColorModeToggle icon={null} />;
});
