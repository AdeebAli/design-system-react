import type { Meta, StoryObj } from '@storybook/react-vite';
import { X } from 'lucide-react';
import { Box } from '../Box';
import { Icon } from '../Icon';
import { VisuallyHidden } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/Typography/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    docs: {
      description: {
        component:
          'Text for screen readers only. `focusable` makes it appear when focused, for skip links, which use `as="a"`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <p>
        Visible text, with hidden text after it. <Story />
      </p>
    ),
  ],
  args: { children: 'Only screen readers read this' },
};

export const NamingAButton: Story = {
  render: () => (
    <Box as="button" type="button" padding="2">
      <Icon icon={X} />
      <VisuallyHidden>Close</VisuallyHidden>
    </Box>
  ),
};

export const SkipLink: Story = {
  name: 'Skip link (tab to reveal)',
  render: () => (
    <>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <main id="main">Press Tab to reveal the skip link.</main>
    </>
  ),
};
