import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { FileUpload, type FileStatus } from './FileUpload';
import type { FileRejection } from './mergeFiles';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/Advanced inputs/FileUpload',
  component: FileUpload,
  args: { 'aria-label': 'Attachments' },
  parameters: {
    docs: {
      description: {
        component:
          'Picks files, by browsing or dropping. A real file input, visually hidden over the control, does the picking, so it works by keyboard, before hydration, and with phones’ camera and file pickers. It doesn’t send files: the project uploads them and reports each file’s status through `getFileStatus`. `value` is the source of truth, and the input’s `files` always match it, so a form submits what’s displayed. **Checking `accept` and `maxSize` here is a convenience, not security: the server must check every upload.** `ref` and native attributes, such as `capture`, go to the input; `className`, `style`, and layout props go to the root.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Dropzone: Story = { args: { multiple: true } };

export const Button: Story = { args: { variant: 'button', multiple: true } };

function WithRejections() {
  const [error, setError] = useState<string>();
  const describe = (rejections: FileRejection[]) =>
    rejections
      .map(({ file, reason }) =>
        reason === 'type'
          ? `${file.name} isn’t a PDF or PNG`
          : reason === 'size'
            ? `${file.name} is over 10 MB`
            : `${file.name} is one too many`,
      )
      .join('. ');
  return (
    <Field
      label="Attachments"
      hint="PDF or PNG, up to 10 MB, at most 3 files"
      error={error}
    >
      <FileUpload
        multiple
        accept=".pdf,image/png"
        maxSize={10_000_000}
        maxFiles={3}
        onValueChange={() => setError(undefined)}
        onReject={(rejections) => setError(describe(rejections))}
      />
    </Field>
  );
}

export const InAField: Story = {
  name: 'In a Field, with rejections',
  parameters: {
    docs: {
      description: {
        story:
          'Rejected files aren’t added, and go to `onReject` with a reason. The component shows no message itself: the project passes one to `Field`’s `error`.',
      },
    },
  },
  render: () => <WithRejections />,
};

export const States: Story = {
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Required" required>
        <FileUpload />
      </Field>
      <Field label="Invalid" error="Add at least one file">
        <FileUpload />
      </Field>
    </Stack>
  ),
};

/**
 * A disabled control's text uses `fg.disabled`, which WCAG 1.4.3 exempts as
 * part of an inactive component. Axe can't tell: only the hidden input is
 * disabled, not the text beside it. So this story, which holds only disabled
 * controls, turns off just `color-contrast`.
 */
export const Disabled: Story = {
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
  render: () => (
    <Stack gap="4" maxWidth="container.sm">
      <Field label="Disabled" disabled>
        <FileUpload />
      </Field>
      <Field label="Disabled button" disabled>
        <FileUpload variant="button" />
      </Field>
    </Stack>
  ),
};

const sample = (name: string, size: number) =>
  new File([new Uint8Array(size)], name, { lastModified: 1 });

const samples = [
  sample('quarterly-report.pdf', 1_250_000),
  sample('diagram.png', 340_000),
  sample('notes.txt', 2_100),
  sample(
    'a-file-with-a-very-long-name-that-has-to-be-truncated-somewhere.pdf',
    48_000,
  ),
];

const sampleStatuses = new Map<File, FileStatus>([
  [samples[0]!, { status: 'uploading', progress: 40 }],
  [samples[1]!, { status: 'done' }],
  [samples[2]!, { status: 'error', error: 'The server rejected this file' }],
]);

export const FileStatuses: Story = {
  name: 'File list, every status',
  parameters: {
    docs: {
      description: {
        story:
          '`getFileStatus` adds a `Progress` bar while uploading, a success icon when done, and the error’s text with an icon on failure. With no status, a file shows only its name and size. Long names truncate, with the full name in `title`. Done and error changes are announced.',
      },
    },
  },
  args: {
    multiple: true,
    defaultValue: samples,
    getFileStatus: (file) => sampleStatuses.get(file),
  },
};

export const ButtonWithFiles: Story = {
  name: 'Button, with files',
  args: {
    variant: 'button',
    multiple: true,
    defaultValue: samples.slice(0, 2),
  },
};

/** Stands in for an upload: reports progress, then finishes. */
function useFakeUploads(files: File[]) {
  const [statuses, setStatuses] = useState(new Map<File, FileStatus>());
  const started = useRef(new Set<File>());
  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    for (const file of files) {
      if (started.current.has(file)) continue;
      started.current.add(file);
      let progress = 0;
      const timer = setInterval(() => {
        progress += 20;
        setStatuses((current) =>
          new Map(current).set(
            file,
            progress >= 100
              ? { status: 'done' }
              : { status: 'uploading', progress },
          ),
        );
        if (progress >= 100) clearInterval(timer);
      }, 400);
      timers.push(timer);
    }
    return () => timers.forEach(clearInterval);
  }, [files]);
  return statuses;
}

function UploadWithProgress() {
  const [files, setFiles] = useState<File[]>([]);
  const statuses = useFakeUploads(files);
  return (
    <Field label="Attachments" hint="Each file uploads as soon as it’s added">
      <FileUpload
        multiple
        value={files}
        onValueChange={setFiles}
        getFileStatus={(file) => statuses.get(file)}
      />
    </Field>
  );
}

export const UploadRecipe: Story = {
  name: 'Recipe: upload with progress',
  parameters: {
    docs: {
      description: {
        story:
          'The project sends each file, such as with `XMLHttpRequest` and its `upload.onprogress`, and keeps a status per file for `getFileStatus`. Here a timer stands in for the network. **The server must check every upload’s type and size: the checks here are a convenience, not security.**',
      },
    },
  },
  render: () => <UploadWithProgress />,
};
