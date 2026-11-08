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
  await userEvent.keyboard('{Enter}');
  await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('true');
  await userEvent.keyboard('{Escape}');
  await expect
    .poll(() => trigger().getAttribute('aria-expanded'))
    .toBe('false');
  expect(trigger()).toHaveFocus();
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
