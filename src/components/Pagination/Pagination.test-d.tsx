import { Pagination } from './index';

const href = (p: number) => `/${p}`;
const change = (p: number) => void p;

test('exactly one of getHref and onPageChange is required', () => {
  <Pagination page={1} totalPages={3} getHref={href} />;
  <Pagination page={1} totalPages={3} onPageChange={change} />;
  // @ts-expect-error one of them is required
  <Pagination page={1} totalPages={3} />;
  // @ts-expect-error not both
  <Pagination page={1} totalPages={3} getHref={href} onPageChange={change} />;
});

test('as goes with getHref only', () => {
  <Pagination page={1} totalPages={3} getHref={href} as="a" />;
  // @ts-expect-error as is for links
  <Pagination page={1} totalPages={3} onPageChange={change} as="a" />;
});

test('siblingCount and size are restricted', () => {
  <Pagination page={1} totalPages={3} onPageChange={change} siblingCount={2} />;
  // @ts-expect-error 3 is not allowed
  <Pagination page={1} totalPages={3} onPageChange={change} siblingCount={3} />;
  <Pagination page={1} totalPages={3} onPageChange={change} size="sm" />;
  // @ts-expect-error lg is not a size
  <Pagination page={1} totalPages={3} onPageChange={change} size="lg" />;
});
