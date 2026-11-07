import './fonts.css';
import '../src/styles';
import type { Preview } from '@storybook/react-vite';

declare const __DS_MODE__: string | undefined;

const defaultMode = typeof __DS_MODE__ === 'string' ? __DS_MODE__ : 'light';

const preview: Preview = {
  initialGlobals: { mode: defaultMode },
  globalTypes: {
    mode: {
      description: 'Color mode, set through data-ds-mode',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    // Every story fails on an axe violation (Spec 01).
    a11y: { test: 'error' },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute(
        'data-ds-mode',
        String(context.globals.mode),
      );
      return <Story />;
    },
  ],
};

export default preview;
