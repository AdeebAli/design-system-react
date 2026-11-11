import { Skeleton } from './index';

test('accepts layout props, variant, lines, and as div or span', () => {
  <Skeleton width="full" height="10" />;
  <Skeleton variant="circle" width="10" height="10" />;
  <Skeleton variant="text" lines={3} />;
  <Skeleton as="span" variant="text" />;
  // @ts-expect-error only div and span are accepted
  <Skeleton as="p" />;
  // @ts-expect-error unknown variant
  <Skeleton variant="square" />;
  // @ts-expect-error background isn't a Skeleton prop
  <Skeleton background="surface" />;
});
