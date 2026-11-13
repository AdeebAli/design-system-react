import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { box } from '../Box';
import { Field } from '../Field';
import type { Option, OptionGroup } from '../Select';
import { Combobox } from './index';

const countries: (Option | OptionGroup)[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

const input = () => screen.getByRole('combobox');

it('shows the selected label before opening', () => {
  render(
    <Combobox aria-label="Country" options={countries} defaultValue="fr" />,
  );
  expect(input()).toHaveValue('France');
});

it('uncontrolled: onValueChange receives only the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(input());
  await userEvent.click(await screen.findByRole('option', { name: 'Japan' }));
  expect(onValueChange.mock.calls).toEqual([['jp']]);
  await waitFor(() => expect(input()).toHaveValue('Japan'));
});

it('controlled: the value follows the prop, not the pick', async () => {
  const onValueChange = vi.fn();
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      value="ca"
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(input());
  await userEvent.click(await screen.findByRole('option', { name: 'Japan' }));
  expect(onValueChange).toHaveBeenCalledWith('jp');
  await waitFor(() => expect(input()).toHaveValue('Canada'));
});

it('clearing sends null', async () => {
  const onValueChange = vi.fn();
  function Controlled() {
    const [value, setValue] = useState<string | null>('ca');
    return (
      <Combobox
        aria-label="Country"
        options={countries}
        value={value}
        clearable
        onValueChange={(v) => {
          onValueChange(v);
          setValue(v);
        }}
      />
    );
  }
  render(<Controlled />);
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onValueChange.mock.calls).toEqual([[null]]);
  await waitFor(() => expect(input()).toHaveValue(''));
});

it('renders group labels', async () => {
  render(
    <Combobox
      aria-label="City"
      options={[
        { label: 'Europe', options: [{ value: 'par', label: 'Paris' }] },
        { label: 'Asia', options: [{ value: 'tyo', label: 'Tokyo' }] },
      ]}
    />,
  );
  await userEvent.click(input());
  const europe = await screen.findByRole('group', { name: 'Europe' });
  expect(europe).toContainElement(
    screen.getByRole('option', { name: 'Paris' }),
  );
  expect(screen.getByRole('group', { name: 'Asia' })).toContainElement(
    screen.getByRole('option', { name: 'Tokyo' }),
  );
});

it('name submits the value', () => {
  const { container } = render(
    <form>
      <Combobox
        aria-label="Country"
        options={countries}
        name="country"
        defaultValue="jp"
      />
    </form>,
  );
  const form = container.querySelector('form')!;
  expect(new FormData(form).getAll('country')).toEqual(['jp']);
});

it('clearable shows a Clear button only while there is a value', async () => {
  render(<Combobox aria-label="Country" options={countries} clearable />);
  expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  await userEvent.click(input());
  await userEvent.click(await screen.findByRole('option', { name: 'France' }));
  expect(
    await screen.findByRole('button', { name: 'Clear' }),
  ).toBeInTheDocument();
});

it('without clearable, there is no Clear button', () => {
  render(
    <Combobox aria-label="Country" options={countries} defaultValue="fr" />,
  );
  expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
});

it('labels.clear names the Clear button', () => {
  render(
    <Combobox
      aria-label="Pays"
      options={countries}
      defaultValue="fr"
      clearable
      labels={{ clear: 'Effacer' }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Effacer' })).toBeInTheDocument();
});

it("the Field label is the input's label", () => {
  render(
    <Field label="Country" hint="Where you live">
      <Combobox options={countries} />
    </Field>,
  );
  const control = screen.getByRole('combobox', { name: 'Country' });
  expect(control).toBe(input());
  expect(control.tagName).toBe('INPUT');
  expect(control).toHaveAccessibleDescription('Where you live');
});

it('Field invalid, disabled, and required reach the control', () => {
  render(
    <Field label="Country" error="Pick one" disabled required>
      <Combobox options={countries} />
    </Field>,
  );
  expect(input()).toHaveAttribute('aria-invalid', 'true');
  expect(input()).toHaveAttribute('aria-required', 'true');
  expect(input()).toBeDisabled();
  const wrapper = input().parentElement!;
  expect(wrapper).toHaveAttribute('data-invalid');
  expect(wrapper).toHaveAttribute('data-disabled');
});

it('sets data-popup-open on the control while open, and option state attributes', async () => {
  render(
    <Combobox aria-label="Country" options={countries} defaultValue="ca" />,
  );
  const wrapper = input().parentElement!;
  expect(wrapper).not.toHaveAttribute('data-popup-open');
  await userEvent.click(input());
  await waitFor(() => expect(wrapper).toHaveAttribute('data-popup-open'));
  const canada = await screen.findByRole('option', { name: 'Canada' });
  expect(canada).toHaveAttribute('data-selected');
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(
      screen
        .getAllByRole('option')
        .some((o) => o.hasAttribute('data-highlighted')),
    ).toBe(true),
  );
});

it('disabled options carry data-disabled', async () => {
  render(
    <Combobox
      aria-label="Country"
      options={[...countries, { value: 'xx', label: 'Closed', disabled: true }]}
    />,
  );
  await userEvent.click(input());
  expect(await screen.findByRole('option', { name: 'Closed' })).toHaveAttribute(
    'data-disabled',
  );
});

it('ref and native attributes go to the input; className, style, and layout props to the wrapper', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <Combobox
      ref={ref}
      aria-label="Country"
      options={countries}
      enterKeyHint="search"
      className="custom"
      style={{ maxWidth: 300 }}
      marginTop="4"
      placeholder="Search countries…"
    />,
  );
  expect(ref.current).toBe(input());
  expect(input()).toHaveAttribute('placeholder', 'Search countries…');
  expect(input()).toHaveAttribute('enterkeyhint', 'search');
  const wrapper = input().parentElement!;
  expect(wrapper).toHaveClass('custom');
  expect(wrapper).toHaveStyle({ maxWidth: '300px' });
  expect(wrapper.className.split(' ')).toContain(box({ marginTop: '4' }));
  expect(input()).not.toHaveClass('custom');
  expect(wrapper.className).not.toBe(input().className);
});

it('uncontrolled: clearing after a pick sends null', async () => {
  const onValueChange = vi.fn();
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      clearable
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(input());
  await userEvent.click(await screen.findByRole('option', { name: 'Japan' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(onValueChange.mock.calls).toEqual([['jp'], [null]]);
});

it('invalid and disabled props work outside a Field', () => {
  render(
    <Combobox aria-label="Country" options={countries} invalid disabled />,
  );
  expect(input()).toHaveAttribute('aria-invalid', 'true');
  expect(input()).toBeDisabled();
  expect(input().parentElement).toHaveAttribute('data-invalid');
  expect(input().parentElement).toHaveAttribute('data-disabled');
});
