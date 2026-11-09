import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Field } from '../Field';
import { Checkbox } from './index';

const warnSpy = () =>
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

it('is named by its own label, and clicking the label text toggles it', async () => {
  const onCheckedChange = vi.fn();
  render(
    <Checkbox label="Include archived" onCheckedChange={onCheckedChange} />,
  );
  const box = screen.getByRole('checkbox', { name: 'Include archived' });
  expect(box).not.toBeChecked();
  await userEvent.click(screen.getByText('Include archived'));
  expect(box).toBeChecked();
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange.mock.calls[0]).toEqual([true]);
});

it('works controlled', async () => {
  const onCheckedChange = vi.fn();
  const { rerender } = render(
    <Checkbox label="A" checked={false} onCheckedChange={onCheckedChange} />,
  );
  await userEvent.click(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  rerender(<Checkbox label="A" checked onCheckedChange={onCheckedChange} />);
  expect(screen.getByRole('checkbox')).toBeChecked();
});

it('toggles with Space', async () => {
  render(<Checkbox label="A" />);
  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(screen.getByRole('checkbox')).toBeChecked();
});

it('its hint describes it', () => {
  render(<Checkbox label="Digest" hint="Sent on Mondays" />);
  expect(
    screen.getByRole('checkbox', { name: 'Digest' }),
  ).toHaveAccessibleDescription('Sent on Mondays');
});

it('keeps its own label inside a Field, which describes it with its hint and error', () => {
  render(
    <Field label="Notifications" hint="Choose what to get" error="Pick one">
      <Checkbox label="Email" />
    </Field>,
  );
  const box = screen.getByRole('checkbox', { name: 'Email' });
  expect(box).toHaveAccessibleDescription(/Choose what to get/);
  expect(box).toHaveAccessibleDescription(/Pick one/);
  expect(box).toHaveAttribute('aria-invalid', 'true');
});

it('without a label, is named by the Field label', () => {
  render(
    <Field label="Accept terms">
      <Checkbox />
    </Field>,
  );
  expect(
    screen.getByRole('checkbox', { name: 'Accept terms' }),
  ).toBeInTheDocument();
});

it('warns when it has no label, aria-label, or Field label', () => {
  const warn = warnSpy();
  render(
    <>
      <Checkbox />
      <Checkbox aria-label="Named" />
      <Field label="Named by field">
        <Checkbox />
      </Field>
    </>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toMatch(/Checkbox.*name/);
  warn.mockRestore();
});

it('indeterminate sets aria-checked="mixed" and data-indeterminate', () => {
  render(<Checkbox label="All" indeterminate />);
  const box = screen.getByRole('checkbox');
  expect(box).toHaveAttribute('aria-checked', 'mixed');
  expect(box).toHaveAttribute('data-indeterminate');
});

it('sets data-checked and data-unchecked', async () => {
  render(<Checkbox label="A" />);
  const box = screen.getByRole('checkbox');
  expect(box).toHaveAttribute('data-unchecked');
  await userEvent.click(box);
  expect(box).toHaveAttribute('data-checked');
});

it('ref goes to the focusable root and inputRef to the hidden input', () => {
  const ref = createRef<HTMLElement>();
  const inputRef = createRef<HTMLInputElement>();
  render(
    <Checkbox label="A" ref={ref} inputRef={inputRef} name="a" value="yes" />,
  );
  expect(ref.current).toBe(screen.getByRole('checkbox'));
  expect(inputRef.current?.tagName).toBe('INPUT');
  expect(inputRef.current).toHaveAttribute('name', 'a');
});

it('className and layout props go on the outer wrapper', () => {
  const { container } = render(
    <Checkbox label="A" className="extra" marginTop="2" />,
  );
  expect(container.firstElementChild).toHaveClass('extra');
  expect(screen.getByRole('checkbox')).not.toHaveClass('extra');
});

it('with no label, className goes on the root', () => {
  render(<Checkbox aria-label="A" className="extra" />);
  expect(screen.getByRole('checkbox')).toHaveClass('extra');
});

it('inherits invalid, disabled, and required from Field', () => {
  render(
    <Field label="Terms" error="Required" disabled required>
      <Checkbox label="I agree" />
    </Field>,
  );
  const box = screen.getByRole('checkbox', { name: 'I agree' });
  expect(box).toHaveAttribute('aria-invalid', 'true');
  expect(box).toHaveAttribute('data-invalid');
  expect(box).toHaveAttribute('aria-disabled', 'true');
  expect(box).toHaveAttribute('data-disabled');
  expect(box).toHaveAttribute('aria-required', 'true');
});

it('required does not set the native attribute on the hidden input', () => {
  const inputRef = createRef<HTMLInputElement>();
  render(<Checkbox label="A" required inputRef={inputRef} />);
  expect(inputRef.current).not.toBeRequired();
  expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
});
