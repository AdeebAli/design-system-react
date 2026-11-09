import { render, screen } from '@testing-library/react';
import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { badge } from './Badge.css';
import { Badge, type BadgeTone } from './index';

const TONES: BadgeTone[] = [
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
];

it.each(
  TONES.flatMap((tone) =>
    (['soft', 'solid'] as const).map((variant) => [tone, variant] as const),
  ),
)('Badge %s %s applies its class', (tone, variant) => {
  render(
    <Badge data-testid="b" tone={tone} variant={variant}>
      Label
    </Badge>,
  );
  expect(screen.getByTestId('b').className).toContain(
    badge({ tone, variant, size: 'md' }),
  );
});

it('defaults to neutral soft md', () => {
  render(<Badge data-testid="b">Label</Badge>);
  expect(screen.getByTestId('b').className).toContain(
    badge({ tone: 'neutral', variant: 'soft', size: 'md' }),
  );
});

it('renders a span', () => {
  render(<Badge data-testid="b">Label</Badge>);
  expect(screen.getByTestId('b').tagName).toBe('SPAN');
});

it('renders startIcon before the text', () => {
  render(
    <Badge
      data-testid="b"
      startIcon={<Icon icon={ArrowUpIcon} data-testid="i" />}
    >
      Label
    </Badge>,
  );
  const root = screen.getByTestId('b');
  expect(root.firstElementChild).toContainElement(screen.getByTestId('i'));
  expect(root.lastElementChild).toHaveTextContent('Label');
});
