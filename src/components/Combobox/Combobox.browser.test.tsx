import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { Field } from '../Field';
import type { Option } from '../Select';
import { Select } from '../Select';
import * as selectStyles from '../Select/Select.css';
import { Combobox, type ComboboxProps } from './index';

const countries: Option[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

const input = () => screen.getByRole('combobox');
const optionNames = () =>
  screen.queryAllByRole('option').map((o) => o.textContent);

it('typing filters, and arrow keys and Enter choose', async () => {
  const onValueChange = vi.fn();
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(input());
  await userEvent.keyboard('ap');
  await expect.poll(optionNames).toEqual(['Japan']);
  await userEvent.keyboard('{Backspace}{Backspace}');
  await expect.poll(optionNames).toEqual(['Canada', 'France', 'Japan']);
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  expect(onValueChange.mock.calls).toEqual([['fr']]);
  await expect.poll(() => (input() as HTMLInputElement).value).toBe('France');
});

it('Escape closes the popup', async () => {
  render(<Combobox aria-label="Country" options={countries} />);
  await userEvent.click(input());
  await expect.poll(() => input().getAttribute('aria-expanded')).toBe('true');
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => input().getAttribute('aria-expanded')).toBe('false');
  expect(input()).toHaveFocus();
});

it.each([
  ['Tab', '{Tab}'],
  ['Escape then Tab', '{Escape}{Tab}'],
])(
  'unmatched text is restored to the selected label on blur (%s)',
  async (_, keys) => {
    render(
      <>
        <Combobox aria-label="Country" options={countries} defaultValue="fr" />
        <button type="button">After</button>
      </>,
    );
    await userEvent.fill(input(), 'xyz');
    expect(input()).toHaveValue('xyz');
    await userEvent.keyboard(keys);
    await expect.poll(() => (input() as HTMLInputElement).value).toBe('France');
    expect(input()).not.toHaveFocus();
  },
);

it('unmatched text with no selection is cleared on blur', async () => {
  render(
    <>
      <Combobox aria-label="Country" options={countries} />
      <button type="button">After</button>
    </>,
  );
  await userEvent.click(input());
  await userEvent.keyboard('xyz{Tab}');
  await expect.poll(() => (input() as HTMLInputElement).value).toBe('');
});

it('clearing returns focus to the input', async () => {
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      defaultValue="ca"
      clearable
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  await expect.poll(() => (input() as HTMLInputElement).value).toBe('');
  await expect.poll(() => document.activeElement).toBe(input());
});

it('clicking the Field label focuses the input', async () => {
  render(
    <Field label="Country">
      <Combobox options={countries} />
    </Field>,
  );
  await userEvent.click(screen.getByText('Country'));
  expect(screen.getByRole('combobox', { name: 'Country' })).toHaveFocus();
});

function Searching(props: Partial<ComboboxProps>) {
  // Empty for "zz", and every option otherwise, whatever the query.
  const [options, setOptions] = useState<Option[]>(countries);
  return (
    <Combobox
      aria-label="Country"
      options={options}
      onSearch={(query) => setOptions(query === 'zz' ? [] : countries)}
      {...props}
    />
  );
}

it('onSearch turns off local filtering', async () => {
  render(<Searching />);
  await userEvent.click(input());
  await userEvent.keyboard('jap');
  // "Canada" doesn't match "jap", but the project supplied it.
  await expect.poll(optionNames).toEqual(['Canada', 'France', 'Japan']);
});

it('a selected label survives new options', async () => {
  function Shrinking() {
    const [options, setOptions] = useState<Option[]>(countries);
    return (
      <Combobox
        aria-label="Country"
        options={options}
        defaultValue="jp"
        onSearch={() => setOptions([countries[0]!])}
      />
    );
  }
  render(
    <>
      <Shrinking />
      <button type="button">After</button>
    </>,
  );
  await userEvent.click(input());
  await userEvent.fill(input(), 'c');
  await expect.poll(optionNames).toEqual(['Canada']);
  await userEvent.keyboard('{Tab}');
  await expect.poll(() => (input() as HTMLInputElement).value).toBe('Japan');
});

it('selectedOptions displays a starting value that is not in options', () => {
  render(
    <Combobox
      aria-label="Country"
      options={countries}
      defaultValue="br"
      selectedOptions={[{ value: 'br', label: 'Brazil' }]}
    />,
  );
  expect(input()).toHaveValue('Brazil');
});

it('the status reads loading, then no results, then the count, from one element', async () => {
  const { rerender } = render(<Searching loading />);
  await userEvent.click(input());
  const status = await screen.findByRole('status');
  await expect.poll(() => status.textContent).toBe('Loading');
  rerender(<Searching loading={false} />);
  await userEvent.keyboard('zz');
  await expect.poll(() => status.textContent).toBe('No results');
  await userEvent.keyboard('{Backspace}{Backspace}');
  await expect.poll(() => status.textContent).toBe('3 results');
  expect(screen.getByRole('status')).toBe(status);
});

it.each(['sm', 'md', 'lg'] as const)(
  "size %s matches Select's trigger height",
  (size) => {
    render(
      <>
        <Combobox aria-label="Country" options={countries} size={size} />
        <Select aria-label="Plan" options={countries} size={size} />
      </>,
    );
    const wrapper = screen.getByRole('combobox', {
      name: 'Country',
    }).parentElement!;
    const select = screen.getByRole('combobox', { name: 'Plan' });
    expect(wrapper.getBoundingClientRect().height).toBe(
      { sm: 28, md: 36, lg: 44 }[size],
    );
    expect(wrapper.getBoundingClientRect().height).toBe(
      select.getBoundingClientRect().height,
    );
  },
);

it("the popup uses Select's surface tokens", async () => {
  render(<Combobox aria-label="Country" options={countries} />);
  await userEvent.click(input());
  const listbox = await screen.findByRole('listbox');
  const popup = listbox.closest<HTMLElement>(`.${selectStyles.popup}`)!;
  await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
  const probe = document.createElement('div');
  probe.style.background = 'var(--ds-color-bg-raised)';
  probe.style.boxShadow = 'var(--ds-shadow-raised)';
  probe.style.zIndex = 'var(--ds-z-index-popover)';
  probe.style.position = 'relative';
  document.body.append(probe);
  const p = getComputedStyle(probe);
  expect(getComputedStyle(popup).backgroundColor).toBe(p.backgroundColor);
  expect(getComputedStyle(popup).boxShadow).toBe(p.boxShadow);
  expect(getComputedStyle(popup.parentElement!).zIndex).toBe(p.zIndex);
  probe.remove();
});

it('the wrapper pads space.3 at the start and space.1 at the end, around the buttons', () => {
  render(<Combobox aria-label="Country" options={countries} clearable />);
  const wrapper = getComputedStyle(input().parentElement!);
  const probe = document.createElement('div');
  probe.style.paddingInlineStart = 'var(--ds-space-3)';
  probe.style.paddingInlineEnd = 'var(--ds-space-1)';
  document.body.append(probe);
  const p = getComputedStyle(probe);
  expect(wrapper.paddingInlineStart).toBe(p.paddingInlineStart);
  expect(wrapper.paddingInlineEnd).toBe(p.paddingInlineEnd);
  probe.remove();
});
