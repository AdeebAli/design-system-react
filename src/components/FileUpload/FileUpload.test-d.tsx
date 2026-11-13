import { createRef } from 'react';
import { FileUpload, type FileStatus } from './index';

test('ref is the input', () => {
  <FileUpload ref={createRef<HTMLInputElement>()} />;
  // @ts-expect-error not a div
  <FileUpload ref={createRef<HTMLDivElement>()} />;
});

test('onValueChange receives File[], and getFileStatus returns a status', () => {
  <FileUpload
    onValueChange={(files) => {
      expectTypeOf(files).toEqualTypeOf<File[]>();
    }}
    getFileStatus={(file) => {
      expectTypeOf(file).toEqualTypeOf<File>();
      return { status: 'uploading', progress: 40 } satisfies FileStatus;
    }}
  />;
  // @ts-expect-error not a status
  <FileUpload getFileStatus={() => ({ status: 'queued' })} />;
});

test('onReject reasons are type, size, or count', () => {
  <FileUpload
    onReject={(rejections) => {
      expectTypeOf(rejections[0]!.reason).toEqualTypeOf<
        'type' | 'size' | 'count'
      >();
    }}
  />;
});

test('variant is dropzone or button', () => {
  <FileUpload variant="button" />;
  // @ts-expect-error not a variant
  <FileUpload variant="link" />;
});
