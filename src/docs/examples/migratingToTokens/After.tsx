import { Card, Heading, Link, Text } from '../../../index';

// After: the card's surface, border, and shadow come from the theme; the
// layout comes from Card's gap; colors are roles, not hex values.
export function PlanCardAfter() {
  return (
    <Card gap="3">
      <Heading level={3} size="xl">
        Pro plan
      </Heading>
      <Text size="md" tone="muted">
        For teams that ship every week.
      </Text>
      <Link href="/upgrade">Upgrade</Link>
    </Card>
  );
}
