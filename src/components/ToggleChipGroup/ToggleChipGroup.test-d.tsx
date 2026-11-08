import { ToggleChipGroup } from './index';

test('needs aria-label or aria-labelledby', () => {
  <ToggleChipGroup aria-label="Topics" />;
  <ToggleChipGroup aria-labelledby="topics-heading" />;
  // @ts-expect-error a group needs a name
  <ToggleChipGroup />;
});
