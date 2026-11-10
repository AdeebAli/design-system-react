import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic, Trash2, Underline } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Inline } from '../Inline';
import { Link } from '../Link';
import { Tooltip, TooltipProvider } from './index';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "A short text hint on hover or keyboard focus. It is visual only: Base UI adds no ARIA, so `content` isn't announced and the trigger needs its own name, such as `aria-label` on an `IconButton`. It doesn't appear on touch screens, so never put needed information in one. `delay` applies to hover only; keyboard focus opens it immediately. `TooltipProvider` is optional: inside one, a second tooltip opens without delay soon after the first closes. A natively `disabled` button fires no hover or focus events, so its tooltip won't open: use `aria-disabled` instead of `disabled`, or wrap it in a focusable element.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const body = () => within(document.body);

export const OnIconButton: Story = {
  render: () => (
    <Tooltip content="Delete project" delay={0}>
      <IconButton aria-label="Delete project" icon={<Icon icon={Trash2} />} />
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      within(canvasElement).getByRole('button', { name: 'Delete project' }),
    );
    const tip = await body().findByText('Delete project', {
      selector: '[data-open]',
    });
    await waitFor(() => expect(tip).toBeVisible());
  },
};

export const Sides: Story = {
  render: () => (
    <Inline gap="3" justify="center" style={{ paddingBlock: '5rem' }}>
      <Tooltip content="Top" side="top">
        <Button variant="soft">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" side="bottom">
        <Button variant="soft">Bottom</Button>
      </Tooltip>
      <Tooltip content="Start" side="start">
        <Button variant="soft">Start</Button>
      </Tooltip>
      <Tooltip content="End" side="end">
        <Button variant="soft">End</Button>
      </Tooltip>
    </Inline>
  ),
};

/** Inside a `TooltipProvider`, moving along the toolbar opens each tooltip without the hover delay. */
export const ToolbarInProvider: Story = {
  render: () => (
    <TooltipProvider delay={400}>
      <Inline gap="1">
        <Tooltip content="Bold">
          <IconButton aria-label="Bold" icon={<Icon icon={Bold} />} />
        </Tooltip>
        <Tooltip content="Italic">
          <IconButton aria-label="Italic" icon={<Icon icon={Italic} />} />
        </Tooltip>
        <Tooltip content="Underline">
          <IconButton aria-label="Underline" icon={<Icon icon={Underline} />} />
        </Tooltip>
      </Inline>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await waitFor(() => expect(body().getByText('Bold')).toBeVisible());
    await expect(
      within(canvasElement).getByRole('button', { name: 'Bold' }),
    ).not.toHaveAttribute('aria-describedby');
  },
};

export const OnLink: Story = {
  render: () => (
    <Tooltip content="Opens the docs" delay={0}>
      <Link href="#docs">Documentation</Link>
    </Tooltip>
  ),
};

/** A natively `disabled` button fires no hover or focus, so use `aria-disabled` to keep the tooltip. */
export const DisabledButton: Story = {
  render: () => (
    <Tooltip content="You need edit access" delay={0}>
      <Button aria-disabled="true" onClick={(event) => event.preventDefault()}>
        Publish
      </Button>
    </Tooltip>
  ),
};
