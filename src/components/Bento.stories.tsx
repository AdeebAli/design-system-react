import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Card } from './Card';
import { Container } from './Container';
import { Grid } from './Grid';
import { Heading } from './Heading';
import { Inline } from './Inline';
import { Inset } from './Inset';
import { Stack } from './Stack';
import { Stat } from './Stat';
import { Text } from './Text';

const meta: Meta = {
  title: 'Overview/Bento',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bento layouts from `Grid`, `Card`, `Stat`, and `Badge`, with no `style` or `className`. Wide cards fill the row below `md`, so the layout collapses to two columns on phones. `autoRows="equal"` evens the rows, and `marginTop="auto"` pushes a card’s last item to its bottom.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Dashboard: Story = {
  render: () => (
    <Container>
      <Inset y="6">
        <Stack gap="4">
          <Heading level={1}>Workspace</Heading>
          <Grid columns={{ base: '2', md: '4' }} autoRows="equal">
            <Card span="2x2">
              <Inline>
                <Badge tone="accent" variant="solid">
                  Pro
                </Badge>
                <Badge>Annual</Badge>
                <Badge tone="success">Active</Badge>
              </Inline>
              <Heading level={2} size="2xl" marginTop="auto">
                Northwind Labs
              </Heading>
              <Stat label="Revenue" value="$21.4k" change="4.1" trend="up" />
            </Card>
            <Card>
              <Stat label="Seats" value="38" />
            </Card>
            <Card>
              <Stat label="Uptime" value="99.9%" hint="Last 30 days" />
            </Card>
            <Card>
              <Stat
                label="Open incidents"
                value="3"
                change="2"
                trend="up"
                sentiment="negative"
              />
            </Card>
            <Card surface="sunken">
              <Stat label="Churn" value="2.3%" change="0.4" trend="down" />
            </Card>
            <Card span="4x1">
              <Inline justify="between">
                <Stack gap="1">
                  <Heading level={2} size="lg">
                    Renewal
                  </Heading>
                  <Text tone="muted">The annual plan renews on March 1.</Text>
                </Stack>
                <Badge tone="warning">Due soon</Badge>
              </Inline>
            </Card>
          </Grid>
        </Stack>
      </Inset>
    </Container>
  ),
};

const POSTS = [
  {
    slug: 'first',
    title: 'Designing with tokens',
    topic: 'Design',
    minutes: 6,
  },
  {
    slug: 'second',
    title: 'Forms that explain themselves',
    topic: 'Forms',
    minutes: 9,
  },
  { slug: 'third', title: 'A calmer dark mode', topic: 'Color', minutes: 4 },
];

export const BlogHome: Story = {
  render: () => (
    <Container>
      <Inset y="6">
        <Grid columns={{ base: '2', md: '4' }} autoRows="equal">
          <Card span="2x2" padding="lg">
            <Badge tone="accent">Featured</Badge>
            <Heading level={1} size="3xl" marginTop="auto">
              Notes on building a design system
            </Heading>
            <Text tone="muted">
              What changed after rebuilding the same form controls in every
              project.
            </Text>
          </Card>
          <Card span="2x1" surface="sunken">
            <Heading level={2} size="lg">
              About
            </Heading>
            <Text>Short essays on interfaces, typography, and tooling.</Text>
          </Card>
          {POSTS.map((post) => (
            <Card
              key={post.slug}
              as="a"
              href={`#${post.slug}`}
              interactive
              span={post.slug === 'first' ? '2x1' : '1x1'}
            >
              <Badge>{post.topic}</Badge>
              <Heading level={2} size="lg" marginTop="auto">
                {post.title}
              </Heading>
              <Text size="sm" tone="muted">
                {post.minutes} min read
              </Text>
            </Card>
          ))}
        </Grid>
      </Inset>
    </Container>
  ),
};
