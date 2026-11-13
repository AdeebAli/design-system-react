import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cdp } from 'vitest/browser';
import { defineTheme } from '../../theme/defineTheme';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { axTree } from '../../utils/browserTestUtils';
import { Prose } from '../Prose';
import { Image } from './index';
import * as styles from './Image.css';

// Self-contained images, so the tests need no server: a 2×2 PNG, a wide SVG,
// and bytes that aren't an image.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4AWP4z8Dwn4GBgYGJgYGBAQAm/wH/1xr7vQAAAABJRU5ErkJggg==';
const WIDE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><rect width="400" height="100" fill="#4338ca"/></svg>',
)}`;
const BROKEN = 'data:image/png;base64,AAAA';

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

const css = (el: Element) => getComputedStyle(el);
const img = () => screen.getByTestId<HTMLImageElement>('img');
const frame = () => img().parentElement!;

async function settled(state: 'loaded' | 'error') {
  await expect
    .poll(() =>
      state === 'loaded'
        ? !frame().hasAttribute('data-loading')
        : frame().hasAttribute('data-error'),
    )
    .toBe(true);
}

function inWidth(element: ReactElement, width = 640) {
  return render(<div style={{ width }}>{element}</div>);
}

/**
 * Far below the viewport, so a lazy image stays loading until it's scrolled
 * into view. A src with no image counts as failed, and a repeated data: URI is
 * cached, so neither stays loading.
 */
function belowTheFold(element: ReactElement) {
  return render(<div style={{ width: 640, paddingTop: 20000 }}>{element}</div>);
}

describe('a ratio frame keeps its height', () => {
  it.each(['cover', 'contain'] as const)(
    'before and after the image loads, with fit %s',
    async (fit) => {
      belowTheFold(
        <Image
          data-testid="img"
          src={`${WIDE}#${fit}`}
          loading="lazy"
          alt="x"
          ratio="16/9"
          fit={fit}
        />,
      );
      expect(frame()).toHaveAttribute('data-loading');
      expect(frame().getBoundingClientRect().height).toBe(360);
      frame().scrollIntoView();
      await settled('loaded');
      expect(frame().getBoundingClientRect().height).toBe(360);
      expect(img().getBoundingClientRect().height).toBe(360);
      expect(css(img()).objectFit).toBe(fit);
    },
  );
});

describe('corners', () => {
  it.each([
    ['none', '0px'],
    ['sm', '6px'],
    ['md', '12px'],
    ['lg', '16px'],
    ['xl', '20px'],
    ['full', '9999px'],
  ] as const)('radius %s clips at %s', (radius, value) => {
    inWidth(
      <Image data-testid="img" src={PNG} alt="x" ratio="1/1" radius={radius} />,
    );
    expect(css(frame()).borderTopLeftRadius).toBe(value);
    expect(css(frame()).overflow).toBe('hidden');
  });

  it('the default is radius.image, and follows a theme', () => {
    const { unmount } = inWidth(
      <Image data-testid="img" src={PNG} alt="x" ratio="1/1" />,
    );
    expect(css(frame()).borderTopLeftRadius).toBe('12px');
    unmount();
    render(
      <ThemeProvider
        theme={defineTheme({ shared: { radius: { image: '3px' } } })}
      >
        <Image data-testid="img" src={PNG} alt="x" ratio="1/1" />
      </ThemeProvider>,
    );
    expect(css(frame()).borderTopLeftRadius).toBe('3px');
  });
});

describe('a failed image', () => {
  it('shows the fallback and no broken image, and is still named by its alt', async () => {
    inWidth(
      <Image data-testid="img" src={BROKEN} alt="The dashboard" ratio="16/9" />,
    );
    await settled('error');
    const fallback = frame().querySelector(`.${styles.fallback}`)!;
    const box = fallback.getBoundingClientRect();
    expect(box.height).toBe(360);
    expect(box.width).toBe(640);
    expect(css(fallback).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(css(img()).opacity).toBe('0');
    const images = (await axTree()).filter(
      (node) => node.role?.value === 'image',
    );
    expect(images.map((node) => node.name?.value)).toEqual(['The dashboard']);
  });

  it('with alt="", there is no image in the accessibility tree', async () => {
    inWidth(<Image data-testid="img" src={BROKEN} alt="" ratio="16/9" />);
    await settled('error');
    const roles = (await axTree()).map((node) => node.role?.value);
    expect(roles).not.toContain('image');
    expect(roles).not.toContain('graphics-symbol');
  });
});

it('before hydration, a loaded image paints over its skeleton', async () => {
  const host = document.createElement('div');
  host.style.width = '320px';
  host.innerHTML = renderToString(
    <Image src={WIDE} alt="x" ratio="16/9" skeleton />,
  );
  document.body.append(host);
  try {
    const image = host.querySelector('img')!;
    await expect
      .poll(() => image.complete && image.naturalWidth > 0)
      .toBe(true);
    const box = image.getBoundingClientRect();
    expect(
      document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      ),
    ).toBe(image);
  } finally {
    host.remove();
  }
});

it('reduced motion stops the skeleton pulse, and it stays visible', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  belowTheFold(
    <Image
      data-testid="img"
      src={`${WIDE}#motion`}
      loading="lazy"
      alt="x"
      ratio="16/9"
      skeleton
    />,
  );
  expect(frame()).toHaveAttribute('data-loading');
  const skeleton = frame().querySelector(`.${styles.skeleton}`)!;
  expect(parseFloat(css(skeleton).animationDuration)).toBe(0);
  expect(css(skeleton).opacity).toBe('1');
  const box = skeleton.getBoundingClientRect();
  expect(box.width).toBe(640);
  expect(box.height).toBe(360);
});

describe('forced colors', () => {
  beforeEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
  });

  it('the frame has a 1px border while it shows a skeleton', () => {
    belowTheFold(
      <Image
        data-testid="img"
        src={`${WIDE}#forced`}
        loading="lazy"
        alt="x"
        ratio="16/9"
        skeleton
      />,
    );
    expect(frame()).toHaveAttribute('data-loading');
    expect(css(frame()).borderTopWidth).toBe('1px');
    expect(css(frame()).borderTopStyle).toBe('solid');
  });

  it('and while it shows a fallback', async () => {
    inWidth(<Image data-testid="img" src={BROKEN} alt="x" ratio="16/9" />);
    await settled('error');
    expect(css(frame()).borderTopWidth).toBe('1px');
    expect(css(frame()).borderTopStyle).toBe('solid');
  });

  it('and none once loaded', async () => {
    inWidth(
      <Image data-testid="img" src={PNG} alt="x" ratio="16/9" skeleton />,
    );
    await settled('loaded');
    expect(css(frame()).borderTopStyle).toBe('none');
  });
});

describe('in Prose', () => {
  it("Prose's img rules don't reach it", async () => {
    render(
      <div style={{ width: 640 }}>
        <Prose>
          <p>
            <Image
              data-testid="img"
              src={PNG}
              alt="x"
              ratio="16/9"
              radius="none"
            />
          </p>
          <img data-testid="plain" src={PNG} alt="" />
        </Prose>
      </div>,
    );
    await settled('loaded');
    expect(img().getBoundingClientRect().height).toBe(
      frame().getBoundingClientRect().height,
    );
    const { width, height } = frame().getBoundingClientRect();
    expect(height).toBeCloseTo((width * 9) / 16, 0);
    expect(css(img()).borderTopLeftRadius).toBe('0px');
    expect(css(screen.getByTestId('plain')).borderTopLeftRadius).toBe('12px');
  });
});
