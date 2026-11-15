import type { Meta, StoryObj } from '@storybook/react-vite';
import { StyleProps } from './StyleProps';
import { TokenCard } from './TokenCard';

const meta: Meta = { title: 'Guides/Using tokens' };

export default meta;
type Story = StoryObj;

export const StylePropsExample: Story = {
  name: 'Style props',
  render: () => <StyleProps />,
};

export const VarsExample: Story = {
  name: 'vars in vanilla-extract',
  render: () => <TokenCard />,
};
