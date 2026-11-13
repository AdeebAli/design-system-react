import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { box } from '../Box';
import { Field } from '../Field';
import * as styles from './FileUpload.css';
import { FileUpload } from './index';

const file = (name: string, size = 10, type = '') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });

// jsdom's file input has no accessible role, so find it by type.
const input = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;
const root = () => input().closest<HTMLElement>(`.${styles.root}`)!;

// Browsers don't filter dropped files, and the component checks `accept`
// itself, so the picker's filter is off here.
const user = () => userEvent.setup({ applyAccept: false });

it('is a native file input with the native attributes', () => {
  render(
    <FileUpload
      aria-label="Attachments"
      multiple
      accept=".pdf,image/png"
      name="attachments"
      capture="environment"
    />,
  );
  expect(input()).toHaveAttribute('multiple');
  expect(input()).toHaveAttribute('accept', '.pdf,image/png');
  expect(input()).toHaveAttribute('name', 'attachments');
  expect(input()).toHaveAttribute('capture', 'environment');
});

it('onValueChange receives the files', async () => {
  const onValueChange = vi.fn();
  render(
    <FileUpload aria-label="Files" multiple onValueChange={onValueChange} />,
  );
  const a = file('a.txt');
  const b = file('b.txt');
  await user().upload(input(), [a, b]);
  expect(onValueChange.mock.calls).toEqual([[[a, b]]]);
});

it('uncontrolled: a second pick adds with multiple', async () => {
  const onValueChange = vi.fn();
  render(
    <FileUpload aria-label="Files" multiple onValueChange={onValueChange} />,
  );
  const a = file('a.txt');
  const b = file('b.txt');
  await user().upload(input(), a);
  await user().upload(input(), b);
  expect(onValueChange.mock.calls.at(-1)).toEqual([[a, b]]);
});

it('controlled: a pick merges into the value prop', async () => {
  const onValueChange = vi.fn();
  const a = file('a.txt');
  const b = file('b.txt');
  render(
    <FileUpload
      aria-label="Files"
      multiple
      value={[a]}
      onValueChange={onValueChange}
    />,
  );
  await user().upload(input(), b);
  expect(onValueChange.mock.calls).toEqual([[[a, b]]]);
});

it('defaultValue is the starting list', async () => {
  const onValueChange = vi.fn();
  const a = file('a.txt');
  const b = file('b.txt');
  render(
    <FileUpload
      aria-label="Files"
      multiple
      defaultValue={[a]}
      onValueChange={onValueChange}
    />,
  );
  await user().upload(input(), b);
  expect(onValueChange.mock.calls).toEqual([[[a, b]]]);
});

it('onReject receives the rejections, and rejected files are not added', async () => {
  const onReject = vi.fn();
  const onValueChange = vi.fn();
  render(
    <FileUpload
      aria-label="Files"
      multiple
      accept=".pdf"
      maxSize={100}
      onReject={onReject}
      onValueChange={onValueChange}
    />,
  );
  const ok = file('ok.pdf', 50);
  const exe = file('virus.exe', 50);
  const big = file('big.pdf', 500);
  await user().upload(input(), [ok, exe, big]);
  expect(onReject.mock.calls).toEqual([
    [
      [
        { file: exe, reason: 'type' },
        { file: big, reason: 'size' },
      ],
    ],
  ]);
  expect(onValueChange.mock.calls).toEqual([[[ok]]]);
});

it('does not call onReject when nothing is rejected', async () => {
  const onReject = vi.fn();
  render(<FileUpload aria-label="Files" onReject={onReject} />);
  await user().upload(input(), file('a.txt'));
  expect(onReject).not.toHaveBeenCalled();
});

it('maxFiles rejects by count', async () => {
  const onReject = vi.fn();
  render(
    <FileUpload aria-label="Files" multiple maxFiles={1} onReject={onReject} />,
  );
  const a = file('a.txt');
  const b = file('b.txt');
  await user().upload(input(), [a, b]);
  expect(onReject.mock.calls).toEqual([[[{ file: b, reason: 'count' }]]]);
});

it('required sets aria-required and no required attribute', () => {
  render(<FileUpload aria-label="Files" required />);
  expect(input()).toHaveAttribute('aria-required', 'true');
  expect(input()).not.toHaveAttribute('required');
});

