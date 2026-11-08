import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Field } from '../Field';
import { Select, type Option, type OptionGroup } from './index';

const options: (Option | OptionGroup)[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'legacy', label: 'Legacy', disabled: true },
];

const trigger = () => screen.getByRole('combobox');

it('shows the selected label before opening', () => {
  render(<Select aria-label="Plan" options={options} defaultValue="annual" />);
  expect(trigger()).toHaveTextContent('Annual');
});

it('null shows the placeholder', () => {
  render(
    <Select
      aria-label="Plan"
      options={options}
      value={null}
      placeholder="Pick a plan"
    />,
  );
  expect(trigger()).toHaveTextContent('Pick a plan');
});

it('a value with no option, or empty options, shows the placeholder and opens', async () => {
  render(
    <>
      <Select options={[]} value="gone" placeholder="Pick" aria-label="P" />
      <Select
        options={options}
        value="gone"
        placeholder="Choose"
        aria-label="Q"
      />
    </>,
  );
  const [p, q] = screen.getAllByRole('combobox');
  expect(p).toHaveTextContent('Pick');
  expect(q).toHaveTextContent('Choose');
  await userEvent.click(p!);
  await waitFor(() => expect(p).toHaveAttribute('aria-expanded', 'true'));
});

it('onValueChange receives only the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Select
      aria-label="Plan"
      options={options}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(trigger());
  await userEvent.click(await screen.findByRole('option', { name: 'Annual' }));
  expect(onValueChange.mock.calls).toEqual([['annual']]);
  await waitFor(() => expect(trigger()).toHaveTextContent('Annual'));
});

it('works controlled', async () => {
  const onValueChange = vi.fn();
  render(
    <Select
      aria-label="Plan"
      options={options}
      value="monthly"
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(trigger());
  await userEvent.click(await screen.findByRole('option', { name: 'Annual' }));
  expect(onValueChange).toHaveBeenCalledWith('annual');
  expect(trigger()).toHaveTextContent('Monthly');
});

it('disabled options cannot be selected', async () => {
  const onValueChange = vi.fn();
  render(
    <Select
      aria-label="Plan"
      options={options}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(trigger());
  const legacy = await screen.findByRole('option', { name: 'Legacy' });
  expect(legacy).toHaveAttribute('data-disabled');
  await userEvent.click(legacy);
  expect(onValueChange).not.toHaveBeenCalled();
});

it('ref, className, and layout props go to the trigger', () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Select
      aria-label="Plan"
      options={options}
      ref={ref}
      className="extra"
      marginTop="2"
    />,
  );
  expect(ref.current).toBe(trigger());
  expect(trigger()).toHaveClass('extra');
});

it('name submits the value with a form', () => {
  const { container } = render(
    <form>
      <Select
        aria-label="Plan"
        options={options}
        name="plan"
        defaultValue="annual"
      />
    </form>,
  );
  const data = new FormData(container.querySelector('form')!);
  expect(data.get('plan')).toBe('annual');
});

it('inherits invalid, disabled, and required from Field, and is named by its label', () => {
  render(
    <Field label="Plan" error="Choose one" required disabled>
      <Select options={options} />
    </Field>,
  );
  const t = screen.getByRole('combobox', { name: 'Plan' });
  expect(t).toHaveAttribute('aria-invalid', 'true');
  expect(t).toHaveAttribute('data-invalid');
  expect(t).toHaveAttribute('aria-required', 'true');
  expect(t).toHaveAttribute('data-disabled');
  expect(t).toHaveAccessibleDescription('Choose one');
});

it('renders group labels only for groups', async () => {
  render(
    <Select
      aria-label="Plan"
      options={[
        { value: 'a', label: 'A' },
        { label: 'Other', options: [{ value: 's', label: 'Standard' }] },
        { value: 'b', label: 'B' },
      ]}
    />,
  );
  await userEvent.click(trigger());
  const groups = await screen.findAllByRole('group');
  expect(groups).toHaveLength(3);
  expect(screen.getByRole('group', { name: 'Other' })).toContainElement(
    screen.getByRole('option', { name: 'Standard' }),
  );
});

it('marks the selected option', async () => {
  render(<Select aria-label="Plan" options={options} defaultValue="annual" />);
  await userEvent.click(trigger());
  const annual = await screen.findByRole('option', { name: 'Annual' });
  expect(annual).toHaveAttribute('data-selected');
  expect(annual).toHaveAttribute('aria-selected', 'true');
});
