import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Box } from '../Box';
import { Card } from '../Card';
import { Grid } from '../Grid';
import { Heading } from '../Heading';
import { Prose } from '../Prose';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Image } from './Image';

// Self-contained pictures, so the stories need no network.
const landscape = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f9a8d4"/></linearGradient></defs><rect width="1200" height="800" fill="url(#s)"/><circle cx="840" cy="300" r="110" fill="#fb923c"/><path d="M0 560 L300 380 L560 560 L820 420 L1200 600 L1200 800 L0 800 Z" fill="#4338ca"/><path d="M0 660 L380 520 L760 680 L1200 560 L1200 800 L0 800 Z" fill="#312e81"/></svg>',
)}`;
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><rect width="600" height="900" fill="#c7d2fe"/><circle cx="300" cy="330" r="150" fill="#4338ca"/><rect x="90" y="540" width="420" height="420" rx="210" fill="#4338ca"/></svg>',
)}`;

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  args: {
    src: landscape,
    alt: 'Mountains at sunset',
    ratio: '16/9',
    maxWidth: 'container.sm',
  },
  parameters: {
    docs: {
      description: {
        component: `An image in a frame that reserves its space, so nothing shifts as it loads. Its corners come from \`radius.image\`. \`skeleton\` shows a \`Skeleton\` until it loads, and a fallback shows if it fails, while the \`alt\` still names it.

**Size.** Set \`ratio\` (a preset, such as \`"16/9"\`, or any positive number, such as \`{16 / 10}\`), or both \`htmlWidth\` and \`htmlHeight\`, the image's intrinsic size. With neither, the frame takes the image's own shape once it loads, and a skeleton or fallback has no height of its own.

**Writing \`alt\`.** \`alt\` is required. Say what the image shows that matters here, as you would to someone on the phone: "The dashboard on a laptop", not "image of a laptop". Use \`alt=""\` when the image is decorative, or when the text beside it already says the same thing, such as a product photo next to its name. A screen reader then skips it.

**With \`next/image\`.** Pass it as \`as\`, so Next keeps resizing and optimizing the image:

\`\`\`tsx
import NextImage from 'next/image';
import hero from './hero.png';

<Image as={NextImage} src={hero} alt="The dashboard on a laptop" ratio="3/2" fill sizes="(min-width: 768px) 50vw, 100vw" />

<Image as={NextImage} src="/team.jpg" alt="The team at the offsite" htmlWidth={1200} htmlHeight={800} />
\`\`\`

Use \`fill\` and \`sizes\` with a \`ratio\`, or give Next the intrinsic size through \`htmlWidth\` and \`htmlHeight\`. Layout \`width\` and \`height\` are tokens on the frame. \`placeholder="blur"\` paints a blurred preview on the image itself, so use it without \`skeleton\`.

**The fallback is decorative.** It's hidden from screen readers, since the \`alt\` already names the image, so don't put a link or a button in it. Put a retry action beside the image instead.

**Image or Avatar.** Use \`Avatar\` for a person or an organization: it shows initials while it loads or if it fails, and its name is the person's. Use \`Image\` for everything else: photos, screenshots, illustrations, and maps.

**In a \`Card\` with \`clip\`,** use \`radius="none"\`, since the card rounds the corners.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Playground: Story = {};

export const Ratios: Story = {
  render: (args) => (
    <Grid columns={{ base: '1', md: '3' }} gap="4">
      {(['1/1', '4/3', '3/2', '16/9', '21/9'] as const).map((ratio) => (
        <Stack gap="2" key={ratio}>
          <Image {...args} maxWidth={undefined} ratio={ratio} />
          <Text size="sm" tone="muted">
            {ratio}
          </Text>
        </Stack>
      ))}
      <Stack gap="2">
        <Image {...args} maxWidth={undefined} ratio={16 / 10} />
        <Text size="sm" tone="muted">
          16 / 10
        </Text>
      </Stack>
    </Grid>
  ),
};

/** `cover` fills the frame and crops. `contain` shows the whole image. */
export const Fits: Story = {
  render: (args) => (
    <Grid columns={{ base: '1', md: '2' }} gap="4">
      <Image
        {...args}
        src={portrait}
        alt="A portrait"
        maxWidth={undefined}
        fit="cover"
      />
      <Image
        {...args}
        src={portrait}
        alt="A portrait"
        maxWidth={undefined}
        fit="contain"
      />
    </Grid>
  ),
};

export const Radii: Story = {
  render: (args) => (
    <Grid columns={{ base: '2', md: '3' }} gap="4">
      {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((radius) => (
        <Stack gap="2" key={radius}>
          <Image {...args} maxWidth={undefined} ratio="1/1" radius={radius} />
          <Text size="sm" tone="muted">
            {radius}
          </Text>
        </Stack>
      ))}
    </Grid>
  ),
};

/** The intrinsic size reserves the space, with no ratio to work out. */
export const IntrinsicSize: Story = {
  args: { ratio: undefined, htmlWidth: 1200, htmlHeight: 800 },
};

/** A skeleton shows until the image loads. These images load at once. */
export const WithSkeleton: Story = {
  args: { skeleton: true },
};

export const Failed: Story = {
  args: { src: '/no-such-photo.png', alt: 'The office from the street' },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-error]')).not.toBeNull(),
    );
  },
};

export const FailedWithCustomFallback: Story = {
  args: {
    src: '/no-such-photo.png',
    alt: 'The office from the street',
    fallback: (
      <Text size="sm" tone="muted">
        Photo unavailable
      </Text>
    ),
  },
  play: Failed.play,
};

/** A decorative image that fails says nothing to a screen reader. */
export const FailedDecorative: Story = {
  args: { src: '/no-such-photo.png', alt: '' },
  play: Failed.play,
};

export const InACard: Story = {
  render: (args) => (
    <Card padding="none" clip maxWidth="container.sm">
      <Image
        {...args}
        maxWidth={undefined}
        alt="Office location"
        ratio={1.6}
        radius="none"
      />
      <Box padding="4">
        <Stack gap="1">
          <Heading level={3} size="md">
            Northwind Labs
          </Heading>
          <Text tone="muted">12 Harbor Street</Text>
        </Stack>
      </Box>
    </Card>
  ),
};

export const InProse: Story = {
  render: (args) => (
    <Prose>
      <p>The trail climbs for two hours before the ridge opens up.</p>
      <p>
        <Image {...args} maxWidth={undefined} />
      </p>
      <p>From the top, the whole valley is in view.</p>
    </Prose>
  ),
};