it("Field's label, hint, required, invalid, and disabled reach the input", () => {
  render(
    <Field
      label="Attachments"
      hint="PDF only"
      error="Too big"
      required
      disabled
    >
      <FileUpload />
    </Field>,
  );
  expect(screen.getByLabelText(/Attachments/)).toBe(input());
  expect(input()).toHaveAccessibleDescription(/PDF only/);
  expect(input()).toHaveAttribute('aria-required', 'true');
  expect(input()).not.toHaveAttribute('required');
  expect(input()).toHaveAttribute('aria-invalid', 'true');
  expect(input()).toBeDisabled();
  expect(root()).toHaveAttribute('data-invalid');
  expect(root()).toHaveAttribute('data-disabled');
});

it('invalid and disabled props set the root state outside a Field', () => {
  render(<FileUpload aria-label="Files" invalid disabled />);
  expect(input()).toHaveAttribute('aria-invalid', 'true');
  expect(input()).toBeDisabled();
  expect(root()).toHaveAttribute('data-invalid');
  expect(root()).toHaveAttribute('data-disabled');
});

it('has no state attributes by default', () => {
  render(<FileUpload aria-label="Files" />);
  expect(root()).not.toHaveAttribute('data-invalid');
  expect(root()).not.toHaveAttribute('data-disabled');
  expect(root()).not.toHaveAttribute('data-dragging');
});

it('ref goes to the input; className, style, and layout props to the root', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <FileUpload
      ref={ref}
      aria-label="Files"
      className="custom"
      style={{ maxWidth: 300 }}
      marginTop="4"
    />,
  );
  expect(ref.current).toBe(input());
  expect(root()).toHaveClass('custom');
  expect(root()).toHaveStyle({ maxWidth: '300px' });
  expect(root().className.split(' ')).toContain(box({ marginTop: '4' }));
  expect(input()).not.toHaveClass('custom');
});

it('the dropzone shows the prompt, and labels.prompt replaces it', () => {
  const { rerender } = render(<FileUpload aria-label="Files" />);
  expect(screen.getByText('Drop files here or browse')).toBeInTheDocument();
  rerender(
    <FileUpload
      aria-label="Files"
      labels={{ prompt: 'Déposez des fichiers' }}
    />,
  );
  expect(screen.getByText('Déposez des fichiers')).toBeInTheDocument();
});

it('the button variant shows labels.browse and no prompt', () => {
  const { rerender } = render(
    <FileUpload aria-label="Files" variant="button" />,
  );
  expect(screen.getByText('Choose files')).toBeInTheDocument();
  expect(screen.queryByText('Drop files here or browse')).toBeNull();
  rerender(
    <FileUpload
      aria-label="Files"
      variant="button"
      labels={{ browse: 'Parcourir' }}
    />,
  );
  expect(screen.getByText('Parcourir')).toBeInTheDocument();
});

describe('dropping', () => {
  const drag = (
    type: 'dragEnter' | 'dragOver' | 'dragLeave' | 'drop',
    files: File[] = [],
  ) =>
    fireEvent[type](root(), {
      dataTransfer: { files, types: ['Files'] },
    });

  it('sets data-dragging while dragging over, and clears it on leave', () => {
    render(<FileUpload aria-label="Files" />);
    drag('dragEnter');
    expect(root()).toHaveAttribute('data-dragging');
    drag('dragLeave');
    expect(root()).not.toHaveAttribute('data-dragging');
  });

  it('a drop adds the files and clears data-dragging', () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload aria-label="Files" multiple onValueChange={onValueChange} />,
    );
    const a = file('a.txt');
    drag('dragEnter');
    drag('drop', [a]);
    expect(onValueChange.mock.calls).toEqual([[[a]]]);
    expect(root()).not.toHaveAttribute('data-dragging');
  });

  it('dragover is allowed, so the browser lets the drop through', () => {
    render(<FileUpload aria-label="Files" />);
    const event = new Event('dragover', { bubbles: true, cancelable: true });
    root().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('a disabled dropzone ignores drops', () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload aria-label="Files" disabled onValueChange={onValueChange} />,
    );
    drag('dragEnter');
    expect(root()).not.toHaveAttribute('data-dragging');
    drag('drop', [file('a.txt')]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('the button variant has no drop target', () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload
        aria-label="Files"
        variant="button"
        onValueChange={onValueChange}
      />,
    );
    drag('dragEnter');
    expect(root()).not.toHaveAttribute('data-dragging');
    drag('drop', [file('a.txt')]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
