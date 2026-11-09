import { ColorModeToggle } from './index';

test('takes labels but no button style or size', () => {
  <ColorModeToggle labels={{ toDark: 'Dark' }} />;
  // @ts-expect-error the toggle has one style
  <ColorModeToggle variant="outline" />;
  // @ts-expect-error the toggle has one size
  <ColorModeToggle size="sm" />;
});
