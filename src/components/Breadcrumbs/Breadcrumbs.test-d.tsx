import type { ComponentProps } from 'react';
import { BreadcrumbItem, Breadcrumbs } from './index';

function Router({
  children,
  ...props
}: ComponentProps<'a'> & { prefetch?: boolean }) {
  return <a {...props}>{children}</a>;
}

test('an item is a link or the current page', () => {
  <BreadcrumbItem href="/x">X</BreadcrumbItem>;
  <BreadcrumbItem as={Router} href="/x" prefetch>
    X
  </BreadcrumbItem>;
  <BreadcrumbItem current>X</BreadcrumbItem>;
  // @ts-expect-error current with href
  <BreadcrumbItem current href="/x">
    X
  </BreadcrumbItem>;
  // @ts-expect-error current with as
  <BreadcrumbItem current as={Router}>
    X
  </BreadcrumbItem>;
  // @ts-expect-error neither href nor current
  <BreadcrumbItem>X</BreadcrumbItem>;
});

test('Breadcrumbs values are limited', () => {
  <Breadcrumbs size="md" marginBottom="4" />;
  // @ts-expect-error not a size
  <Breadcrumbs size="lg" />;
});
