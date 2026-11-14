import './fonts.css';
import '../src/styles';
import type { Preview } from '@storybook/react-vite';
import { parameters as reactDocs } from '@storybook/react/entry-preview-argtypes';
import { collapseTypeSummary } from '../src/docs/blocks/collapseTypes';

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
    docs: {
      // <ArgTypes of={Component}> reads this, not argTypesEnhancers. Props
      // tables expand unions, so ElementType, ReactNode, and ReactElement are
      // read back as their names (Spec 18, Props tables).
      extractArgTypes: (component: unknown) => {
        const argTypes = reactDocs.docs.extractArgTypes(component);
        if (!argTypes) return argTypes;
        for (const argType of Object.values(argTypes)) {
          const type = argType.table?.type;
          if (type?.summary) type.summary = collapseTypeSummary(type.summary);
        }
        return argTypes;
      },
    },
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
