import { render, screen } from '@testing-library/react';
import { cdp, userEvent } from 'vitest/browser';
import { Field } from '../Field';
import type { Option } from '../Select';
import * as styles from './MultiSelect.css';
import { MultiSelect } from './index';

const topics: Option[] = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'legal', label: 'Legal' },
];

const trigger = () => screen.getByRole('combobox');
const expanded = () => trigger().getAttribute('aria-expanded');

describe('default (button)', () => {
  async function pickThree() {
    await userEvent.click(trigger());
    await userEvent.click(
      await screen.findByRole('option', { name: 'Design' }),
    );
    await userEvent.click(screen.getByRole('option', { name: 'Research' }));
    await userEvent.click(screen.getByRole('option', { name: 'Writing' }));
    expect(expanded()).toBe('true');
    expect(screen.getByRole('listbox')).toBeVisible();
    await expect.poll(() => trigger().textContent).toBe('Design+2');
  }

  it('the popup stays open across three picks, and Escape closes it', async () => {
    render(<MultiSelect aria-label="Topics" options={topics} />);
    await pickThree();
    await userEvent.keyboard('{Escape}');
    await expect.poll(expanded).toBe('false');
  });

  it('Tab closes it', async () => {
    render(
      <>
        <MultiSelect aria-label="Topics" options={topics} />
        <button type="button">After</button>
      </>,
    );
    await pickThree();
    await userEvent.keyboard('{Tab}');
    await expect.poll(expanded).toBe('false');
  });

  it('an outside click closes it', async () => {
    render(<MultiSelect aria-label="Topics" options={topics} />);
    await pickThree();
    // A real mouse click through CDP, near the viewport's bottom corner, clear
    // of the popup: Playwright's click waits for its target to receive the
    // pointer, and Base UI's modal popup intercepts presses outside it.
    const at = {
      x: window.innerWidth - 4,
      y: window.innerHeight - 4,
      button: 'left' as const,
      clickCount: 1,
    };
    await cdp().send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...at,
      buttons: 1,
    });
    await cdp().send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      ...at,
      buttons: 0,
    });
    await expect.poll(expanded).toBe('false');
  });

  it('at 200px wide, the summary fits on one line with the count visible', () => {
    render(
      <div style={{ width: 200 }}>
        <MultiSelect
          aria-label="Topics"
          options={[
            {
              value: 'long',
              label: 'Interdisciplinary research methods and practice',
            },
            ...topics,
          ]}
          defaultValue={['long', 'design', 'writing']}
        />
      </div>,
    );
    const t = trigger().getBoundingClientRect();
    expect(t.width).toBe(200);
    expect(t.height).toBe(36);
    const first = trigger().querySelector<HTMLElement>(`.${styles.first}`)!;
    const count = screen.getByText('+2');
    const c = count.getBoundingClientRect();
    // The first label is cut short; the count is whole and inside the trigger.
    expect(first.scrollWidth).toBeGreaterThan(first.clientWidth);
    expect(count.scrollWidth).toBe(count.clientWidth);
    expect(c.right).toBeLessThanOrEqual(t.right);
    expect(c.top).toBeGreaterThanOrEqual(t.top);
    expect(c.bottom).toBeLessThanOrEqual(t.bottom);
  });

  it('clicking the Field label focuses the trigger without opening it', async () => {
    render(
      <Field label="Topics">
        <MultiSelect options={topics} />
      </Field>,
    );
    await userEvent.click(screen.getByText('Topics'));
    const t = screen.getByRole('combobox', { name: 'Topics' });
    expect(t).toHaveFocus();
    expect(t).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
