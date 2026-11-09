import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Field } from '../Field';
import { Switch } from './index';

it('is named by its label and toggles with Space and click', async () => {
  const onCheckedChange = vi.fn();
  render(<Switch label="Live updates" onCheckedChange={onCheckedChange} />);
  const s = screen.getByRole('switch', { name: 'Live updates' });
  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(s).toBeChecked();
  expect(s).toHaveAttribute('data-checked');
  await userEvent.click(screen.getByText('Live updates'));
  expect(s).not.toBeChecked();
  expect(s).toHaveAttribute('data-unchecked');
  expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
});

it('ref goes to the root and inputRef to the hidden input', () => {
  const ref = createRef<HTMLElement>();
  const inputRef = createRef<HTMLInputElement>();
  render(<Switch label="A" ref={ref} inputRef={inputRef} />);
  expect(ref.current).toBe(screen.getByRole('switch'));
  expect(inputRef.current?.tagName).toBe('INPUT');
});

it('inherits invalid, disabled, and required from Field', () => {
  render(
    <Field label="Sync" error="Bad" disabled>
      <Switch />
    </Field>,
  );
  const s = screen.getByRole('switch', { name: 'Sync' });
  expect(s).toHaveAttribute('data-disabled');
  expect(s).toHaveAttribute('aria-invalid', 'true');
});

it('warns when it has no name', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(<Switch />);
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

it.each(['Switch', 'Checkbox'] as const)(
  'a %s with a hint but no label is named by its Field label',
  async (name) => {
    const { Checkbox } = await import('../Checkbox');
    const Control = name === 'Switch' ? Switch : Checkbox;
    render(
      <Field label="Live">
        <Control hint="Refreshes every minute" />
      </Field>,
    );
    const el = screen.getByRole(name === 'Switch' ? 'switch' : 'checkbox');
    expect(el).toHaveAccessibleName('Live');
    expect(el).toHaveAccessibleDescription('Refreshes every minute');
  },
);
