import type { ComponentPropsWithRef } from 'react';

/** `TableHead`'s props. */
export type TableHeadProps = ComponentPropsWithRef<'thead'>;
/** `TableBody`'s props. */
export type TableBodyProps = ComponentPropsWithRef<'tbody'>;
/** `TableFoot`'s props. */
export type TableFootProps = ComponentPropsWithRef<'tfoot'>;

/** The table's header rows. */
export function TableHead(props: TableHeadProps) {
  return <thead {...props} />;
}

/** The table's body rows. */
export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />;
}

/** The table's footer rows. */
export function TableFoot(props: TableFootProps) {
  return <tfoot {...props} />;
}
