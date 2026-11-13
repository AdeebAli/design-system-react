import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { cdp, page, userEvent } from 'vitest/browser';
import { contrastRatio } from '../../themes/contrast';
import * as styles from './FileUpload.css';
import { FileUpload, type FileUploadProps } from './index';

const file = (name: string, size = 10, type = '') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });

const input = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;
const root = () => input().closest<HTMLElement>(`.${styles.root}`)!;
const target = () => input().parentElement!;
const inputNames = () => [...(input().files ?? [])].map((f) => f.name);

/** A drop dispatched with a real DataTransfer, as the browser sends one. */
function drop(files: File[]) {
  const transfer = new DataTransfer();
  for (const f of files) transfer.items.add(f);
  for (const type of ['dragenter', 'dragover', 'drop']) {
    target().dispatchEvent(
      new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }),
    );
  }
}

function Controlled(props: Partial<FileUploadProps>) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <FileUpload
        aria-label="Files"
        multiple
        value={files}
        onValueChange={setFiles}
        {...props}
      />
      <p data-testid="value">{files.map((f) => f.name).join(',')}</p>
      <button type="button" onClick={() => setFiles((f) => f.slice(1))}>
        Drop first
      </button>
    </>
  );
}

it('a file set through the input appears in the value and the input', async () => {
  render(<Controlled />);
  await userEvent.upload(input(), [file('a.txt'), file('b.txt')]);
  await expect
    .poll(() => screen.getByTestId('value').textContent)
    .toBe('a.txt,b.txt');
  expect(inputNames()).toEqual(['a.txt', 'b.txt']);
});

it('a dropped file appears in the value and the input', async () => {
  render(<Controlled />);
  await userEvent.upload(input(), file('a.txt'));
  drop([file('b.txt')]);
  await expect
    .poll(() => screen.getByTestId('value').textContent)
    .toBe('a.txt,b.txt');
  await expect.poll(inputNames).toEqual(['a.txt', 'b.txt']);
});

it('a dropped .exe with accept=".pdf" is rejected', async () => {
  const onReject = vi.fn();
  render(<Controlled accept=".pdf" onReject={onReject} />);
  const exe = file('setup.exe');
  drop([exe, file('report.pdf')]);
  await expect
    .poll(() => screen.getByTestId('value').textContent)
    .toBe('report.pdf');
  expect(onReject.mock.calls).toEqual([[[{ file: exe, reason: 'type' }]]]);
});

it('a controlled value change rewrites the input', async () => {
  render(<Controlled />);
  await userEvent.upload(input(), [file('a.txt'), file('b.txt')]);
  await expect.poll(inputNames).toEqual(['a.txt', 'b.txt']);
  await userEvent.click(screen.getByRole('button', { name: 'Drop first' }));
  await expect.poll(inputNames).toEqual(['b.txt']);
});

it('a controlled parent that ignores changes keeps the input empty', async () => {
  render(<FileUpload aria-label="Files" multiple value={[]} />);
  await userEvent.upload(input(), file('a.txt'));
  expect(input().files).toHaveLength(0);
});

it('without multiple, a new file replaces the input’s file', async () => {
  render(<FileUpload aria-label="Files" />);
  await userEvent.upload(input(), file('a.txt'));
  await expect.poll(inputNames).toEqual(['a.txt']);
  await userEvent.upload(input(), file('b.txt'));
  await expect.poll(inputNames).toEqual(['b.txt']);
});

it('a form submits exactly the displayed files', async () => {
  render(
    <form>
      <Controlled name="attachments" />
    </form>,
  );
  await userEvent.upload(input(), [file('a.txt'), file('b.txt')]);
  drop([file('c.txt')]);
  await userEvent.click(screen.getByRole('button', { name: 'Drop first' }));
  await expect
    .poll(() => screen.getByTestId('value').textContent)
    .toBe('b.txt,c.txt');
  const form = document.querySelector('form')!;
  await expect
    .poll(() =>
      new FormData(form)
        .getAll('attachments')
        .map((entry) => (entry as File).name),
    )
    .toEqual(['b.txt', 'c.txt']);
});

it('the hidden input covers the drop target, inside its border', () => {
  render(<FileUpload aria-label="Files" />);
  const el = target();
  const t = el.getBoundingClientRect();
  const i = input().getBoundingClientRect();
  expect([i.left, i.top, i.width, i.height]).toEqual([
    t.left + el.clientLeft,
    t.top + el.clientTop,
    el.clientWidth,
    el.clientHeight,
  ]);
  expect(
    document.elementFromPoint(t.left + t.width / 2, t.top + t.height / 2),
  ).toBe(input());
});

