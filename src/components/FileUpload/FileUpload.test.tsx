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

describe('file list', () => {
  const pdf = file('report.pdf', 1536, 'application/pdf');
  const png = file('chart.png', 2048, 'image/png');
  const items = () => screen.getAllByRole('listitem');

  it('lists each file with its name, size, and a remove button', () => {
    render(
      <FileUpload aria-label="Files" multiple defaultValue={[pdf, png]} />,
    );
    const list = screen.getByRole('list');
    expect(items()).toHaveLength(2);
    expect(list).toContainElement(items()[0]!);
    expect(items()[0]).toHaveTextContent('report.pdf');
    expect(items()[0]).toHaveTextContent('1.5 kB');
    expect(items()[1]).toHaveTextContent('chart.png');
    expect(items()[1]).toHaveTextContent('2 kB');
    expect(
      screen.getByRole('button', { name: 'Remove report.pdf' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove chart.png' }),
    ).toBeInTheDocument();
  });

  it('labels.remove names the remove buttons', () => {
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        labels={{ remove: 'Retirer {name}' }}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Retirer report.pdf' }),
    ).toBeInTheDocument();
  });

  it('a long name keeps the full name in the DOM and in title', () => {
    const long = file(`${'a'.repeat(196)}.pdf`);
    render(<FileUpload aria-label="Files" defaultValue={[long]} />);
    const name = screen.getByText(long.name);
    expect(name).toHaveAttribute('title', long.name);
  });

  it('removing a file calls onValueChange without it', async () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload
        aria-label="Files"
        multiple
        defaultValue={[pdf, png]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove report.pdf' }),
    );
    expect(onValueChange.mock.calls).toEqual([[[png]]]);
    expect(items()).toHaveLength(1);
  });

  it('a removed file can be picked again', async () => {
    const onValueChange = vi.fn();
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove report.pdf' }),
    );
    await user().upload(input(), pdf);
    expect(onValueChange.mock.calls).toEqual([[[]], [[pdf]]]);
  });

  it('a disabled FileUpload disables the remove buttons', () => {
    render(<FileUpload aria-label="Files" defaultValue={[pdf]} disabled />);
    expect(
      screen.getByRole('button', { name: 'Remove report.pdf' }),
    ).toBeDisabled();
  });

  it('hideFileList renders no list', () => {
    render(<FileUpload aria-label="Files" defaultValue={[pdf]} hideFileList />);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByText('report.pdf')).toBeNull();
  });

  it('with no status, a file shows only its name, size, and remove button', () => {
    render(<FileUpload aria-label="Files" defaultValue={[pdf]} />);
    expect(items()[0]).not.toHaveAttribute('data-status');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('uploading shows a Progress named with the file name', () => {
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading', progress: 40 })}
      />,
    );
    const bar = screen.getByRole('progressbar', {
      name: 'Uploading report.pdf',
    });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(items()[0]).toHaveAttribute('data-status', 'uploading');
  });

  it('uploading with no progress is indeterminate', () => {
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading' })}
      />,
    );
    expect(screen.getByRole('progressbar')).not.toHaveAttribute(
      'aria-valuenow',
    );
  });

  it('done shows a success icon and text', () => {
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'done' })}
      />,
    );
    expect(items()[0]).toHaveAttribute('data-status', 'done');
    expect(items()[0]).toHaveTextContent('Uploaded');
    expect(items()[0]!.querySelector(`.${styles.doneIcon}`)).not.toBeNull();
  });

  it('error shows the error text and an icon, or labels.error without one', () => {
    const { rerender } = render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'error', error: 'Server said no' })}
      />,
    );
    expect(items()[0]).toHaveAttribute('data-status', 'error');
    expect(items()[0]).toHaveTextContent('Server said no');
    expect(items()[0]!.querySelector(`.${styles.errorIcon}`)).not.toBeNull();
    rerender(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'error' })}
      />,
    );
    expect(items()[0]).toHaveTextContent('Upload failed');
  });
});

describe('announcements', () => {
  const pdf = file('report.pdf');
  const png = file('chart.png');
  const status = () => screen.getByRole('status');

  it('the status element is mounted and empty at first', () => {
    render(<FileUpload aria-label="Files" defaultValue={[pdf]} />);
    expect(status()).toHaveTextContent('');
  });

  it('announces the count when the files change, from the same element', async () => {
    render(<FileUpload aria-label="Files" multiple />);
    const before = status();
    await user().upload(input(), [pdf, png]);
    expect(status()).toHaveTextContent('2 files selected');
    expect(status()).toBe(before);
  });

  it('labels.selected formats the count', async () => {
    render(
      <FileUpload
        aria-label="Files"
        multiple
        labels={{ selected: '{count} fichiers' }}
      />,
    );
    await user().upload(input(), [pdf, png]);
    expect(status()).toHaveTextContent('2 fichiers');
  });

  it('announces a change to done, then to error', () => {
    const { rerender } = render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading' })}
      />,
    );
    expect(status()).toHaveTextContent('');
    rerender(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'done' })}
      />,
    );
    expect(status()).toHaveTextContent('report.pdf: Uploaded');
    rerender(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'error', error: 'Too slow' })}
      />,
    );
    expect(status()).toHaveTextContent('report.pdf: Too slow');
  });

  it('does not announce uploading progress', () => {
    const { rerender } = render(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading', progress: 10 })}
      />,
    );
    rerender(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading', progress: 60 })}
      />,
    );
    expect(status()).toHaveTextContent('');
  });

  it('keeps the status element with hideFileList', async () => {
    render(<FileUpload aria-label="Files" multiple hideFileList />);
    await user().upload(input(), [pdf, png]);
    expect(status()).toHaveTextContent('2 files selected');
  });

  it('does not announce a file starting to upload', () => {
    const { rerender } = render(
      <FileUpload aria-label="Files" defaultValue={[pdf]} />,
    );
    rerender(
      <FileUpload
        aria-label="Files"
        defaultValue={[pdf]}
        getFileStatus={() => ({ status: 'uploading' })}
      />,
    );
    expect(status()).toHaveTextContent('');
  });
});
