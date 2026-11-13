'use client';

import type { Ref } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import { CircleCheckIcon } from '../Icon/internal/CircleCheck';
import { CircleXIcon } from '../Icon/internal/CircleX';
import { FileIcon } from '../Icon/internal/File';
import { XIcon } from '../Icon/internal/X';
import { IconButton } from '../IconButton';
import { Progress } from '../Progress';
import * as styles from './FileUpload.css';
import type { FileStatus, FileUploadLabels } from './FileUpload';
import { formatSize } from './formatSize';

interface FileListProps {
  files: readonly File[];
  statuses: readonly (FileStatus | undefined)[];
  labels: Required<FileUploadLabels>;
  disabled: boolean;
  onRemove: (index: number) => void;
  listRef: Ref<HTMLUListElement>;
}

/** The selected files, each with its size, status, and a remove button. */
export function FileList({
  files,
  statuses,
  labels,
  disabled,
  onRemove,
  listRef,
}: FileListProps) {
  return (
    <ul ref={listRef} className={styles.list}>
      {files.map((file, index) => {
        const status = statuses[index];
        return (
          <li
            key={`${file.name}-${file.size}-${file.lastModified}`}
            className={styles.item}
            data-status={status?.status}
          >
            <span className={styles.fileIcon}>
              <FileIcon aria-hidden="true" />
            </span>
            <span className={styles.details}>
              <span className={styles.nameRow}>
                <span className={styles.name} title={file.name}>
                  {file.name}
                </span>
                <span className={styles.size}>{formatSize(file.size)}</span>
              </span>
              {status?.status === 'uploading' && (
                <Progress
                  aria-label={labels.uploading.replace('{name}', file.name)}
                  value={status.progress ?? null}
                  size="sm"
                />
              )}
              {status?.status === 'done' && (
                <span className={styles.status}>
                  <CircleCheckIcon
                    className={styles.doneIcon}
                    aria-hidden="true"
                  />
                  {labels.done}
                </span>
              )}
              {status?.status === 'error' && (
                <span className={cx(styles.status, styles.errorText)}>
                  <CircleXIcon
                    className={styles.errorIcon}
                    aria-hidden="true"
                  />
                  {status.error ?? labels.error}
                </span>
              )}
            </span>
            <IconButton
              variant="ghost"
              tone="neutral"
              size="sm"
              icon={<Icon icon={XIcon} />}
              aria-label={labels.remove.replace('{name}', file.name)}
              disabled={disabled}
              onClick={() => onRemove(index)}
            />
          </li>
        );
      })}
    </ul>
  );
}
