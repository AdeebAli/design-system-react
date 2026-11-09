import { RadioGroup } from './index';

test('value accepts null for "nothing selected"', () => {
  <RadioGroup aria-label="Plan" value={null} />;
  <RadioGroup aria-label="Plan" defaultValue={null} />;
  <RadioGroup aria-label="Plan" onValueChange={(v: string) => v} />;
});
