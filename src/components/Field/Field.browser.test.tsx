import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Field } from './index';

it("the browser's validity doesn't mark a field invalid", async () => {
  const { container } = render(
    <form onSubmit={(e) => e.preventDefault()}>
      <Field label="Email">
        <Input type="email" required />
      </Field>
      <Field label="Name">
        <Input />
      </Field>
      <button type="submit">Send</button>
    </form>,
  );
  const email = screen.getByRole('textbox', { name: 'Email' });
  await userEvent.type(email, 'x');
  await userEvent.click(screen.getByRole('textbox', { name: 'Name' }));
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  await userEvent.clear(email);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(email).not.toHaveAttribute('aria-invalid');
  expect(container.querySelector('[data-invalid]')).toBeNull();
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

it('shows the focus ring around the Input wrapper on keyboard focus', async () => {
  render(<Input aria-label="q" />);
  await userEvent.tab();
  const wrapper = screen.getByRole('textbox').parentElement!;
  expect(getComputedStyle(wrapper).outlineStyle).toBe('solid');
});

it.each(['sm', 'md', 'lg'] as const)(
  'Input size %s uses the control height',
  (size) => {
    render(<Input aria-label="q" size={size} />);
    const px = { sm: 28, md: 36, lg: 44 }[size];
    expect(
      screen.getByRole('textbox').parentElement!.getBoundingClientRect().height,
    ).toBe(px);
  },
);

it('the hint stays visible with an error, in label, control, hint, error order', () => {
  render(
    <Field label="Seats" hint="Whole number" error="Enter a number">
      <Input />
    </Field>,
  );
  const tops = ['Seats', 'Whole number', 'Enter a number'].map(
    (t) => screen.getByText(t).getBoundingClientRect().top,
  );
  const control = screen.getByRole('textbox').getBoundingClientRect().top;
  expect(tops[0]).toBeLessThan(control);
  expect(control).toBeLessThan(tops[1]!);
  expect(tops[1]).toBeLessThan(tops[2]!);
});
