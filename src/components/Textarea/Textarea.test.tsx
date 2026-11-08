import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
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
