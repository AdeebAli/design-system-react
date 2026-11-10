import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Button } from '../Button';
import { Link } from '../Link';
import { Tooltip, TooltipProvider } from './index';

const hint = () => screen.queryByText('Hint');

it('shows content in a popup with data-open when open', async () => {
  render(
    <Tooltip content="Hint" defaultOpen>
      <Button>Go</Button>
    </Tooltip>,
  );
  const popup = (await screen.findByText('Hint')).closest('[data-open]');
  expect(popup).not.toBeNull();
});

it('disabled never opens, even when defaultOpen', async () => {
  render(
    <Tooltip content="Hint" disabled defaultOpen>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.hover(screen.getByRole('button', { name: 'Go' }));
  await userEvent.tab();
  expect(hint()).not.toBeInTheDocument();
});

it('uncontrolled: onOpenChange gets only the boolean', async () => {
  const onOpenChange = vi.fn();
  render(
    <Tooltip content="Hint" onOpenChange={onOpenChange} delay={0}>
      <Button>Go</Button>
    </Tooltip>,
  );
  await userEvent.tab();
  expect(await screen.findByText('Hint')).toBeInTheDocument();
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(onOpenChange.mock.calls[0]).toHaveLength(1);
});

it('controlled: open decides', async () => {
  function Controlled() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Show
        </button>
        <Tooltip content="Hint" open={open} onOpenChange={setOpen}>
          <Button>Go</Button>
        </Tooltip>
      </>
    );
  }
  render(<Controlled />);
  expect(hint()).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Show' }));
  expect(await screen.findByText('Hint')).toBeInTheDocument();
});

it('adds no ARIA to the trigger (visual only)', async () => {
  render(
    <Tooltip content="Hint" defaultOpen>
      <Button>Go</Button>
    </Tooltip>,
  );
  await screen.findByText('Hint');
  const trigger = screen.getByRole('button', { name: 'Go' });
  expect(trigger).not.toHaveAttribute('aria-describedby');
  expect(trigger).not.toHaveAttribute('aria-labelledby');
});

it('works around a Link', async () => {
  render(
    <Tooltip content="Hint" defaultOpen>
      <Link href="/x">Docs</Link>
    </Tooltip>,
  );
  expect(await screen.findByText('Hint')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument();
});

it('TooltipProvider is optional and wraps tooltips', async () => {
  render(
    <TooltipProvider delay={0}>
      <Tooltip content="Hint">
        <Button>Go</Button>
      </Tooltip>
    </TooltipProvider>,
  );
  await userEvent.tab();
  expect(await screen.findByText('Hint')).toBeInTheDocument();
});
