import { render, screen } from '@testing-library/react';
import { cdp, userEvent } from 'vitest/browser';
import { Button } from '../Button';
import { Tooltip, TooltipProvider } from './index';

const popup = (name = 'Hint') => screen.queryByText(name);
const trigger = (name = 'Go') => screen.getByRole('button', { name });

it('opens after the hover delay, not before', async () => {
  render(
    <Tooltip content="Hint" delay={300}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(trigger());
  await new Promise((r) => setTimeout(r, 100));
  expect(popup()).not.toBeInTheDocument();
  await expect.poll(() => popup(), { timeout: 2000 }).toBeInTheDocument();
});

it('opens immediately on keyboard focus, ignoring the delay', async () => {
  render(
    <Tooltip content="Hint" delay={5000}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.tab();
  await expect.poll(() => popup(), { timeout: 1000 }).toBeInTheDocument();
});

it('Escape dismisses it', async () => {
  render(
    <Tooltip content="Hint">
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.tab();
  await expect.poll(() => popup()).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => popup()).not.toBeInTheDocument();
});

it('moving the pointer onto the popup keeps it open', async () => {
  render(
    <Tooltip content="Hint" delay={0}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(trigger());
  await expect.poll(() => popup()).toBeInTheDocument();
  await userEvent.hover(popup()!);
  await new Promise((r) => setTimeout(r, 500));
  expect(popup()).toBeInTheDocument();
});

it('clicking the trigger closes it', async () => {
  render(
    <Tooltip content="Hint" delay={0}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(trigger());
  await expect.poll(() => popup()).toBeInTheDocument();
  await userEvent.click(trigger());
  await expect.poll(() => popup()).not.toBeInTheDocument();
});

it('a real touch tap (CDP touch input) does not open it', async () => {
  const onClick = vi.fn();
  render(
    <Tooltip content="Hint" delay={0}>
      <Button onClick={onClick}>Go</Button>
    </Tooltip>,
  );
  const rect = trigger().getBoundingClientRect();
  const touchPoints = [
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
  ];
  await cdp().send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  try {
    await cdp().send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints,
    });
    await cdp().send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await new Promise((r) => setTimeout(r, 500));
    // The tap landed (it clicked the button), yet no tooltip.
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(popup()).not.toBeInTheDocument();
  } finally {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
});

it('inside TooltipProvider, a second tooltip opens with no delay after the first closes', async () => {
  render(
    <TooltipProvider delay={1500}>
      <Tooltip content="First" delay={0}>
        <Button>One</Button>
      </Tooltip>
      <Tooltip content="Second">
        <Button>Two</Button>
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.hover(trigger('One'));
  await expect.poll(() => popup('First')).toBeInTheDocument();
  await userEvent.hover(trigger('Two'));
  // Far shorter than the 1500ms provider delay.
  await expect
    .poll(() => popup('Second'), { timeout: 700 })
    .toBeInTheDocument();
});

it('a tooltip with no delay prop uses the provider delay', async () => {
  render(
    <TooltipProvider delay={800}>
      <Tooltip content="Hint">
        <Button>Go</Button>
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.hover(trigger());
  await new Promise((r) => setTimeout(r, 300));
  expect(popup()).not.toBeInTheDocument();
  await expect.poll(() => popup(), { timeout: 2000 }).toBeInTheDocument();
});
