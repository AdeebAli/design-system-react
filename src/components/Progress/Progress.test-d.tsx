import { Progress } from './index';

test('requires a value and a name', () => {
  <Progress label="Uploading" value={42} />;
  <Progress aria-label="Importing" value={null} />;
  <Progress
    label="Uploading"
    value={42}
    max={200}
    showValue
    size="sm"
    tone="success"
    marginTop="2"
  />;
  // @ts-expect-error a name is required
  <Progress value={42} />;
  // @ts-expect-error label and aria-label together
  <Progress label="Uploading" aria-label="Uploading" value={42} />;
  // @ts-expect-error value is required
  <Progress label="Uploading" />;
  // @ts-expect-error unknown tone
  <Progress label="Uploading" value={42} tone="info" />;
  // @ts-expect-error unknown size
  <Progress label="Uploading" value={42} size="lg" />;
  // @ts-expect-error background isn't a Progress prop
  <Progress label="Uploading" value={42} background="surface" />;
});
