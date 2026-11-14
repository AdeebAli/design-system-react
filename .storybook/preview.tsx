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
    // Sidebar order (Spec 18). Groups and their components follow
    // docs/components.md; each component's docs page comes first.
    options: {
      storySort: {
        order: [
          'Overview',
          ['Welcome', 'Accessibility'],
          'Foundations',
          [
            'Colors',
            'Typography',
            'Spacing',
            'Radii',
            'Shadows',
            'Motion',
            'Primitives',
          ],
          'Components',
          [
            'Layout',
            [
              'Box',
              ['Docs', 'All style props', '*'],
              'Flex',
              ['Docs', '*'],
              'Stack',
              ['Docs', '*'],
              'Inline',
              ['Docs', '*'],
              'Grid',
              ['Docs', '*'],
              'Container',
              ['Docs', '*'],
              'Center',
              ['Docs', '*'],
              'Inset',
              ['Docs', '*'],
            ],
            'Typography',
            [
              'Text',
              ['Docs', '*'],
              'Heading',
              ['Docs', '*'],
              'Link',
              ['Docs', '*'],
              'Code',
              ['Docs', '*'],
              'Kbd',
              ['Docs', '*'],
              'VisuallyHidden',
              ['Docs', '*'],
              'Prose',
              ['Docs', '*'],
            ],
            'Icons',
            ['Icon', ['Docs', '*']],
            'Display',
            [
              'Card',
              ['Docs', '*'],
              'Stat',
              ['Docs', '*'],
              'Badge',
              ['Docs', '*'],
            ],
            'Forms and actions',
            [
              'Field',
              ['Docs', '*'],
              'Input',
              ['Docs', '*'],
              'Textarea',
              ['Docs', '*'],
              'Select',
              ['Docs', '*'],
              'Checkbox',
              ['Docs', '*'],
              'RadioGroup',
              ['Docs', '*'],
              'Switch',
              ['Docs', '*'],
              'ToggleChip',
              ['Docs', '*'],
              'ToggleChipGroup',
              ['Docs', '*'],
              'Button',
              ['Docs', '*'],
              'IconButton',
              ['Docs', '*'],
              'ColorModeToggle',
              ['Docs', '*'],
            ],
            'Advanced inputs',
            [
              'Combobox',
              ['Docs', '*'],
              'MultiSelect',
              ['Docs', '*'],
              'FileUpload',
              ['Docs', '*'],
            ],
            'Navigation',
            ['NavBar', ['Docs', '*'], 'Tabs', ['Docs', '*']],
            'App navigation',
            [
              'Sidebar',
              ['Docs', '*'],
              'Breadcrumbs',
              ['Docs', '*'],
              'Accordion',
              ['Docs', '*'],
            ],
            'Overlays',
            [
              'Dialog',
              ['Docs', '*'],
              'Popover',
              ['Docs', '*'],
              'Tooltip',
              ['Docs', '*'],
              'Menu',
              ['Docs', '*'],
              'Toast',
              ['Docs', '*'],
              'Drawer',
              ['Docs', '*'],
            ],
            'Data',
            [
              'Table',
              ['Docs', '*'],
              'DataTable',
              ['Docs', '*'],
              'Pagination',
              ['Docs', '*'],
              'Skeleton',
              ['Docs', '*'],
              'EmptyState',
              ['Docs', '*'],
            ],
            'Feedback and display',
            [
              'Alert',
              ['Docs', '*'],
              'Spinner',
              ['Docs', '*'],
              'Progress',
              ['Docs', '*'],
              'Divider',
              ['Docs', '*'],
              'Avatar',
              ['Docs', '*'],
            ],
            'Image',
            ['Image', ['Docs', '*']],
          ],
          'Patterns',
          [
            'Layout',
            'Bento',
            'Forms',
            'Advanced inputs',
            'Data',
            'Navigation and prose',
            'App navigation',
            'Overlays',
            'Feedback',
          ],
          'Guides',
          [
            'Themes',
            'Fonts',
            'Server rendering',
            'Using tokens',
            'Migrating to tokens',
            'UI and styling standards',
            'React Hook Form',
            'Markdown and MDX',
          ],
        ],
      },
    },
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
