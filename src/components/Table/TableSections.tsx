import type { ComponentPropsWithRef } from 'react';

/** The table's header rows. */
export function TableHead(props: ComponentPropsWithRef<'thead'>) {
  return <thead {...props} />;
}

/** The table's body rows. */
export function TableBody(props: ComponentPropsWithRef<'tbody'>) {
  return <tbody {...props} />;
}

/** The table's footer rows. */
export function TableFoot(props: ComponentPropsWithRef<'tfoot'>) {
  return <tfoot {...props} />;
}
