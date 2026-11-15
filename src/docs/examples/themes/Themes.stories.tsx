import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromoCard } from './oneOff';

// Only examples that render without ThemeProvider are stories: a provider
// sets the whole document's color mode and theme (Spec 18, Departure 5).
const meta: Meta = { title: 'Guides/Themes' };

export default meta;
type Story = StoryObj;

export const OneOffChange: Story = {
  name: 'One-off change',
  render: () => <PromoCard />,
};
