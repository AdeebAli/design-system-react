import { render, screen, waitFor } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { renderToString } from 'react-dom/server';
import { contrastRatio } from '../../themes/contrast';
import { Avatar, type AvatarStatus } from './index';
import * as styles from './Avatar.css';

// A 2×2 PNG, so the load needs no server.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4AWP4z8Dwn4GBgYGJgYGBAQAm/wH/1xr7vQAAAABJRU5ErkJggg==';

afterEach(async () => {
  document.documentElement.removeAttribute('dir');
  delete document.documentElement.dataset.dsMode;
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

const face = (root: HTMLElement) =>
  root.querySelector<HTMLElement>(`.${styles.face}`)!;
const dot = (root: HTMLElement) =>
  root.querySelector<HTMLElement>(`.${styles.dotBase}`)!;

/** A color token as the browser resolves it. */
function token(name: string) {
  const probe = document.createElement('div');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

it('puts the image in the server HTML', () => {
  const html = renderToString(<Avatar name="Ada Park" src="/ada.jpg" />);
  expect(html).toMatch(/<img[^>]*src="\/ada.jpg"/);
});

it('before hydration, the server-rendered image is on top of the initials', async () => {
  const host = document.createElement('div');
  host.innerHTML = renderToString(
    <Avatar name="Ada Park" size="xl" src={PNG} colorFromName />,
  );
  document.body.append(host);
  try {
    const image = host.querySelector('img')!;
    await expect
      .poll(() => image.complete && image.naturalWidth > 0)
      .toBe(true);
    const box = image.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    expect(hit).toBe(image);
  } finally {
    host.remove();
  }
});

it('a broken image shows the initials, with the image hidden', async () => {
  render(<Avatar data-testid="a" name="Ada Park" src="/no-such-avatar.png" />);
  const image = screen.getByTestId('a').querySelector('img')!;
  await waitFor(() => expect(image).toHaveAttribute('data-error'));
  expect(getComputedStyle(image).visibility).toBe('hidden');
  expect(screen.getByText('AP')).toBeVisible();
});

it('a loaded image covers the face without changing the size', async () => {
  render(<Avatar data-testid="a" name="Ada Park" size="lg" />);
  const before = screen.getByTestId('a').getBoundingClientRect();
  render(<Avatar data-testid="b" name="Ada Park" size="lg" src={PNG} />);
  const image = screen.getByTestId('b').querySelector('img')!;
  await waitFor(() =>
    expect(screen.getByTestId('b')).not.toHaveTextContent('AP'),
  );
  expect(getComputedStyle(image).visibility).toBe('visible');
  const after = screen.getByTestId('b').getBoundingClientRect();
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  expect(after.width).toBe(40);
  expect(image.getBoundingClientRect().width).toBe(40);
  expect(getComputedStyle(image).objectFit).toBe('cover');
});

it.each([
  ['sm', 24],
  ['md', 32],
  ['lg', 40],
  ['xl', 64],
] as const)('size %s is %spx', (size, px) => {
  render(<Avatar data-testid="a" name="Ada" size={size} />);
  const box = screen.getByTestId('a').getBoundingClientRect();
  expect(box.width).toBe(px);
  expect(box.height).toBe(px);
});

it('is a circle, or rounded with square', () => {
  render(<Avatar data-testid="c" name="Ada" />);
  render(<Avatar data-testid="s" name="Ada" shape="square" />);
  expect(
    getComputedStyle(face(screen.getByTestId('c'))).borderTopLeftRadius,
  ).toBe('9999px');
  expect(
    getComputedStyle(face(screen.getByTestId('s'))).borderTopLeftRadius,
  ).toBe('12px');
});

function shape(status: AvatarStatus) {
  render(<Avatar data-testid={status} name="Ada" status={status} />);
  const style = getComputedStyle(dot(screen.getByTestId(status)));
  const after = getComputedStyle(dot(screen.getByTestId(status)), '::after');
  return {
    ring: parseFloat(style.borderTopWidth) > 0,
    solid: style.backgroundColor !== 'rgba(0, 0, 0, 0)',
    halfFilled: style.backgroundImage.includes('gradient'),
    bar: after.content !== 'none' && after.content !== 'normal',
  };
}

it('each status dot has its own shape', () => {
  const online = shape('online');
  const away = shape('away');
  const busy = shape('busy');
  const offline = shape('offline');
  expect(online).toEqual({
    ring: false,
    solid: true,
    halfFilled: false,
    bar: false,
  });
  expect(busy).toEqual({
    ring: false,
    solid: true,
    halfFilled: false,
    bar: true,
  });
  expect(away).toEqual({
    ring: true,
    solid: false,
    halfFilled: true,
    bar: false,
  });
  expect(offline).toEqual({
    ring: true,
    solid: false,
    halfFilled: false,
    bar: false,
  });
});

it.each(['light', 'dark'] as const)(
  'each status color reaches 3:1 on canvas, surface, and raised in %s mode',
  (mode) => {
    document.documentElement.dataset.dsMode = mode;
    const surfaces = ['canvas', 'surface', 'raised'].map((name) =>
      token(`--ds-color-bg-${name}`),
    );
    for (const status of ['online', 'away', 'busy', 'offline'] as const) {
      render(
        <Avatar data-testid={`${mode}-${status}`} name="Ada" status={status} />,
      );
      const style = getComputedStyle(
        dot(screen.getByTestId(`${mode}-${status}`)),
      );
      const color =
        parseFloat(style.borderTopWidth) > 0
          ? style.borderTopColor
          : style.backgroundColor;
      for (const surface of surfaces) {
        expect(
          contrastRatio(color, surface),
          `${status} on ${surface}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  },
);

it.each(['light', 'dark'] as const)(
  'the six name colors reach 4.5:1 in %s mode',
  (mode) => {
    document.documentElement.dataset.dsMode = mode;
    // One sample name per pair, 1 to 6.
    const names = [
      'Person 4',
      'Person 3',
      'Person 2',
      'Person 1',
      'Person 0',
      'Person 5',
    ];
    const backgrounds = new Set<string>();
    for (const name of names) {
      render(<Avatar name={name} colorFromName />);
      const style = getComputedStyle(screen.getByText(initialsOf(name)));
      backgrounds.add(style.backgroundColor);
      expect(
        contrastRatio(style.color, style.backgroundColor),
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(backgrounds.size).toBe(6);
  },
);

function initialsOf(name: string) {
  const [first, last] = name.split(' ');
  return `${first![0]}${last![0]}`;
}

it.each(['ltr', 'rtl'] as const)(
  'the status dot sits at the bottom end corner, with a gap cut, in %s',
  (dir) => {
    document.documentElement.dir = dir;
    render(<Avatar data-testid="a" name="Ada" size="xl" status="online" />);
    const root = screen.getByTestId('a').getBoundingClientRect();
    const d = dot(screen.getByTestId('a')).getBoundingClientRect();
    expect(d.bottom).toBe(root.bottom);
    if (dir === 'ltr') expect(d.right).toBe(root.right);
    else expect(d.left).toBe(root.left);
    expect(d.width).toBe(16);
    const mask = getComputedStyle(face(screen.getByTestId('a'))).maskImage;
    expect(mask).toContain('radial-gradient');
    // The cut's center follows the dot: near the right edge in LTR, the left in RTL.
    expect(mask).toContain(dir === 'ltr' ? 'calc(100% - 8px)' : 'at 8px');
  },
);

it('forced colors draws a 1px edge', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  render(<Avatar data-testid="a" name="Ada Park" />);
  const edge = getComputedStyle(face(screen.getByTestId('a')), '::after');
  expect(edge.borderTopWidth).toBe('1px');
  expect(edge.borderTopStyle).toBe('solid');
  expect(edge.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
});
