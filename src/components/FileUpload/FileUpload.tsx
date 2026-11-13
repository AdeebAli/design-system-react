'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { useEffect, useRef, useState, type DragEvent, type Ref } from 'react';
import { cx } from '../../utils/cx';
import { splitLayoutProps } from '../../utils/splitLayoutProps';
import type { ComponentProps } from '../../utils/types';
import { box } from '../Box';
import * as buttonStyles from '../Button/Button.css';
import { useFieldControl } from '../Field/FieldContext';
import { UploadIcon } from '../Icon/internal/Upload';
import * as styles from './FileUpload.css';
import { mergeFiles, type FileRejection } from './mergeFiles';

/** A file's upload state, from `getFileStatus`. */
export interface FileStatus {
  status: 'uploading' | 'done' | 'error';
  /** Percent complete, 0–100, while `uploading`. Omit it for an indeterminate bar. */
  progress?: number;
  /** The error message, shown with `error`. */
  error?: string;
}

/** Strings for translation. */
export interface FileUploadLabels {
  /** The dropzone's text. @default 'Drop files here or browse' */
  prompt?: string;
  /** The button variant's text. @default 'Choose files' */
  browse?: string;
  /** A file's remove button name, where `{name}` is the file name. @default 'Remove {name}' */
  remove?: string;
  /** Announced when the list changes, where `{count}` is the number of files. @default '{count} files selected' */
  selected?: string;
  /** Shown while a file uploads. @default 'Uploading' */
  uploading?: string;
  /** Shown and announced when a file is done, where `{name}` is the file name. @default '{name} uploaded' */
  done?: string;
  /** Announced when a file fails, where `{name}` is the file name. @default '{name} failed to upload' */
  error?: string;
}

export const defaultFileUploadLabels: Required<FileUploadLabels> = {
  prompt: 'Drop files here or browse',
  browse: 'Choose files',
  remove: 'Remove {name}',
  selected: '{count} files selected',
  uploading: 'Uploading',
  done: '{name} uploaded',
  error: '{name} failed to upload',
};

interface FileUploadOwnProps {
  /** The files, when controlled. */
  value?: File[];
  /** The files at first, when uncontrolled. @default [] */
  defaultValue?: File[];
  /** Called with the new list of files. */
  onValueChange?: (files: File[]) => void;
  /** Whether selections add to the list. Otherwise a new file replaces the old one. @default false */
  multiple?: boolean;
  /** The accepted types, as the native attribute. Also checked on drop. */
  accept?: string;
  /** The largest file accepted, in bytes. */
  maxSize?: number;
  /** The most files accepted, with `multiple`. */
  maxFiles?: number;
  /** Called with the files that weren't added, and why. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Each file's upload state, which the project reports. */
  getFileStatus?: (file: File) => FileStatus | undefined;
  /** `dropzone` adds a large drop target; `button` is compact. @default 'dropzone' */
  variant?: 'dropzone' | 'button';
  /** Hides the file list, for a project rendering its own from `value`. @default false */
  hideFileList?: boolean;
  /** Marks it invalid. @default From `Field` */
  invalid?: boolean;
  /** Disables it. @default From `Field` */
  disabled?: boolean;
  /** Sets `aria-required`, not the native attribute. It doesn't validate. @default From `Field` */
  required?: boolean;
  /** The name the files are submitted under in a form. */
  name?: string;
  /** Strings for translation. */
  labels?: FileUploadLabels;
}

/**
 * `FileUpload`'s props. `ref` and native attributes, such as `capture`, go to
 * the hidden file input; `className`, `style`, and layout props go to the root.
 */
export type FileUploadProps = ComponentProps<'input', FileUploadOwnProps>;

/** Writes a list into an input's `files`, so a form submits what's displayed. */
function writeFiles(input: HTMLInputElement | null, files: readonly File[]) {
  // jsdom has no DataTransfer; every supported browser does.
  if (!input || typeof DataTransfer === 'undefined') return;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/**
 * Picks files, by browsing or dropping. It doesn't send them: the project
 * uploads them and reports each file's status through `getFileStatus`.
 * Checking `accept` and `maxSize` here is a convenience, not security: the
 * server must check uploads.
 */
export function FileUpload({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  onReject,
  getFileStatus,
  variant = 'dropzone',
  hideFileList = false,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  name,
  labels: labelsProp,
  className,
  style,
  ref,
  ...props
}: FileUploadProps) {
  const field = useFieldControl('native');
  const invalid = invalidProp ?? field.invalid;
  const disabled = field.disabled || disabledProp === true;
  const required = requiredProp ?? field.required;
  const labels = { ...defaultFileUploadLabels, ...labelsProp };
  const [uncontrolled, setUncontrolled] = useState<File[]>(defaultValue ?? []);
  const files = value ?? uncontrolled;
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [layout, rest] = splitLayoutProps(props);
  const dropzone = variant === 'dropzone';
  // The file list (next task) reads these.
  void getFileStatus;
  void hideFileList;

  // The input follows `value`, including a change from a controlled parent.
  useEffect(() => {
    writeFiles(inputRef.current, files);
  }, [files]);

  const add = (incoming: readonly File[]) => {
    const result = mergeFiles(files, incoming, {
      multiple,
      accept,
      maxSize,
      maxFiles,
    });
    if (result.rejections.length > 0) onReject?.(result.rejections);
    // Put the input back to the current list now. If the list changes, the
    // effect writes the new one; if a controlled parent ignores the change,
    // the input still matches what's displayed.
    writeFiles(inputRef.current, files);
    if (
      result.files.length === files.length &&
      result.files.every((f, i) => f === files[i])
    ) {
      return;
    }
    setUncontrolled(result.files);
    onValueChange?.(result.files);
  };

  const dragProps = dropzone &&
    !disabled && {
      onDragEnter: (event: DragEvent) => {
        event.preventDefault();
        setDragging(true);
      },
      onDragOver: (event: DragEvent) => {
        event.preventDefault();
        setDragging(true);
      },
      onDragLeave: (event: DragEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false);
        }
      },
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        add([...event.dataTransfer.files]);
      },
    };

  return (
    <div
      className={cx(box(layout), styles.root, className)}
      style={style}
      data-dragging={dragging ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      {...dragProps}
    >
      <div
        className={cx(
          styles.target,
          dropzone
            ? styles.dropzone
            : cx(
                buttonStyles.button({
                  variant: 'outline',
                  tone: 'neutral',
                  size: 'md',
                }),
                styles.button,
              ),
        )}
        data-disabled={!dropzone && disabled ? '' : undefined}
      >
        <BaseField.Control
          ref={(node: HTMLInputElement | null) => {
            inputRef.current = node;
            setRef(ref, node);
          }}
          type="file"
          className={styles.input}
          multiple={multiple}
          accept={accept}
          name={name}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          onChange={(event) => add([...(event.currentTarget.files ?? [])])}
          {...rest}
        />
        {dropzone ? (
          <>
            <span className={styles.icon}>
              <UploadIcon aria-hidden="true" />
            </span>
            <span>{labels.prompt}</span>
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>
              <UploadIcon aria-hidden="true" />
            </span>
            <span>{labels.browse}</span>
          </>
        )}
      </div>
    </div>
  );
}
