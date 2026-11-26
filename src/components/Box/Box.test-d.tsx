import type { ComponentProps, Ref } from 'react';
import { Box, box, type BoxProps } from './Box';
import type { GRID_COUNT_PROPS } from './gridCounts';
import type { sprinkles } from './sprinkles.css';
import type {
  BoxStyleProps,
  GridCount,
  GridSpanValue,
  Responsive,
  WidthValue,
} from './types';

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
  <Box borderRadius="image" />;
  // @ts-expect-error not a bg token
  <Box background="red" />;
  // @ts-expect-error the avatar pairs are for Avatar only (Spec 04)
  <Box background="avatar" />;
  // @ts-expect-error the avatar pairs are for Avatar only (Spec 04)
  <Box color="avatar" />;
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

// The grid counts don't come from sprinkles (ADR 0005).
type GridCountProp = 'gridTemplateColumns' | 'gridColumn' | 'gridRow';
type SprinkledProps = Exclude<keyof BoxStyleProps, GridCountProp>;

type Mismatched = {
  [K in SprinkledProps]-?: K extends keyof Sprinkle
    ? Equal<
        `${Values<Sprinkle[K]>}`,
        `${Values<BoxStyleProps[K]>}`
      > extends true
      ? never
      : K
    : K;
}[SprinkledProps];

test('hand-written types and sprinkles have the same props and values', () => {
  expectTypeOf<
    Exclude<keyof Sprinkle, Longhand>
  >().toEqualTypeOf<SprinkledProps>();
  expectTypeOf<Mismatched>().toBeNever();
});

test('the grid count props are the three that bypass sprinkles', () => {
  expectTypeOf<
    (typeof GRID_COUNT_PROPS)[number]
  >().toEqualTypeOf<GridCountProp>();
  expectTypeOf<GridCountProp>().toExtend<keyof BoxStyleProps>();
});

test('grid counts take numbers and strings, with no limit of 12', () => {
  <Box gridColumn={14} />;
  <Box gridColumn="span-14" />;
  <Box gridColumn={{ base: 'full', md: 3 }} />;
  <Box gridRow={20} />;
  <Box gridTemplateColumns={16} />;
  <Box gridTemplateColumns="16" />;
  // @ts-expect-error not a span
  <Box gridColumn="span-x" />;
  // @ts-expect-error full is for spans only
  <Box gridTemplateColumns="full" />;
});

test('the inline width union stays equal to WidthValue', () => {
  expectTypeOf<BoxStyleProps['width']>().toEqualTypeOf<
    Responsive<WidthValue> | undefined
  >();
});

test('box() takes the style props except the grid counts', () => {
  box({ padding: '4' });
  // @ts-expect-error grid counts aren't box() props (ADR 0005)
  box({ gridColumn: 'span-2' });
  // @ts-expect-error grid counts aren't box() props (ADR 0005)
  box({ gridRow: 2 });
  // @ts-expect-error grid counts aren't box() props (ADR 0005)
  box({ gridTemplateColumns: 2 });
});

test('the written-out grid counts stay equal to GridCount and GridSpanValue', () => {
  expectTypeOf<
    NonNullable<BoxStyleProps['gridTemplateColumns']>
  >().toEqualTypeOf<Responsive<GridCount>>();
  expectTypeOf<NonNullable<BoxStyleProps['gridColumn']>>().toEqualTypeOf<
    Responsive<GridSpanValue>
  >();
  expectTypeOf<NonNullable<BoxStyleProps['gridRow']>>().toEqualTypeOf<
    Responsive<GridSpanValue>
  >();
});
