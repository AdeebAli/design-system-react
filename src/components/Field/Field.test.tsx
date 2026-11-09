import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Field } from './index';

it('associates label, hint, and error with an Input', () => {
  render(
    <Field label="Seats" hint="Whole number" error="Enter a number">
      <Input />
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Seats' });
  expect(input).toHaveAccessibleDescription('Whole number Enter a number');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

it('associates label and hint with a Textarea', () => {
  render(
    <Field label="Notes" hint="Optional">
      <Textarea />
    </Field>,
  );
  expect(
    screen.getByRole('textbox', { name: 'Notes' }),
  ).toHaveAccessibleDescription('Optional');
});

it('removes the error and its reference when error clears', () => {
  const { rerender } = render(
    <Field label="S" hint="Hint" error="Bad">
      <Input />
    </Field>,
  );
  rerender(
    <Field label="S" hint="Hint">
      <Input />
    </Field>,
  );
  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(screen.queryByText('Bad')).toBeNull();
  const ids = (input.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean);
  for (const id of ids) expect(document.getElementById(id)).not.toBeNull();
  expect(input).toHaveAccessibleDescription('Hint');
});

it('mounts no error element without an error', () => {
  const { container } = render(
    <Field label="S">
      <Input />
    </Field>,
  );
  expect(container.querySelectorAll('[id]').length).toBeGreaterThan(0);
  expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
});

it('the invalid prop marks the field invalid without an error message', () => {
  render(
    <Field label="S" invalid>
      <Input />
    </Field>,
  );
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
});

it('required sets aria-required, not required, and is not invalid', () => {
  const { container } = render(
    <Field label="Name" required>
      <Input />
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(input).toHaveAttribute('aria-required', 'true');
  expect(input).not.toHaveAttribute('required');
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(container.firstElementChild).not.toHaveAttribute('data-invalid');
});

it('the required * is aria-hidden', () => {
  render(
    <Field label="Name" required>
      <Input />
    </Field>,
  );
  const star = screen.getByText('*');
  expect(star).toHaveAttribute('aria-hidden', 'true');
});

it('disabled reaches the control and sets data-disabled on root', () => {
  const { container } = render(
    <Field label="S" disabled>
      <Input />
    </Field>,
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(container.firstElementChild).toHaveAttribute('data-disabled');
});

it('sets data-invalid on the root when there is an error', () => {
  const { container } = render(
    <Field label="S" error="Bad">
      <Input />
    </Field>,
  );
  expect(container.firstElementChild).toHaveAttribute('data-invalid');
});

it('clicking the label focuses an Input and a Textarea', async () => {
  render(
    <>
      <Field label="One">
        <Input />
      </Field>
      <Field label="Two">
        <Textarea />
      </Field>
    </>,
  );
  await userEvent.click(screen.getByText('One'));
  expect(screen.getByRole('textbox', { name: 'One' })).toHaveFocus();
  await userEvent.click(screen.getByText('Two'));
  expect(screen.getByRole('textbox', { name: 'Two' })).toHaveFocus();
});

it('accepts layout props, className, and style on the root', () => {
  const { container } = render(
    <Field label="S" marginTop="4" className="extra" style={{ color: 'red' }}>
      <Input />
    </Field>,
  );
  const root = container.firstElementChild as HTMLElement;
  expect(root).toHaveClass('extra');
  expect(root.style.color).toBe('red');
});
