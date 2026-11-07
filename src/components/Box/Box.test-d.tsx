import type { ComponentProps, Ref } from 'react';
import { Box, type BoxProps } from './Box';
import type { sprinkles } from './sprinkles.css';
import type { BoxStyleProps } from './types';

function Custom(props: { label: string; className?: string }) {
  return <span {...props} />;
}

test('tokens compile, and arbitrary values fail', () => {
  <Box padding="4" />;
  // @ts-expect-error arbitrary value
  <Box padding="13px" />;
  // @ts-expect-error tokens are strings
  <Box padding={4} />;
  <Box background="surface" borderRadius="card" boxShadow="card" />;
  // @ts-expect-error not a bg token
  <Box background="red" />;
});

test('responsive objects compile, and unknown breakpoints fail', () => {
  <Box padding={{ base: '2', md: '4' }} />;
  // @ts-expect-error unknown breakpoint
  <Box padding={{ xxl: '4' }} />;
  // @ts-expect-error the array form isn't enabled
  <Box padding={['2', '4']} />;
  // @ts-expect-error visual props aren't responsive
  <Box background={{ md: 'surface' }} />;
});

test("as adds that element's props", () => {
  <Box as="a" href="/x" />;
  // @ts-expect-error div has no href
  <Box as="div" href="/x" />;
  // @ts-expect-error the default element is a div
  <Box href="/x" />;
});

test('as={Component} adds its props', () => {
  <Box as={Custom} label="x" />;
  // @ts-expect-error label is required
  <Box as={Custom} />;
});

test('the ref type follows the element', () => {
  expectTypeOf<BoxProps<'a'>['ref']>().toEqualTypeOf<
    Ref<HTMLAnchorElement> | undefined
  >();
  expectTypeOf<BoxProps['ref']>().toEqualTypeOf<
    Ref<HTMLDivElement> | undefined
  >();
});

test('style props beat clashing attributes', () => {
  // @ts-expect-error width is a style prop
  <Box as="img" width={640} />;
  <Box as="img" alt="" htmlWidth={640} htmlHeight={360} width="full" />;
  // @ts-expect-error div has no width attribute
  <Box htmlWidth={640} />;
  // @ts-expect-error color is a style prop
  <Box color="red" />;
});

test('inset props leave start free for ol', () => {
  <Box as="ol" start={3} />;
  <Box insetStart="4" />;
});

test('token props do not widen to string', () => {
  expectTypeOf<BoxProps['padding']>().not.toEqualTypeOf<string | undefined>();
  expectTypeOf<'13px'>().not.toExtend<NonNullable<BoxProps['padding']>>();
});

test('component props stay assignable', () => {
  expectTypeOf<
    ComponentProps<typeof Custom>['label']
  >().toEqualTypeOf<string>();
});

type Sprinkle = Parameters<typeof sprinkles>[0];
// Sprinkles' CSS names behind the shorthands, which aren't public props.
type Longhand =
  | 'marginInline'
  | 'marginBlock'
  | 'marginBlockStart'
  | 'marginBlockEnd'
  | 'marginInlineStart'
  | 'marginInlineEnd'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockStart'
  | 'paddingBlockEnd'
  | 'paddingInlineStart'
  | 'paddingInlineEnd'
  | 'insetBlockStart'
  | 'insetBlockEnd'
  | 'insetInlineStart'
  | 'insetInlineEnd';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type Values<T> = Extract<T, string | number>;

type Mismatched = {
  [K in keyof BoxStyleProps]-?: K extends keyof Sprinkle
    ? Equal<
        `${Values<Sprinkle[K]>}`,
        `${Values<BoxStyleProps[K]>}`
      > extends true
      ? never
      : K
    : K;
}[keyof BoxStyleProps];

test('hand-written types and sprinkles have the same props and values', () => {
  expectTypeOf<Exclude<keyof Sprinkle, Longhand>>().toEqualTypeOf<
    keyof BoxStyleProps
  >();
  expectTypeOf<Mismatched>().toBeNever();
});
