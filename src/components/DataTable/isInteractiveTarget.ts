const ROLES = [
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'tab',
  'textbox',
  'searchbox',
  'combobox',
  'slider',
  'spinbutton',
  'treeitem',
];

/** Matches an interactive element or an interactive ARIA role. */
export const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  ...ROLES.map((role) => `[role="${role}"]`),
].join(',');

/**
 * Whether a click target is inside an interactive element, up to `row`.
 * The row's own handler ignores these, so a control keeps its own behavior.
 */
export function isInteractiveTarget(target: Element, row: Element): boolean {
  const match = target.closest(INTERACTIVE_SELECTOR);
  return match !== null && match !== row && row.contains(match);
}
