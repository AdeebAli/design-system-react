import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { box } from '../Box';
import { Field } from '../Field';
import type { Option } from '../Select';
import { MultiSelect } from './index';

const topics: Option[] = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'legal', label: 'Legal', disabled: true },
];

const trigger = () => screen.getByRole('combobox');

describe('default (button)', () => {
  it('shows the first selected label and a count', () => {
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        defaultValue={['design', 'research', 'writing']}
      />,
    );
    expect(trigger()).toHaveTextContent('Design+2');
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('shows one label with no count', () => {
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        defaultValue={['research']}
      />,
    );
    expect(trigger().textContent).toBe('Research');
  });

  it('[] shows the placeholder', () => {
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        value={[]}
        placeholder="Choose topics"
      />,
    );
    expect(trigger()).toHaveTextContent('Choose topics');
  });

  it('labels.more formats the count', () => {
    render(
      <MultiSelect
        aria-label="Sujets"
        options={topics}
        defaultValue={['design', 'research']}
        labels={{ more: 'et {count}' }}
      />,
    );
    expect(screen.getByText('et 1')).toBeInTheDocument();
  });

  it('uncontrolled: onValueChange receives the whole list', async () => {
    const onValueChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(trigger());
    await userEvent.click(
      await screen.findByRole('option', { name: 'Design' }),
    );
    await userEvent.click(screen.getByRole('option', { name: 'Writing' }));
    expect(onValueChange.mock.calls).toEqual([
      [['design']],
      [['design', 'writing']],
    ]);
    await waitFor(() => expect(trigger()).toHaveTextContent('Design+1'));
  });

  it('controlled: the display follows the prop', async () => {
    const onValueChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        value={['research']}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(trigger());
    await userEvent.click(
      await screen.findByRole('option', { name: 'Design' }),
    );
    expect(onValueChange).toHaveBeenCalledWith(['research', 'design']);
    expect(trigger().textContent).toBe('Research');
  });

  it('name submits one entry per value', () => {
    const { container } = render(
      <form>
        <MultiSelect
          aria-label="Topics"
          options={topics}
          name="topics"
          defaultValue={['design', 'writing']}
        />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).getAll('topics')).toEqual(['design', 'writing']);
  });

  it('describes the trigger with every selected label, plus the Field hint and error', () => {
    render(
      <Field label="Topics" hint="Pick a few" error="Too many">
        <MultiSelect
          options={topics}
          defaultValue={['design', 'research', 'writing']}
        />
      </Field>,
    );
    const control = screen.getByRole('combobox', { name: 'Topics' });
    const ids = control.getAttribute('aria-describedby')!.split(' ');
    const texts = ids.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toContain('Design, Research, Writing');
    expect(texts).toContain('Pick a few');
    expect(texts).toContain('Too many');
  });

  it('has no selection description when nothing is selected', () => {
    render(<MultiSelect aria-label="Topics" options={topics} />);
    expect(trigger()).not.toHaveAttribute('aria-describedby');
  });

  it('Field invalid, disabled, and required reach the trigger', () => {
    render(
      <Field label="Topics" error="Pick one" disabled required>
        <MultiSelect options={topics} />
      </Field>,
    );
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('aria-required', 'true');
    expect(trigger()).toHaveAttribute('data-invalid');
    expect(trigger()).toHaveAttribute('data-disabled');
  });

  it('invalid and disabled props work outside a Field', () => {
    render(
      <MultiSelect aria-label="Topics" options={topics} invalid disabled />,
    );
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('data-invalid');
    expect(trigger()).toHaveAttribute('data-disabled');
  });

  it('sets data-popup-open on the trigger, and option state attributes', async () => {
    render(
      <MultiSelect
        aria-label="Topics"
        options={topics}
        defaultValue={['design']}
      />,
    );
    await userEvent.click(trigger());
    await waitFor(() => expect(trigger()).toHaveAttribute('data-popup-open'));
    expect(
      await screen.findByRole('option', { name: 'Design' }),
    ).toHaveAttribute('data-selected');
    expect(screen.getByRole('option', { name: 'Legal' })).toHaveAttribute(
      'data-disabled',
    );
  });

  it('renders group labels', async () => {
    render(
      <MultiSelect
        aria-label="Topics"
        options={[{ label: 'Craft', options: [topics[0]!, topics[2]!] }]}
      />,
    );
    await userEvent.click(trigger());
    const craft = await screen.findByRole('group', { name: 'Craft' });
    expect(craft).toContainElement(
      screen.getByRole('option', { name: 'Writing' }),
    );
  });

  it('ref, className, style, and layout props go to the trigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <MultiSelect
        ref={ref}
        aria-label="Topics"
        options={topics}
        className="custom"
        style={{ maxWidth: 300 }}
        marginTop="4"
      />,
    );
    expect(ref.current).toBe(trigger());
    expect(trigger()).toHaveClass('custom');
    expect(trigger()).toHaveStyle({ maxWidth: '300px' });
    expect(trigger().className.split(' ')).toContain(box({ marginTop: '4' }));
  });

  it('uncontrolled: the description follows a pick', async () => {
    render(<MultiSelect aria-label="Topics" options={topics} />);
    await userEvent.click(trigger());
    await userEvent.click(
      await screen.findByRole('option', { name: 'Writing' }),
    );
    await waitFor(() =>
      expect(trigger()).toHaveAccessibleDescription('Writing'),
    );
  });

  it("keeps the project's own aria-describedby", () => {
    render(
      <>
        <p id="note">Shown to editors</p>
        <MultiSelect
          aria-label="Topics"
          aria-describedby="note"
          options={topics}
          defaultValue={['design']}
        />
      </>,
    );
    expect(trigger()).toHaveAccessibleDescription('Shown to editors Design');
  });
});

it('an explicit searchable={false} renders the button with no unknown-prop warning', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  render(
    <MultiSelect aria-label="Topics" options={topics} searchable={false} />,
  );
  expect(trigger().tagName).toBe('BUTTON');
  expect(error).not.toHaveBeenCalled();
  error.mockRestore();
});
