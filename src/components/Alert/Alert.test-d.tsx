import { Icon } from '../Icon';
import { InfoIcon } from '../Icon/internal/Info';
import { Alert } from './index';

test('accepts tones, slots, live, and layout props', () => {
  <Alert>Message</Alert>;
  <Alert
    tone="danger"
    title="Title"
    icon={<Icon icon={InfoIcon} />}
    action={<button>Retry</button>}
    onDismiss={() => undefined}
    dismissLabel="Close"
    live="assertive"
    marginBottom="4"
  >
    Message
  </Alert>;
  <Alert icon={null}>Message</Alert>;
  // @ts-expect-error unknown tone
  <Alert tone="error">Message</Alert>;
  // @ts-expect-error unknown live value
  <Alert live="rude">Message</Alert>;
  // @ts-expect-error icon is an element, not a component
  <Alert icon={InfoIcon}>Message</Alert>;
  // @ts-expect-error onDismiss receives nothing
  <Alert onDismiss={(reason: string) => reason}>Message</Alert>;
  // @ts-expect-error background isn't an Alert prop
  <Alert background="surface">Message</Alert>;
});