describe('dragging', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  function startDrag() {
    const transfer = new DataTransfer();
    target().dispatchEvent(
      new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }),
    );
  }

  it('uses a solid accent border on the subtle accent, at 3:1 or more', async () => {
    render(<FileUpload aria-label="Files" />);
    const probe = document.createElement('div');
    probe.style.background = 'var(--ds-color-bg-accent-subtle)';
    probe.style.color = 'var(--ds-color-bg-accent)';
    document.body.append(probe);
    startDrag();
    await expect.poll(() => root().hasAttribute('data-dragging')).toBe(true);
    // Wait out the color transition.
    await expect
      .poll(() => getComputedStyle(target()).borderTopColor)
      .toBe(getComputedStyle(probe).color);
    const t = getComputedStyle(target());
    expect(t.borderTopStyle).toBe('solid');
    expect(t.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    expect(
      contrastRatio(t.borderTopColor, t.backgroundColor),
    ).toBeGreaterThanOrEqual(3);
    probe.remove();
  });

  it('keeps a dashed border at rest', () => {
    render(<FileUpload aria-label="Files" />);
    expect(getComputedStyle(target()).borderTopStyle).toBe('dashed');
  });

  it('forced colors keep the border, Highlight while dragging', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    render(<FileUpload aria-label="Files" />);
    const probe = document.createElement('div');
    probe.style.forcedColorAdjust = 'none';
    probe.style.color = 'Highlight';
    probe.style.backgroundColor = 'CanvasText';
    document.body.append(probe);
    const p = getComputedStyle(probe);
    expect(getComputedStyle(target()).borderTopWidth).toBe('1px');
    expect(getComputedStyle(target()).borderTopColor).toBe(p.backgroundColor);
    startDrag();
    await expect
      .poll(() => getComputedStyle(target()).borderTopColor)
      .toBe(p.color);
    probe.remove();
  });
});

describe('file list', () => {
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  const files = [file('one.txt'), file('two.txt'), file('three.txt')];
  const remove = (name: string) =>
    screen.getByRole('button', { name: `Remove ${name}` });

  it('removing the middle file focuses the next remove button', async () => {
    render(<FileUpload aria-label="Files" multiple defaultValue={files} />);
    await userEvent.click(remove('two.txt'));
    await expect.poll(() => document.activeElement).toBe(remove('three.txt'));
  });

  it('removing the last file focuses the previous remove button', async () => {
    render(<FileUpload aria-label="Files" multiple defaultValue={files} />);
    await userEvent.click(remove('three.txt'));
    await expect.poll(() => document.activeElement).toBe(remove('two.txt'));
  });

  it('removing the only file focuses the input', async () => {
    render(<FileUpload aria-label="Files" defaultValue={[files[0]!]} />);
    await userEvent.click(remove('one.txt'));
    await expect.poll(() => document.activeElement).toBe(input());
  });

  it('removing a file updates the input', async () => {
    render(<FileUpload aria-label="Files" multiple defaultValue={files} />);
    await expect.poll(inputNames).toEqual(['one.txt', 'two.txt', 'three.txt']);
    await userEvent.click(remove('one.txt'));
    await expect.poll(inputNames).toEqual(['two.txt', 'three.txt']);
  });

  it('at 320px, a 200-character name truncates without widening the page', async () => {
    await page.viewport(320, 600);
    const long = file(`${'x'.repeat(196)}.pdf`);
    render(
      <FileUpload
        aria-label="Files"
        defaultValue={[long]}
        getFileStatus={() => ({ status: 'uploading', progress: 30 })}
      />,
    );
    const name = screen.getByTitle(long.name);
    expect(name.textContent).toBe(long.name);
    expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    expect(getComputedStyle(name).textOverflow).toBe('ellipsis');
    expect(document.documentElement.scrollWidth).toBe(320);
    const button = remove(long.name).getBoundingClientRect();
    expect(button.right).toBeLessThanOrEqual(320);
    const bar = screen.getByRole('progressbar').getBoundingClientRect();
    expect(bar.right).toBeLessThanOrEqual(320);
  });

  it('remove buttons are at least 24px', () => {
    render(<FileUpload aria-label="Files" defaultValue={[files[0]!]} />);
    const r = remove('one.txt').getBoundingClientRect();
    expect(r.width).toBeGreaterThanOrEqual(24);
    expect(r.height).toBeGreaterThanOrEqual(24);
  });

  it('the hidden input does not cover the list', () => {
    render(<FileUpload aria-label="Files" defaultValue={[files[0]!]} />);
    const r = remove('one.txt').getBoundingClientRect();
    const hit = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height / 2,
    );
    expect(remove('one.txt').contains(hit)).toBe(true);
  });
});
