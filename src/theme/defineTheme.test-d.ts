import { softDark } from '../themes/softDark';
import { defineFullTheme, defineTheme } from './defineTheme';

test('defineTheme accepts valid overrides', () => {
  defineTheme({ shared: { radius: { control: '8px' } } });
  defineTheme({ shared: { zIndex: { modal: 10 } } });
  defineTheme({
    shared: { font: { weight: { bold: 800 }, lineHeight: { tight: 1.1 } } },
  });
});

test('defineTheme rejects unknown tokens and wrong value types', () => {
  // @ts-expect-error unknown token
  defineTheme({ shared: { radius: { controll: '8px' } } });
  // @ts-expect-error a number outside zIndex, font.weight, and font.lineHeight
  defineTheme({ shared: { radius: { control: 8 } } });
  // @ts-expect-error a number for a font size
  defineTheme({ light: { font: { size: { md: 14 } } } });
  // @ts-expect-error unknown mode
  defineTheme({ dim: {} });
});

test('defineFullTheme requires every token', () => {
  // @ts-expect-error a missing token
  defineFullTheme({ light: { color: {} }, dark: softDark });
});
