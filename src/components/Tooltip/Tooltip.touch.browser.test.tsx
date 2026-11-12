import { render, screen } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Button } from '../Button';
import { Tooltip } from './index';

// Runs in the `browser-touch` project: touch emulation can't be fully undone
// in a page on Linux, so no other test may share this page afterwards.
const trigger = (name = 'Go') => screen.getByRole('button', { name });

it('a real touch tap (CDP touch input) never opens it', async () => {
  const onClick = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <Tooltip content="Hint" onOpenChange={onOpenChange}>
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
    await new Promise((r) => setTimeout(r, 1000));
    // The tap landed (it clicked the button), and it never opened, not even briefly.
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  } finally {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
});
