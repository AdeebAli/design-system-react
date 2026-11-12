import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, SVGProps } from 'react';
import { Icon } from '../Icon';
import { CircleAlertIcon } from '../Icon/internal/CircleAlert';
import { CircleCheckIcon } from '../Icon/internal/CircleCheck';
import { InfoIcon } from '../Icon/internal/Info';
import { TriangleAlertIcon } from '../Icon/internal/TriangleAlert';
import { XIcon } from '../Icon/internal/X';
import * as styles from './Alert.css';
import { Alert } from './index';

/** An icon's drawing, to tell the icons apart. */
function drawing(component: ComponentType<SVGProps<SVGSVGElement>>) {
  const { container, unmount } = render(<Icon icon={component} />);
  const markup = container.querySelector('svg')!.innerHTML;
  unmount();
  return markup;
}

it.each([
  ['info', InfoIcon],
  ['success', CircleCheckIcon],
  ['warning', TriangleAlertIcon],
  ['danger', CircleAlertIcon],
] as const)('%s shows its own icon', (tone, IconComponent) => {
  const expected = drawing(IconComponent);
  render(
    <Alert data-testid="a" tone={tone}>
      Message
    </Alert>,
  );
  const svg = screen.getByTestId('a').querySelector('svg')!;
  expect(svg.innerHTML).toBe(expected);
  expect(svg).toHaveAttribute('aria-hidden', 'true');
});

it('defaults to the info tone', () => {
  render(<Alert data-testid="a">Message</Alert>);
  expect(screen.getByTestId('a')).toHaveAttribute('data-tone', 'info');
  expect(screen.getByTestId('a').querySelector('svg')!.innerHTML).toBe(
    drawing(InfoIcon),
  );
});

it('renders no empty parts for false or empty content', () => {
  const { container } = render(
    <Alert title="" action={false}>
      {false}
    </Alert>,
  );
  expect(container.querySelector(`.${styles.title}`)).toBeNull();
  expect(container.querySelector(`.${styles.body}`)).toBeNull();
  expect(container.querySelector(`.${styles.action}`)).toBeNull();
});

it('sets data-tone', () => {
  render(
    <Alert data-testid="a" tone="warning">
      Message
    </Alert>,
  );
  expect(screen.getByTestId('a')).toHaveAttribute('data-tone', 'warning');
});

it('icon={null} shows no icon', () => {
  render(
    <Alert data-testid="a" tone="danger" icon={null}>
      Message
    </Alert>,
  );
  expect(screen.getByTestId('a').querySelector('svg')).toBeNull();
});

it('shows a custom icon in place of the tone icon', () => {
  render(
    <Alert data-testid="a" icon={<Icon icon={XIcon} data-testid="custom" />}>
      Message
    </Alert>,
  );
  expect(screen.getByTestId('a').querySelectorAll('svg')).toHaveLength(1);
  expect(screen.getByTestId('custom')).toBeInTheDocument();
});

it('renders the title, body, and action, and the title is not a heading', () => {
  render(
    <Alert title="Your trial ends in 3 days" action={<button>Upgrade</button>}>
      Add a payment method.
    </Alert>,
  );
  expect(screen.getByText('Your trial ends in 3 days')).toBeInTheDocument();
  expect(screen.getByText('Add a payment method.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  expect(screen.queryByRole('heading')).toBeNull();
});

it('has no dismiss button without onDismiss', () => {
  render(<Alert>Message</Alert>);
  expect(screen.queryByRole('button')).toBeNull();
});

it('onDismiss adds a button named "Dismiss" that calls it', () => {
  const onDismiss = vi.fn();
  render(<Alert onDismiss={onDismiss}>Message</Alert>);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(onDismiss).toHaveBeenCalledWith();
});

it('dismissLabel names the dismiss button', () => {
  render(
    <Alert onDismiss={vi.fn()} dismissLabel="Close message">
      Message
    </Alert>,
  );
  expect(
    screen.getByRole('button', { name: 'Close message' }),
  ).toBeInTheDocument();
});

it.each([
  [undefined, null],
  ['off', null],
  ['polite', 'status'],
  ['assertive', 'alert'],
] as const)('live=%s gives role %s', (live, role) => {
  render(
    <Alert data-testid="a" live={live}>
      Message
    </Alert>,
  );
  const root = screen.getByTestId('a');
  if (role) expect(root).toHaveAttribute('role', role);
  else expect(root).not.toHaveAttribute('role');
});

it('is a div', () => {
  render(<Alert data-testid="a">Message</Alert>);
  expect(screen.getByTestId('a').tagName).toBe('DIV');
});
