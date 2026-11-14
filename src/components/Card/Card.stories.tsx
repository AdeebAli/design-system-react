import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Box } from '../Box';
import { Grid } from '../Grid';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Display/Card',
  component: Card,
  args: { children: <Text>Card content</Text> },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

export const Spans: Story = {
  render: () => (
    <Grid columns={{ base: '2', md: '4' }} autoRows="equal">
      <Card span="2x2">
        <Text>2×2</Text>
      </Card>
      <Card>
        <Text>1×1</Text>
      </Card>
      <Card span="1x2">
        <Text>1×2</Text>
      </Card>
      <Card>
        <Text>1×1</Text>
      </Card>
      <Card span="3x1">
        <Text>3×1</Text>
      </Card>
      <Card>
        <Text>1×1</Text>
      </Card>
      <Card span="4x1">
        <Text>4×1</Text>
      </Card>
      <Card span="full">
        <Text>full</Text>
      </Card>
    </Grid>
  ),
};

export const Padding: Story = {
  render: () => (
    <Grid columns={{ base: '1', md: '4' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} padding={padding}>
          <Text>padding {padding}</Text>
        </Card>
      ))}
    </Grid>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <Grid columns="2">
      <Card>
        <Text>default</Text>
      </Card>
      <Card surface="sunken">
        <Text>sunken</Text>
      </Card>
      <Card span="2x1">
        <Text>A default card holding a sunken one</Text>
        <Card surface="sunken">
          <Text tone="muted">sunken, inside</Text>
        </Card>
      </Card>
    </Grid>
  ),
};

export const PushToBottom: Story = {
  render: () => (
    <Grid columns="2" autoRows="equal">
      <Card>
        <Heading level={3}>Short</Heading>
        <Text tone="muted" marginTop="auto">
          Sits at the bottom
        </Text>
      </Card>
      <Card>
        <Heading level={3}>Taller</Heading>
        <Text>
          The text in this card runs long enough to wrap onto several lines, so
          its row is taller than the other card needs.
        </Text>
        <Text tone="muted" marginTop="auto">
          Sits at the bottom
        </Text>
      </Card>
    </Grid>
  ),
};

export const ClippedImage: Story = {
  render: () => (
    <Box maxWidth="container.sm">
      <Card padding="none" clip>
        <Box height="full" minHeight="20" background="accentSubtle" />
        <Box padding="4">
          <Text>A full-bleed block follows the card&apos;s corners.</Text>
        </Box>
      </Card>
    </Box>
  ),
};

export const InteractiveLink: Story = {
  render: () => (
    <Grid columns={{ base: '1', md: '3' }}>
      <Card as="a" href="#first-post" interactive>
        <Heading level={3}>First post</Heading>
        <Text tone="muted">A short summary.</Text>
      </Card>
      <Card as="a" href="#second-post" interactive>
        <Heading level={3}>Second post</Heading>
        <Text tone="muted">Another short summary.</Text>
      </Card>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('link', {
      name: /First post/,
    });
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
  },
};

/**
 * Check by hand in forced-colors mode (Spec 05): each card keeps a visible
 * edge, because its 1px border is drawn even when the theme makes it
 * transparent.
 */
export const ForcedColorsCheck: Story = {
  render: () => (
    <Grid columns="3">
      <Card>
        <Text>default</Text>
      </Card>
      <Card surface="sunken">
        <Text>sunken</Text>
      </Card>
      <Card as="a" href="#x" interactive>
        <Text>interactive</Text>
      </Card>
    </Grid>
  ),
};
