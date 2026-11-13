import type { ComponentProps } from 'react';
import { Image } from './index';

/** Stands in for an image component such as next/image. */
function Framework(props: ComponentProps<'img'> & { fill?: boolean }) {
  return <img alt="" {...props} />;
}

test('alt is required, and "" marks it decorative', () => {
  // @ts-expect-error alt is required
  <Image src="/a.jpg" />;
  <Image src="/a.jpg" alt="" />;
});

test('other props come from as', () => {
  // @ts-expect-error a plain img has no fill
  <Image src="/a.jpg" alt="" fill />;
  <Image as={Framework} src="/a.jpg" alt="" fill />;
});

test('the intrinsic size goes through htmlWidth, not the layout width', () => {
  // @ts-expect-error layout width is a token
  <Image src="/a.jpg" alt="" width={640} />;
  <Image src="/a.jpg" alt="" htmlWidth={640} htmlHeight={480} />;
});

test('display takes Box display values', () => {
  <Image src="/a.jpg" alt="" display="inline-block" />;
  <Image src="/a.jpg" alt="" display={{ base: 'block', md: 'inline-block' }} />;
  // @ts-expect-error not a display value
  <Image src="/a.jpg" alt="" display="table" />;
});

test('ratio takes a preset or a number', () => {
  <Image src="/a.jpg" alt="" ratio="16/9" />;
  <Image src="/a.jpg" alt="" ratio={1.6} />;
  // @ts-expect-error not a preset: write 5 / 4
  <Image src="/a.jpg" alt="" ratio="5/4" />;
});

test('radius takes the radius scale only', () => {
  <Image src="/a.jpg" alt="" radius="none" />;
  // @ts-expect-error card is an alias, not on the scale
  <Image src="/a.jpg" alt="" radius="card" />;
});
