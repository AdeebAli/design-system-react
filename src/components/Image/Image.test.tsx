import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { renderToString } from 'react-dom/server';
import { box } from '../Box';
import * as skeletonStyles from '../Skeleton/Skeleton.css';
import { Image, type ImageRatio } from './index';
import { ratioVar } from './Image.css';

const SRC = '/cover.jpg';

const img = () => screen.getByRole<HTMLImageElement>('img');
const frame = () => img().parentElement!;
const ratio = (el: HTMLElement) =>
  el.style.getPropertyValue(ratioVar.slice('var('.length, -1));
/** The frame's children other than the img: the skeleton or fallback. */
const extras = () => [...frame().children].filter((el) => el !== img());

let warn: ReturnType<typeof spyWarn>;
const spyWarn = () =>
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
beforeEach(() => {
  warn = spyWarn();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('props', () => {
  it('alt and src reach the img', () => {
    render(<Image src={SRC} alt="A lake at dawn" />);
    expect(img()).toHaveAttribute('alt', 'A lake at dawn');
    expect(img()).toHaveAttribute('src', SRC);
  });

  it('htmlWidth and htmlHeight render as width and height, and give the ratio', () => {
    render(<Image src={SRC} alt="" htmlWidth={640} htmlHeight={480} />);
    const image = screen.getByAltText('');
    expect(image).toHaveAttribute('width', '640');
    expect(image).toHaveAttribute('height', '480');
    expect(ratio(image.parentElement!)).toBe('640 / 480');
  });

  it('ratio wins over htmlWidth and htmlHeight', () => {
    render(
      <Image src={SRC} alt="" ratio="16/9" htmlWidth={640} htmlHeight={480} />,
    );
    expect(ratio(screen.getByAltText('').parentElement!)).toBe('16 / 9');
  });

  it('ref reaches the img', () => {
    let node: HTMLElement | null = null;
    render(
      <Image
        src={SRC}
        alt="x"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBe(img());
  });

  it("the project's ref isn't called again when Image re-renders", () => {
    const ref = vi.fn();
    render(<Image src={SRC} alt="x" ratio="1/1" ref={ref} />);
    fireEvent.load(img());
    fireEvent.error(img());
    expect(ref.mock.calls).toEqual([[img()]]);
  });

  it('layout props and className reach the frame, not the img', () => {
    render(<Image src={SRC} alt="x" marginTop="4" className="custom" />);
    expect(frame()).toHaveClass('custom');
    expect(img()).not.toHaveClass('custom');
    expect(frame().className).not.toBe('custom');
    expect(img()).not.toHaveAttribute('margintop');
  });

  it('the frame is display block by default, and display changes it', () => {
    const classes = (display: 'block' | 'inline-block') =>
      box({ display }).split(' ');
    const { rerender } = render(<Image src={SRC} alt="x" />);
    expect(frame()).toHaveClass(...classes('block'));
    rerender(<Image src={SRC} alt="x" display="inline-block" />);
    expect(frame()).toHaveClass(...classes('inline-block'));
    expect(frame()).not.toHaveClass(...classes('block'));
    expect(img()).not.toHaveAttribute('display');
  });

  it('other props reach the img', () => {
    render(<Image src={SRC} alt="x" loading="lazy" data-testid="i" />);
    expect(img()).toHaveAttribute('loading', 'lazy');
    expect(img()).toHaveAttribute('data-testid', 'i');
  });
});

describe('ratio', () => {
  it.each([
    ['1/1', '1 / 1'],
    ['4/3', '4 / 3'],
    ['3/2', '3 / 2'],
    ['16/9', '16 / 9'],
    ['21/9', '21 / 9'],
  ] as [ImageRatio, string][])('%s sets %s', (preset, value) => {
    render(<Image src={SRC} alt="x" ratio={preset} />);
    expect(ratio(frame())).toBe(value);
  });

  it('a number sets that number', () => {
    render(<Image src={SRC} alt="x" ratio={1.6} />);
    expect(ratio(frame())).toBe('1.6');
  });

  it.each([0, -1, Number.NaN])('%s is ignored, with a warning', (value) => {
    render(<Image src={SRC} alt="x" ratio={value} />);
    expect(ratio(frame())).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toMatch(/Image.*ratio/);
  });
});

describe('loading and failure', () => {
  it('data-loading is in the first render and the server HTML', () => {
    expect(renderToString(<Image src={SRC} alt="x" />)).toMatch(
      /<span[^>]*data-loading=""/,
    );
    render(<Image src={SRC} alt="x" />);
    expect(frame()).toHaveAttribute('data-loading');
    expect(frame()).not.toHaveAttribute('data-error');
  });

  it('load removes data-loading', () => {
    render(<Image src={SRC} alt="x" />);
    fireEvent.load(img());
    expect(frame()).not.toHaveAttribute('data-loading');
    expect(frame()).not.toHaveAttribute('data-error');
  });

  it('error replaces data-loading with data-error', () => {
    render(<Image src={SRC} alt="x" ratio="1/1" />);
    fireEvent.error(img());
    expect(frame()).not.toHaveAttribute('data-loading');
    expect(frame()).toHaveAttribute('data-error');
  });

  it('a new src after an error starts over', () => {
    const { rerender } = render(<Image src={SRC} alt="x" ratio="1/1" />);
    fireEvent.error(img());
    rerender(<Image src="/other.jpg" alt="x" ratio="1/1" />);
    expect(frame()).toHaveAttribute('data-loading');
    expect(frame()).not.toHaveAttribute('data-error');
    expect(extras()).toHaveLength(0);
  });

  describe('an img that is already complete when it mounts', () => {
    function stub(naturalWidth: number) {
      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(
        true,
      );
      vi.spyOn(
        HTMLImageElement.prototype,
        'naturalWidth',
        'get',
      ).mockReturnValue(naturalWidth);
    }

    /** jsdom's img has no decode(), so it's defined for one test. */
    function stubDecode(result: Promise<void>) {
      result.catch(() => undefined);
      Object.defineProperty(HTMLImageElement.prototype, 'decode', {
        configurable: true,
        value: () => result,
      });
      onTestFinished(() => {
        delete (HTMLImageElement.prototype as Partial<HTMLImageElement>).decode;
      });
    }

    it('is loaded when it has a width', () => {
      stub(10);
      render(<Image src={SRC} alt="x" />);
      expect(frame()).not.toHaveAttribute('data-loading');
      expect(frame()).not.toHaveAttribute('data-error');
    });

    it('failed when its naturalWidth is 0 and it fails to decode', async () => {
      stub(0);
      stubDecode(Promise.reject(new Error('broken')));
      render(<Image src={SRC} alt="x" ratio="1/1" />);
      await waitFor(() => expect(frame()).toHaveAttribute('data-error'));
      expect(frame()).not.toHaveAttribute('data-loading');
    });

    // Some browsers report 0 for an SVG with no intrinsic size.
    it('loaded when its naturalWidth is 0 but it decodes', async () => {
      stub(0);
      stubDecode(Promise.resolve());
      render(<Image src={SRC} alt="x" ratio="1/1" />);
      await waitFor(() => expect(frame()).not.toHaveAttribute('data-loading'));
      expect(frame()).not.toHaveAttribute('data-error');
    });

    it('is loaded when a new src is already complete', () => {
      const { rerender } = render(<Image src={SRC} alt="x" />);
      fireEvent.load(img());
      stub(10);
      rerender(<Image src="/cached.jpg" alt="x" />);
      expect(frame()).not.toHaveAttribute('data-loading');
    });
  });

  it('an empty src fails, where img has no decode()', () => {
    // jsdom: complete is true with no src, and there's no decode().
    expect(HTMLImageElement.prototype).not.toHaveProperty('decode');
    render(<Image src="" alt="x" ratio="1/1" />);
    expect(frame()).toHaveAttribute('data-error');
  });

  it("the project's onLoad runs, after Image's", () => {
    const seen: (string | null)[] = [];
    render(
      <Image
        src={SRC}
        alt="x"
        onLoad={(event) =>
          seen.push(
            event.currentTarget.parentElement!.getAttribute('data-loading'),
          )
        }
      />,
    );
    fireEvent.load(img());
    expect(seen).toEqual([null]);
  });

  it("the project's onError runs, after Image's", () => {
    const seen: (string | null)[] = [];
    render(
      <Image
        src={SRC}
        alt="x"
        ratio="1/1"
        onError={(event) =>
          seen.push(
            event.currentTarget.parentElement!.getAttribute('data-error'),
          )
        }
      />,
    );
    fireEvent.error(img());
    expect(seen).toEqual(['']);
  });
});

describe('skeleton and fallback', () => {
  it('skeleton renders a hidden Skeleton only while loading', () => {
    render(<Image src={SRC} alt="x" ratio="1/1" skeleton />);
    expect(extras()).toHaveLength(1);
    expect(extras()[0]).toHaveClass(skeletonStyles.rect);
    expect(extras()[0]).toHaveAttribute('aria-hidden', 'true');
    fireEvent.load(img());
    expect(extras()).toHaveLength(0);
  });

  it('there is no skeleton by default', () => {
    render(<Image src={SRC} alt="x" ratio="1/1" />);
    expect(extras()).toHaveLength(0);
  });

  it('the default fallback is a hidden icon, only after an error', () => {
    render(<Image src={SRC} alt="x" ratio="1/1" />);
    expect(extras()).toHaveLength(0);
    fireEvent.error(img());
    expect(extras()).toHaveLength(1);
    expect(extras()[0]).toHaveAttribute('aria-hidden', 'true');
    expect(extras()[0]!.querySelector('svg')).not.toBeNull();
  });

  it('fallback replaces the icon', () => {
    render(
      <Image src={SRC} alt="x" ratio="1/1" fallback={<span>gone</span>} />,
    );
    fireEvent.error(img());
    expect(extras()[0]).toHaveTextContent('gone');
    expect(extras()[0]!.querySelector('svg')).toBeNull();
  });

  it('fallback={null} renders none', () => {
    render(<Image src={SRC} alt="x" ratio="1/1" fallback={null} />);
    fireEvent.error(img());
    expect(extras()).toHaveLength(0);
  });
});

describe('the size warning', () => {
  const sizeWarnings = () =>
    warn.mock.calls.filter(([message]) => /Image.*ratio/.test(String(message)));

  it('logs once with skeleton and no size', () => {
    render(
      <>
        <Image src={SRC} alt="x" skeleton />
        <Image src="/b.jpg" alt="x" skeleton />
      </>,
    );
    expect(sizeWarnings()).toHaveLength(1);
  });

  it('logs when the image fails with no size', () => {
    render(<Image src={SRC} alt="x" />);
    expect(sizeWarnings()).toHaveLength(0);
    fireEvent.error(img());
    expect(sizeWarnings()).toHaveLength(1);
  });

  it.each([
    ['ratio', { ratio: '16/9' }],
    ['intrinsic size', { htmlWidth: 640, htmlHeight: 480 }],
    ['height', { height: '24' }],
  ] as [string, Partial<ComponentProps<typeof Image>>][])(
    'is quiet with %s',
    (_, size) => {
      render(<Image src={SRC} alt="x" skeleton {...size} />);
      fireEvent.error(img());
      expect(sizeWarnings()).toHaveLength(0);
    },
  );
});

it("warns when the as component doesn't forward its ref", () => {
  function NoRef(props: { alt?: string }) {
    return <img alt={props.alt} />;
  }
  render(<Image as={NoRef} alt="x" ratio="1/1" />);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/Image.*ref/);
});

it('warns when the as component forwards its ref to something other than an img', () => {
  function Div({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
    return <div ref={ref} />;
  }
  render(<Image as={Div} alt="x" ratio="1/1" />);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/Image.*img/);
});
