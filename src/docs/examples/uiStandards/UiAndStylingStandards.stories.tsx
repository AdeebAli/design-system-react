import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignUpForm } from './SignUpForm';

const meta: Meta = { title: 'Guides/UI and styling standards' };

export default meta;
type Story = StoryObj;

export const Form: Story = { render: () => <SignUpForm /> };
