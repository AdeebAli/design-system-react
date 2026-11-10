import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { Field } from '../Field';
import { RadioGroup } from '../RadioGroup';
import { Radio } from './index';

function Plan(props: { onValueChange?: (v: string) => void; value?: string }) {
  return (
    <Field label="Plan">
      <RadioGroup
        defaultValue={props.value ? undefined : 'monthly'}
        name="plan"
        {...props}
      >
        <Radio value="monthly" label="Monthly" />
        <Radio value="annual" label="Annual" hint="Two months free" />
        <Radio value="lifetime" label="Lifetime" disabled />
      </RadioGroup>
    </Field>
  );
}

it('a Radio is named by its label and the group by the Field', () => {
  render(<Plan />);
  expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  expect(
    screen.getByRole('radio', { name: 'Annual' }),
  ).toHaveAccessibleDescription('Two months free');
});

it('arrow keys move selection; onValueChange receives the value', async () => {
  const onValueChange = vi.fn();
  render(<Plan onValueChange={onValueChange} />);
  await userEvent.tab();
  expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
  expect(onValueChange.mock.calls[0]).toEqual(['annual']);
});

it('clicking a label selects; a disabled radio cannot be selected', async () => {
  render(<Plan />);
  await userEvent.click(screen.getByText('Annual'));
  expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
  await userEvent.click(screen.getByText('Lifetime'));
  expect(screen.getByRole('radio', { name: 'Lifetime' })).not.toBeChecked();
  expect(screen.getByRole('radio', { name: 'Lifetime' })).toHaveAttribute(
    'data-disabled',
  );
});

it('works controlled', async () => {
  const onValueChange = vi.fn();
  render(<Plan value="annual" onValueChange={onValueChange} />);
  await userEvent.click(screen.getByText('Monthly'));
  expect(onValueChange).toHaveBeenCalledWith('monthly');
  expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
});

it('inherits invalid, disabled, and required from Field', () => {
  render(
    <Field label="Plan" error="Choose a plan" disabled required>
      <RadioGroup>
        <Radio value="m" label="Monthly" />
      </RadioGroup>
    </Field>,
  );
  const group = screen.getByRole('radiogroup', { name: 'Plan' });
  expect(group).toHaveAttribute('aria-required', 'true');
  expect(group).toHaveAttribute('aria-invalid', 'true');
  expect(group).toHaveAccessibleDescription('Choose a plan');
  expect(screen.getByRole('radio')).toHaveAttribute('data-disabled');
  expect(screen.getByRole('radio')).toHaveAttribute('data-invalid');
});

it('sets data-checked and data-unchecked', () => {
  render(<Plan />);
  expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveAttribute(
    'data-checked',
  );
  expect(screen.getByRole('radio', { name: 'Annual' })).toHaveAttribute(
    'data-unchecked',
  );
});

it('a disabled RadioGroup marks its radio labels disabled', () => {
  render(
    <RadioGroup disabled aria-label="Plan">
      <Radio value="m" label="Monthly" />
    </RadioGroup>,
  );
  expect(screen.getByText('Monthly').closest('label')).toHaveAttribute(
    'data-disabled',
  );
});

it('a controlled null value selects nothing, and stays controlled', async () => {
  const onValueChange = vi.fn();
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { rerender } = render(
    <RadioGroup aria-label="Plan" value={null} onValueChange={onValueChange}>
      <Radio value="m" label="Monthly" />
      <Radio value="a" label="Annual" />
    </RadioGroup>,
  );
  expect(screen.getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
  expect(screen.getByRole('radio', { name: 'Annual' })).not.toBeChecked();
  await userEvent.click(screen.getByText('Annual'));
  expect(onValueChange).toHaveBeenCalledWith('a');
  expect(screen.getByRole('radio', { name: 'Annual' })).not.toBeChecked();
  rerender(
    <RadioGroup aria-label="Plan" value="a" onValueChange={onValueChange}>
      <Radio value="m" label="Monthly" />
      <Radio value="a" label="Annual" />
    </RadioGroup>,
  );
  expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
  expect(errors).not.toHaveBeenCalled();
  errors.mockRestore();
});

describe("the group's ref", () => {
  it('is the group element, and focusing it focuses the checked radio', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field label="Plan">
        <RadioGroup ref={ref} defaultValue="annual">
          <Radio value="monthly" label="Monthly" />
          <Radio value="annual" label="Annual" />
        </RadioGroup>
      </Field>,
    );
    expect(ref.current).toBe(screen.getByRole('radiogroup', { name: 'Plan' }));
    ref.current!.focus();
    expect(screen.getByRole('radio', { name: 'Annual' })).toHaveFocus();
  });

  it('with nothing checked, focusing it focuses the first enabled radio', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field label="Plan">
        <RadioGroup ref={ref} defaultValue={null}>
          <Radio value="lifetime" label="Lifetime" disabled />
          <Radio value="monthly" label="Monthly" />
        </RadioGroup>
      </Field>,
    );
    ref.current!.focus();
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
  });
});
