import { createRef } from 'react';
import { Divider } from './index';

test('label is horizontal only, and not decorative', () => {
  <Divider />;
  <Divider marginY="4" />;
  <Divider label="or" />;
  <Divider orientation="horizontal" label="or" />;
  <Divider decorative />;
  <Divider orientation="vertical" />;
  <Divider orientation="vertical" decorative />;
  // @ts-expect-error label is horizontal only
  <Divider orientation="vertical" label="or" />;
  // @ts-expect-error a decorative divider has no label
  <Divider decorative label="or" />;
  // @ts-expect-error unknown orientation
  <Divider orientation="diagonal" />;
  // @ts-expect-error a Divider has no children
  <Divider>or</Divider>;
  // The default is an hr, so its ref takes an hr, or any HTMLElement.
  <Divider ref={createRef<HTMLHRElement>()} />;
  <Divider orientation="vertical" ref={createRef<HTMLElement>()} />;
  // @ts-expect-error background isn't a Divider prop
  <Divider background="surface" />;
});
