import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ColorModeScript } from './ColorModeScript';
import { getColorModeScript } from './getColorModeScript';

interface Setup {
  stored?: string;
  storageThrows?: boolean;
  defaultMode?: 'system' | 'light' | 'dark';
  forcedMode?: 'light' | 'dark';
  storageKey?: string;
}

function runScript({ stored, storageThrows, ...options }: Setup) {
  let attribute: string | null = null;
  const key = options.storageKey ?? 'ds-color-mode';
  const fakeDocument = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        expect(name).toBe('data-ds-mode');
        attribute = value;
      },
    },
  };
  const fakeStorage = {
    getItem: (asked: string) => {
      if (storageThrows) throw new Error('blocked');
      return asked === key ? (stored ?? null) : null;
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const run = new Function(
    'document',
    'localStorage',
    getColorModeScript(options),
  ) as (document: unknown, localStorage: unknown) => void;
  run(fakeDocument, fakeStorage);
  return attribute;
}

it.each<[Setup, string | null]>([
  [{ stored: 'dark' }, 'dark'],
  [{ stored: 'light', defaultMode: 'dark' }, 'light'],
  [{ stored: 'system', defaultMode: 'dark' }, null],
  [{ stored: 'purple', defaultMode: 'light' }, 'light'],
  [{ storageThrows: true, defaultMode: 'dark' }, 'dark'],
  [{ stored: 'light', forcedMode: 'dark' }, 'dark'],
  [{ storageThrows: true, forcedMode: 'light' }, 'light'],
  [{}, null],
  [{ defaultMode: 'dark' }, 'dark'],
  [{ stored: 'dark', storageKey: 'custom' }, 'dark'],
])('%j sets %s', (setup, expected) => {
  expect(runScript(setup)).toBe(expected);
});

it("can't be broken out of through storageKey", () => {
  expect(getColorModeScript({ storageKey: '</script><b>' })).not.toContain('<');
});

it('renders a script element with the same code and the nonce', () => {
  const html = renderToString(createElement(ColorModeScript, { nonce: 'n' }));
  expect(html).toContain('<script');
  expect(html).toContain('nonce="n"');
  expect(html).toContain('data-ds-mode');
});
