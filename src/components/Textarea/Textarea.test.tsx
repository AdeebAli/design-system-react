import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { Field } from '../Field';
import * as styles from '../Input/Input.css';
import { Textarea } from './index';

it('ref, className, and native props go to the textarea', () => {
  const ref = createRef<HTMLTextAreaElement>();
  render(
    <Textarea
      ref={ref}
      aria-label="n"
      name="notes"
      className="extra"
      rows={4}
    />,
  );
  const t = screen.getByRole('textbox');
  expect(t.tagName).toBe('TEXTAREA');
  expect(ref.current).toBe(t);
  expect(t).toHaveClass('extra');
  expect(t).toHaveAttribute('rows', '4');
});

it('resize none applies its class', () => {
  render(<Textarea aria-label="n" resize="none" />);
  expect(screen.getByRole('textbox').className).toContain(styles.resize.none);
});

it('sets data-invalid and data-disabled', () => {
  render(<Textarea aria-label="n" invalid disabled />);
  const t = screen.getByRole('textbox');
  expect(t).toHaveAttribute('data-invalid');
  expect(t).toHaveAttribute('data-disabled');
  expect(t).toHaveAttribute('aria-invalid', 'true');
});

it('disabled={false} inside a disabled Field stays disabled, with disabled styling', () => {
  render(
    <Field label="Notes" disabled>
      <Textarea disabled={false} />
    </Field>,
  );
  const textarea = screen.getByRole('textbox');
  expect(textarea).toBeDisabled();
  expect(textarea).toHaveAttribute('data-disabled');
});

it('a Field label names a Textarea that has its own id', () => {
  render(
    <Field label="Notes">
      <Textarea id="notes" />
    </Field>,
  );
  const textarea = screen.getByLabelText('Notes');
  expect(textarea.tagName).toBe('TEXTAREA');
  expect(textarea).toHaveAttribute('id', 'notes');
});

it('a controlled Textarea reset by the parent clears data-filled', async () => {
  function Controlled() {
    const [value, setValue] = useState('');
    return (
      <Field label="Notes">
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" onClick={() => setValue('')}>
          Reset
        </button>
      </Field>
    );
  }
  render(<Controlled />);
  const textarea = screen.getByRole('textbox', { name: 'Notes' });
  await userEvent.type(textarea, 'hi');
  expect(textarea).toHaveValue('hi');
  expect(textarea).toHaveAttribute('data-filled');
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(textarea).toHaveValue('');
  expect(textarea).not.toHaveAttribute('data-filled');
});
