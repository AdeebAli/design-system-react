import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Field } from '../Field';
import { Stack } from '../Stack';
import { FileUpload } from './FileUpload';
import type { FileRejection } from './mergeFiles';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
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
