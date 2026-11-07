import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
};

export default meta;

export const Playground: StoryObj<typeof Box> = {
  args: { children: 'Box' },
};
