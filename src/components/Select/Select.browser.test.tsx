import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { Field } from '../Field';
import { Select, type SelectProps } from './index';
import * as styles from './Select.css';

const options = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const trigger = () => screen.getByRole('combobox');

it('opens and chooses with the keyboard, and Escape returns focus to the trigger', async () => {
  render(<Select aria-label="Plan" options={options} placeholder="Pick" />);
  await userEvent.tab();
  expect(trigger()).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('true');
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await expect.poll(() => trigger().textContent).toContain('Annual');
  // Choosing closes the popup; focus is back once its exit animation ends.
  await expect.poll(() => document.activeElement).toBe(trigger());
  await userEvent.keyboard('{Enter}');
  await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('true');
  await userEvent.keyboard('{Escape}');
  await expect
    .poll(() => trigger().getAttribute('aria-expanded'))
    .toBe('false');
  // Focus returns once the popup's exit animation ends.
  await expect.poll(() => document.activeElement).toBe(trigger());
});

it('opens with the mouse, below the trigger, on the raised surface', async () => {
  render(<Select aria-label="Plan" options={options} />);
  await userEvent.click(trigger());
  const listbox = await screen.findByRole('listbox');
  await expect.poll(() => getComputedStyle(listbox).opacity).toBe('1');
  const below =
    listbox.getBoundingClientRect().top >=
    trigger().getBoundingClientRect().bottom;
  expect(below).toBe(true);
  const probe = document.createElement('div');
  probe.style.background = 'var(--ds-color-bg-raised)';
  document.body.append(probe);
  // The listbox is the list inside the popup surface.
  const popup = listbox.closest(`.${styles.popup}`)!;
  expect(getComputedStyle(popup).backgroundColor).toBe(
    getComputedStyle(probe).backgroundColor,
  );
  probe.remove();
  await userEvent.click(screen.getByRole('option', { name: 'Monthly' }));
  await expect
    .poll(() => trigger().getAttribute('aria-expanded'))
    .toBe('false');
});

function Wrapped(props: Partial<SelectProps>) {
  // Stands in for React Hook Form's Controller: Field can't see the Select's type.
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      options={options}
      value={value}
      onValueChange={setValue}
      {...props}
    />
  );
}

it.each([
  ['directly', () => <Select options={options} />],
  ['inside a wrapper component', () => <Wrapped />],
])(
  'clicking the Field label focuses the trigger without opening it (%s)',
  async (_, control) => {
    render(<Field label="Plan">{control()}</Field>);
    await userEvent.click(screen.getByText('Plan'));
    const t = screen.getByRole('combobox', { name: 'Plan' });
    expect(t).toHaveFocus();
    expect(t).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
  },
);

it.each(['sm', 'md', 'lg'] as const)(
  'size %s uses the control height',
  (size) => {
    render(<Select aria-label="Plan" options={options} size={size} />);
    expect(trigger().getBoundingClientRect().height).toBe(
      { sm: 28, md: 36, lg: 44 }[size],
    );
  },
);

describe('document direction', () => {
  const long = [
    { value: 'monthly', label: 'Monthly, billed on the first of the month' },
    { value: 'annual', label: 'Annual, billed once a year' },
  ];

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  // The popup is wider than the trigger, so its edges show the alignment.
  async function offsets() {
    const { unmount } = render(
      <div style={{ width: 120, marginInline: 'auto', paddingBlock: 40 }}>
        <Select aria-label="Plan" options={long} />
      </div>,
    );
    await userEvent.click(trigger());
    const listbox = await screen.findByRole('listbox');
    const popup = listbox.closest<HTMLElement>(`.${styles.popup}`)!;
    await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
    const p = popup.getBoundingClientRect();
    const t = trigger().getBoundingClientRect();
    expect(p.width).toBeGreaterThan(t.width + 20);
    const result = {
      start: p.left - t.left,
      end: t.right - p.right,
    };
    await userEvent.keyboard('{Escape}');
    unmount();
    return result;
  }

  // Base UI centers the popup (`align` defaults to `center`), and the only
  // direction-dependent placement in its Select is `alignItemWithTrigger`,
  // which is off. So RTL places the popup exactly as LTR does.
  it('the popup centers on the trigger in RTL as in LTR', async () => {
    const ltr = await offsets();
    expect(Math.abs(ltr.start - ltr.end)).toBeLessThanOrEqual(1);
    document.documentElement.dir = 'rtl';
    const rtl = await offsets();
    expect(Math.abs(rtl.start - rtl.end)).toBeLessThanOrEqual(1);
    expect(Math.abs(rtl.start - ltr.start)).toBeLessThanOrEqual(1);
  });
});
