import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ColorModeToggle } from './ColorModeToggle';

const meta: Meta<typeof ColorModeToggle> = {
  title: 'Components/ColorModeToggle',
  component: ColorModeToggle,
  decorators: [
    (Story, context) => (
      // Starts from the toolbar's mode, so both story modes stay stable.
      <ThemeProvider
        defaultMode={context.globals.mode === 'dark' ? 'dark' : 'light'}
        storageKey="ds-storybook-toggle"
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'An `IconButton` that switches between light and dark through `useColorMode`. Clicking stores the opposite of what’s on screen; "system" stays the starting point until someone clicks. Before hydration it renders an icon-less button with a neutral name, at its final size. It renders nothing when the mode is forced. For a three-way light, dark, and system choice, build a menu with `useColorMode`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorModeToggle>;

export const Playground: Story = {};
