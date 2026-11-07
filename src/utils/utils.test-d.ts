import type { ComponentProps, PolymorphicProps } from './types';

test('ComponentProps combines own, layout, and native props', () => {
  type P = ComponentProps<'span', { tone?: 'a' }>;
  expectTypeOf<P>().toHaveProperty('margin');
  expectTypeOf<P>().toHaveProperty('tone');
  expectTypeOf<P>().toHaveProperty('id');
  expectTypeOf<P>().not.toHaveProperty('padding');
  expectTypeOf<P>().not.toHaveProperty('color');
  expectTypeOf<P>().not.toHaveProperty('background');
});

test('own props replace native props', () => {
  type P = ComponentProps<'input', { size?: 'sm' | 'md' }>;
  expectTypeOf<P['size']>().toEqualTypeOf<'sm' | 'md' | undefined>();
});

test('PolymorphicProps follows the element', () => {
  type A = PolymorphicProps<'a', { tone?: 'a' }>;
  expectTypeOf<A>().toHaveProperty('href');
  expectTypeOf<A>().toHaveProperty('as');
  expectTypeOf<A>().toHaveProperty('margin');
  expectTypeOf<A>().not.toHaveProperty('padding');
});
