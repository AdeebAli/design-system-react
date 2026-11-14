import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card';
import { Grid } from '../Grid';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Components/Display/Stat',
  component: Stat,
  args: { label: 'Revenue', value: '$21.4k', change: '4.1', trend: 'up' },
  parameters: {
    docs: {
      description: {
        component:
          'A labeled number. Pass `change` without a sign when using `trend`, so it reads "Down 4.1". `trend` adds an arrow and hidden text, so color is never the only signal. Set `sentiment` when an increase is bad, such as incidents. `Stat` has no surface: put it in a `Card`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Grid columns={{ base: '1', md: '3' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Card key={size}>
          <Stat label={`Size ${size}`} value="38" size={size} />
        </Card>
      ))}
    </Grid>
  ),
};

export const Trends: Story = {
  render: () => (
    <Grid columns={{ base: '1', md: '3' }}>
      <Card>
        <Stat label="Revenue" value="$21.4k" change="4.1" trend="up" />
      </Card>
      <Card>
        <Stat label="Churn" value="2.3%" change="0.4" trend="down" />
      </Card>
      <Card>
        <Stat label="Seats" value="38" change="0" trend="flat" />
      </Card>
    </Grid>
  ),
};

export const Sentiment: Story = {
  render: () => (
    <Grid columns={{ base: '1', md: '2' }}>
      <Card>
        <Stat
          label="Open incidents"
          value="3"
          change="2"
          trend="up"
          sentiment="negative"
        />
      </Card>
      <Card>
        <Stat
          label="Response time"
          value="180ms"
          change="40ms"
          trend="down"
          sentiment="positive"
        />
      </Card>
    </Grid>
  ),
};

export const WithHint: Story = {
  args: { hint: 'This month' },
};

export const ValueOnly: Story = {
  args: {
    label: 'Uptime',
    value: '99.9%',
    change: undefined,
    trend: undefined,
  },
};
