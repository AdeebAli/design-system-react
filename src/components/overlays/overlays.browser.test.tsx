import { Popover } from '@base-ui/react/popover';
import { render, screen } from '@testing-library/react';
import { cdp, userEvent } from 'vitest/browser';
import { defineTheme } from '../../theme/defineTheme';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { gapOffset } from './positioning';
import * as styles from './popup.css';

function Fixture() {
  return (
    <Popover.Root>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className={styles.positioner}
          side="bottom"
          sideOffset={gapOffset}
        >
          <Popover.Popup
            className={`${styles.popupSurface} ${styles.popupMotion}`}
            data-testid="popup"
          >
            Content
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

async function gap() {
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  const popup = await screen.findByTestId('popup');
  await expect.poll(() => getComputedStyle(popup).opacity).toBe('1');
  return (
    popup.getBoundingClientRect().top -
    screen.getByRole('button', { name: 'Open' }).getBoundingClientRect().bottom
  );
}

async function reduceMotion(on: boolean) {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : '' }],
  });
}

afterEach(() => reduceMotion(false));

it('the gap is 6px by default', async () => {
  render(<Fixture />);
  expect(await gap()).toBe(6);
});

it('the gap follows a theme override of space 1.5', async () => {
  render(
    <ThemeProvider
      theme={defineTheme({ shared: { space: { '1.5': '1rem' } } })}
    >
      <Fixture />
    </ThemeProvider>,
  );
  expect(await gap()).toBe(16);
});

it('reduced motion makes popup transitions 0s', async () => {
  render(<Fixture />);
  await gap();
  const popup = screen.getByTestId('popup');
  expect(getComputedStyle(popup).transitionDuration).not.toBe('0s');
  await reduceMotion(true);
  expect(getComputedStyle(popup).transitionDuration).toBe('0s');
});
