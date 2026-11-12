import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { vars } from '../../themes/contract.css';
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

it('control for the touch test: the same setup opens on a mouse hover', async () => {
  const onOpenChange = vi.fn();
  render(
    <Tooltip content="Hint" onOpenChange={onOpenChange}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(trigger());
  await expect.poll(() => popup(), { timeout: 2000 }).toBeInTheDocument();
  expect(onOpenChange).toHaveBeenCalledWith(true);
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

describe('side="start" and "end" follow text direction', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it.each([
    ['start', 'ltr', 'left'],
    ['end', 'ltr', 'right'],
    ['start', 'rtl', 'right'],
    ['end', 'rtl', 'left'],
  ] as const)(
    'side=%s in %s opens on the %s of a centered trigger',
    async (side, dir, physical) => {
      document.documentElement.dir = dir;
      render(
        <Tooltip content="Hint" side={side} delay={0}>
          <Button style={{ position: 'fixed', top: 300, left: '50%' }}>
            Go
          </Button>
        </Tooltip>,
      );
      await userEvent.hover(trigger());
      const hint = await screen.findByText('Hint');
      await expect.poll(() => getComputedStyle(hint).opacity).toBe('1');
      const p = hint.getBoundingClientRect();
      const t = trigger().getBoundingClientRect();
      if (physical === 'left') expect(p.right).toBeLessThanOrEqual(t.left);
      else expect(p.left).toBeGreaterThanOrEqual(t.right);
    },
  );
});

it('the positioner stacks at the tooltip level and is bound to the viewport width', async () => {
  render(
    <Tooltip content="Hint" delay={0}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(trigger());
  const positioner = (await screen.findByText('Hint')).parentElement!;
  const probe = document.createElement('div');
  probe.style.zIndex = vars.zIndex.tooltip;
  document.body.append(probe);
  const style = getComputedStyle(positioner);
  expect(style.zIndex).toBe(getComputedStyle(probe).zIndex);
  probe.remove();
  // The shared positioner's `max-inline-size: calc(100vw - 2 * space.4)`.
  expect(parseFloat(style.maxWidth)).toBe(window.innerWidth - 32);
});
