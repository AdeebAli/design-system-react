import { render, screen } from '@testing-library/react';
import * as styles from './Stat.css';
import { Stat } from './index';

const definitions = () => screen.getAllByRole('definition');

it('renders a dl with a dt and dd', () => {
  const { container } = render(<Stat label="Seats" value="38" />);
  expect(container.firstElementChild?.tagName).toBe('DL');
  expect(screen.getByRole('term')).toHaveTextContent('Seats');
  expect(definitions()).toHaveLength(1);
  expect(definitions()[0]).toHaveTextContent('38');
});

it.each([
  ['up', undefined, 'positive'],
  ['down', undefined, 'negative'],
  ['flat', undefined, 'neutral'],
  ['up', 'negative', 'negative'],
] as const)(
  'trend %s with sentiment %s colors the change %s',
  (trend, sentiment, expected) => {
    render(
      <Stat
        label="L"
        value="1"
        change="2"
        trend={trend}
        sentiment={sentiment}
      />,
    );
    expect(definitions()[1]?.className).toContain(styles.sentiment[expected]);
  },
);

it('change without trend or sentiment is muted', () => {
  render(<Stat label="L" value="1" change="2" />);
  expect(definitions()[1]?.className).toContain(styles.sentiment.neutral);
});

it('puts the arrow and hidden trend text in the change dd', () => {
  render(<Stat label="Revenue" value="1" change="4.1" trend="down" />);
  const change = definitions()[1];
  expect(change).toHaveTextContent('Down 4.1');
  expect(change?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('renders a trend without a change', () => {
  render(<Stat label="L" value="1" trend="up" />);
  expect(definitions()[1]?.textContent).toBe('Up');
});

it('trendLabels replaces the hidden text', () => {
  render(
    <Stat
      label="L"
      value="1"
      change="3"
      trend="flat"
      trendLabels={{ up: 'Hausse', down: 'Baisse', flat: 'Stable' }}
    />,
  );
  expect(definitions()[1]).toHaveTextContent('Stable 3');
});

it('renders 0 for value and change', () => {
  render(<Stat label="Errors" value={0} change={0} trend="flat" />);
  expect(definitions().map((d) => d.textContent)).toEqual(['0', 'No change 0']);
});

it('renders a hint below the value', () => {
  render(<Stat label="L" value="1" hint="This month" />);
  expect(definitions()[1]).toHaveTextContent('This month');
});

it('size sets the value size', () => {
  render(<Stat label="L" value="1" size="lg" />);
  expect(definitions()[0]?.className).toContain(styles.value.lg);
});
