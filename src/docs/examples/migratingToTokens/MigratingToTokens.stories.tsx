import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanCardAfter } from './After';

const meta: Meta = { title: 'Guides/Migrating to tokens' };

export default meta;
type Story = StoryObj;

// Only the result is a story: the "before" ignores dark mode on purpose.
export const After: Story = { render: () => <PlanCardAfter /> };
