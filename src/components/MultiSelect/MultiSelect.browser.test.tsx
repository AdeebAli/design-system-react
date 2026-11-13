import { render, screen } from '@testing-library/react';
import { useState } from 'react';
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

describe('searchable', () => {
  const input = () => screen.getByRole<HTMLInputElement>('combobox');
  const optionNames = () =>
    screen.queryAllByRole('option').map((o) => o.textContent);
  // Includes hidden buttons: while the popup is open, Base UI hides
  // everything outside it from assistive tech, the chips included.
  const chipNames = () =>
    screen
      .queryAllByRole('button', { name: /^Remove /, hidden: true })
      .map((b) => b.getAttribute('aria-label'));

  it('stays open while choosing, and keeps the filter until it closes', async () => {
    render(<MultiSelect searchable aria-label="Topics" options={topics} />);
    await userEvent.click(input());
    await userEvent.keyboard('r');
    await expect.poll(optionNames).toEqual(['Research', 'Writing']);
    await userEvent.click(screen.getByRole('option', { name: 'Research' }));
    await userEvent.click(screen.getByRole('option', { name: 'Writing' }));
    expect(chipNames()).toEqual(['Remove Research', 'Remove Writing']);
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(input().value).toBe('r');
    expect(optionNames()).toEqual(['Research', 'Writing']);
    await userEvent.keyboard('{Escape}');
    await expect
      .poll(() => input().getAttribute('aria-expanded'))
      .toBe('false');
    await expect.poll(() => input().value).toBe('');
  });

  it('Backspace in an empty input removes the last chip', async () => {
    render(
      <MultiSelect
        searchable
        aria-label="Topics"
        options={topics}
        defaultValue={['design', 'research']}
      />,
    );
    await userEvent.click(input());
    await userEvent.keyboard('{Backspace}');
    await expect.poll(chipNames).toEqual(['Remove Design']);
  });

  it('chips wrap within a 240px wrapper', () => {
    render(
      <MultiSelect
        searchable
        aria-label="Topics"
        options={topics}
        defaultValue={['design', 'research', 'writing', 'legal']}
        className="wrap"
        style={{ width: 240 }}
      />,
    );
    const wrapper = input().closest<HTMLElement>('.wrap')!;
    const w = wrapper.getBoundingClientRect();
    expect(w.width).toBe(240);
    const chips = screen
      .getAllByRole('button', { name: /^Remove / })
      .map((b) =>
        b.closest<HTMLElement>(`.${styles.chip}`)!.getBoundingClientRect(),
      );
    const rows = new Set(chips.map((c) => Math.round(c.top)));
    expect(rows.size).toBeGreaterThan(1);
    for (const c of chips) {
      expect(c.left).toBeGreaterThanOrEqual(w.left);
      expect(c.right).toBeLessThanOrEqual(w.right);
    }
    expect(w.height).toBeGreaterThan(36);
  });

  it('remove buttons are at least 24px', () => {
    render(
      <MultiSelect
        searchable
        aria-label="Topics"
        options={topics}
        defaultValue={['design']}
        size="sm"
      />,
    );
    const r = screen
      .getByRole('button', { name: 'Remove Design' })
      .getBoundingClientRect();
    expect(r.height).toBeGreaterThanOrEqual(24);
    expect(r.width).toBeGreaterThanOrEqual(24);
  });

  it.each(['sm', 'md', 'lg'] as const)(
    'with no chips, size %s uses the control height',
    (size) => {
      render(
        <MultiSelect
          searchable
          aria-label="Topics"
          options={topics}
          size={size}
          className="wrap"
        />,
      );
      expect(input().closest('.wrap')!.getBoundingClientRect().height).toBe(
        { sm: 28, md: 36, lg: 44 }[size],
      );
    },
  );

  it('clicking the Field label focuses the input without opening the popup', async () => {
    render(
      <Field label="Topics">
        <MultiSelect searchable options={topics} />
      </Field>,
    );
    await userEvent.click(screen.getByText('Topics'));
    const i = screen.getByRole('combobox', { name: 'Topics' });
    expect(i).toHaveFocus();
    expect(i).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  function People(props: { loading?: boolean }) {
    // Empty for "zz", and the same people otherwise, whatever the query.
    const [options, setOptions] = useState<Option[]>(topics);
    return (
      <MultiSelect
        searchable
        aria-label="People"
        options={options}
        defaultValue={['u7']}
        selectedOptions={[{ value: 'u7', label: 'Ada Lovelace' }]}
        loading={props.loading}
        onSearch={(query) => setOptions(query === 'zz' ? [] : topics)}
      />
    );
  }

  it('onSearch turns off local filtering, and selectedOptions labels a chip', async () => {
    render(<People />);
    expect(chipNames()).toEqual(['Remove Ada Lovelace']);
    await userEvent.click(input());
    await userEvent.keyboard('des');
    await expect
      .poll(optionNames)
      .toEqual(['Design', 'Research', 'Writing', 'Legal']);
  });

  it('the status reads loading, then no results, then the count, from one element', async () => {
    const { rerender } = render(<People loading />);
    await userEvent.click(input());
    const status = await screen.findByRole('status');
    await expect.poll(() => status.textContent).toBe('Loading');
    rerender(<People loading={false} />);
    await userEvent.keyboard('zz');
    await expect.poll(() => status.textContent).toBe('No results');
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect.poll(() => status.textContent).toBe('4 results');
    expect(screen.getByRole('status')).toBe(status);
  });
});

it('a chip uses bg.muted, radius.sm, and font.size.sm', () => {
  render(
    <MultiSelect
      searchable
      aria-label="Topics"
      options={topics}
      defaultValue={['design']}
    />,
  );
  const chip = screen
    .getByRole('button', { name: 'Remove Design' })
    .closest<HTMLElement>(`.${styles.chip}`)!;
  const probe = document.createElement('div');
  probe.style.background = 'var(--ds-color-bg-muted)';
  probe.style.borderRadius = 'var(--ds-radius-sm)';
  probe.style.fontSize = 'var(--ds-font-size-sm)';
  document.body.append(probe);
  const c = getComputedStyle(chip);
  const p = getComputedStyle(probe);
  expect(c.backgroundColor).toBe(p.backgroundColor);
  expect(c.borderTopLeftRadius).toBe(p.borderTopLeftRadius);
  expect(c.fontSize).toBe(p.fontSize);
  probe.remove();
});
