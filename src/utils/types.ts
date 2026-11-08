import type { ComponentPropsWithRef, ElementType } from 'react';
import type { LayoutProps } from '../components/Box/types';

type NativeProps<E extends ElementType, Own> = Omit<
  ComponentPropsWithRef<E>,
  keyof Own | keyof LayoutProps | 'color' | 'as'
>;

/** A component's own props, layout props, and its element's native props. */
export type ComponentProps<E extends ElementType, Own = object> = Own &
  LayoutProps &
  NativeProps<E, Own>;

/** The same, for a component that accepts `as`. */
export type PolymorphicProps<E extends ElementType, Own = object> = Own &
  LayoutProps & {
    /** The element or component to render. */
    as?: E;
  } & NativeProps<E, Own>;
