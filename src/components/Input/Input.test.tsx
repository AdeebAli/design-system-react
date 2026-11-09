import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { Field } from '../Field';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { Input } from './index';

it('ref and native props go to the input; className, style, and layout props to the wrapper', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <Input
      ref={ref}
      aria-label="q"
      name="q"
      placeholder="Search"
      className="extra"
      style={{ color: 'red' }}
      marginTop="4"
    />,
  );
  const input = screen.getByRole('textbox');
  expect(ref.current).toBe(input);
  expect(input).toHaveAttribute('name', 'q');
  expect(input).toHaveAttribute('placeholder', 'Search');
  expect(input).not.toHaveClass('extra');
  const wrapper = input.parentElement!;
  expect(wrapper).toHaveClass('extra');
  expect(wrapper.style.color).toBe('red');
});

it('fires native onChange with an event, controlled and uncontrolled', async () => {
  const seen: string[] = [];
  function Controlled() {
    const [value, setValue] = useState('');
    return (
      <Input
        aria-label="c"
        value={value}
        onChange={(e) => {
          seen.push(e.target.value);
          setValue(e.target.value);
        }}
      />
    );
  }
  render(
    <>
      <Controlled />
      <Input aria-label="u" defaultValue="a" />
    </>,
  );
  await userEvent.type(screen.getByLabelText('c'), 'hi');
  expect(seen).toEqual(['h', 'hi']);
  await userEvent.type(screen.getByLabelText('u'), 'b');
  expect(screen.getByLabelText('u')).toHaveValue('ab');
});

it('works with a register-style ref, name, and onChange', async () => {
  const values: Record<string, string> = {};
  let element: HTMLInputElement | null = null;
  const register = (name: string) => ({
    name,
    ref: (el: HTMLInputElement | null) => {
      element = el;
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      values[e.target.name] = e.target.value;
    },
    onBlur: () => undefined,
  });
  render(<Input aria-label="seats" {...register('seats')} />);
  await userEvent.type(screen.getByLabelText('seats'), '4');
  expect(values).toEqual({ seats: '4' });
  expect(element).toBe(screen.getByLabelText('seats'));
});

it('sets data-invalid and data-disabled on the wrapper', () => {
  render(
    <>
      <Field label="A" error="Bad">
        <Input />
      </Field>
      <Input aria-label="B" disabled invalid />
    </>,
  );
  const a = screen.getByRole('textbox', { name: 'A' }).parentElement;
  expect(a).toHaveAttribute('data-invalid');
  const b = screen.getByRole('textbox', { name: 'B' });
  expect(b).toHaveAttribute('aria-invalid', 'true');
  expect(b.parentElement).toHaveAttribute('data-invalid');
  expect(b.parentElement).toHaveAttribute('data-disabled');
});

it('passes native required through', () => {
  render(<Input aria-label="q" required />);
  expect(screen.getByRole('textbox')).toBeRequired();
});

it('renders decorative start and end icons beside the input', () => {
  render(
    <Input
      aria-label="q"
      startIcon={<Icon icon={ArrowUpIcon} data-testid="s" />}
      endIcon={<Icon icon={ArrowUpIcon} data-testid="e" />}
    />,
  );
  const wrapper = screen.getByRole('textbox').parentElement!;
  expect(wrapper.firstElementChild).toContainElement(screen.getByTestId('s'));
  expect(wrapper.lastElementChild).toContainElement(screen.getByTestId('e'));
  expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
});

it('does not pass size to the native input', () => {
  render(<Input aria-label="q" size="lg" />);
  expect(screen.getByRole('textbox')).not.toHaveAttribute('size');
});

it('disabled={false} inside a disabled Field stays disabled, with disabled styling', () => {
  render(
    <Field label="Seats" disabled>
      <Input disabled={false} />
    </Field>,
  );
  const input = screen.getByRole('textbox');
  expect(input).toBeDisabled();
  // The wrapper, not the Field root, which has its own data-disabled.
  expect(input.parentElement).toHaveAttribute('data-disabled');
});
