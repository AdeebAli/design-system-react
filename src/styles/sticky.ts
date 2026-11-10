import { vars } from '../themes/contract.css';

/** `NavBar`'s vertical padding. */
export const navBarPaddingBlock = vars.space['2'];

/** The default top offset of a `sticky` `NavBar`. */
export const stickyOffset = vars.space['2'];

/**
 * How far a `sticky` `NavBar` at its default size reaches down the page: its
 * offset, padding, border, and menu button height. `Prose`'s headings scroll
 * clear of it. Shared here so `Prose` doesn't depend on `NavBar`'s styles.
 */
export const stickyClearance = `calc(${stickyOffset} + 2 * ${navBarPaddingBlock} + 2 * ${vars.borderWidth.thin} + ${vars.size.control.md})`;
