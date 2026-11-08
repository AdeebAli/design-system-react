import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Button } from './index';

it('loading blocks implicit submission in a real browser', async () => {
  let submitted = 0;
  render(
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitted += 1;
      }}
    >
      <input aria-label="q" />
      <Button type="submit" loading>
        Go
      </Button>
    </form>,
  );
  await userEvent.type(screen.getByLabelText('q'), 'x{Enter}');
  expect(submitted).toBe(0);
});

it('a real browser submits when not loading', async () => {
  let submitted = 0;
  render(
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitted += 1;
      }}
    >
      <input aria-label="q" />
      <Button type="submit">Go</Button>
    </form>,
  );
  await userEvent.type(screen.getByLabelText('q'), 'x{Enter}');
  expect(submitted).toBe(1);
});

it.each(['sm', 'md', 'lg'] as const)(
  'size %s uses the control height',
  (size) => {
    render(<Button size={size}>Go</Button>);
    const px = { sm: 28, md: 36, lg: 44 }[size];
    expect(screen.getByRole('button').getBoundingClientRect().height).toBe(px);
  },
);

it('hover changes a solid button to the hover token', async () => {
  render(
    <>
      <Button>Go</Button>
      <span
        data-testid="probe"
        style={{ background: 'var(--ds-color-bg-accent-hover)' }}
      />
    </>,
  );
  const b = screen.getByRole('button');
  await userEvent.hover(b);
  const expected = getComputedStyle(
    screen.getByTestId('probe'),
  ).backgroundColor;
  await expect.poll(() => getComputedStyle(b).backgroundColor).toBe(expected);
});

it('loading keeps normal colors and width', () => {
  render(
    <>
      <Button data-testid="idle">Save</Button>
      <Button data-testid="busy" loading>
        Save
      </Button>
    </>,
  );
  const idle = getComputedStyle(screen.getByTestId('idle'));
  const busy = getComputedStyle(screen.getByTestId('busy'));
  expect(busy.backgroundColor).toBe(idle.backgroundColor);
  expect(busy.color).toBe(idle.color);
});

it('shows the focus ring on keyboard focus', async () => {
  render(<Button>Go</Button>);
  await userEvent.tab();
  expect(getComputedStyle(screen.getByRole('button')).outlineStyle).toBe(
    'solid',
  );
});
