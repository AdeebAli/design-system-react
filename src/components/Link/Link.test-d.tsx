import type { ComponentProps } from 'react';
import { Link } from './index';

function Router({
  children,
  ...props
}: ComponentProps<'a'> & { prefetch?: boolean }) {
  return <a {...props}>{children}</a>;
}

test('as follows the component', () => {
  <Link as={Router} href="/x" prefetch />;
  // @ts-expect-error a plain a has no prefetch
  <Link href="/x" prefetch />;
});

test('values are limited', () => {
  // @ts-expect-error not a tone
  <Link tone="danger" href="/x" />;
  // @ts-expect-error not an underline
  <Link underline="never" href="/x" />;
  // @ts-expect-error color isn't accepted
  <Link color="red" href="/x" />;
});
