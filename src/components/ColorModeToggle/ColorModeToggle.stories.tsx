import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ColorModeToggle } from './ColorModeToggle';

const meta: Meta<typeof ColorModeToggle> = {
  title: 'Components/Forms and actions/ColorModeToggle',
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
};

export default meta;
type Story = StoryObj<typeof ColorModeToggle>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <>
      <ColorModeToggle variant="ghost" />
      <ColorModeToggle variant="soft" />
      <ColorModeToggle variant="outline" />
    </>
  ),
};
