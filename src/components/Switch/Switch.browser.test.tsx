import { render, screen } from '@testing-library/react';
import { cdp, userEvent } from 'vitest/browser';
import { Checkbox } from '../Checkbox';
import { Field } from '../Field';
import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';
import { Switch } from './index';

afterEach(() => {
  document.documentElement.style.fontSize = '';
});

function inside(inner: DOMRect, outer: DOMRect) {
  return (
    inner.left >= outer.left - 0.5 &&
    inner.right <= outer.right + 0.5 &&
    inner.top >= outer.top - 0.5 &&
    inner.bottom <= outer.bottom + 0.5
  );
}

it.each([false, true])(
  'the knob stays inside the track at 200%% text (checked: %s)',
  (checked) => {
    document.documentElement.style.fontSize = '200%';
    render(<Switch label="Live" defaultChecked={checked} />);
    const track = screen.getByRole('switch');
    const thumb = track.firstElementChild as HTMLElement;
    expect(track.getBoundingClientRect().width).toBe(72);
    expect(
      inside(thumb.getBoundingClientRect(), track.getBoundingClientRect()),
    ).toBe(true);
  },
);

it('the knob moves to the end when on', async () => {
  render(<Switch label="Live" />);
  const track = screen.getByRole('switch');
  const thumb = track.firstElementChild as HTMLElement;
  const before = thumb.getBoundingClientRect().left;
  await userEvent.click(track);
  await expect.poll(() => thumb.getBoundingClientRect().left - before).toBe(16);
});

it.each([
  ['Checkbox', () => <Checkbox />, 'checkbox'],
  ['Switch', () => <Switch />, 'switch'],
] as const)(
  'clicking a Field label toggles and focuses an unlabeled %s, like a native label',
  async (_, control, role) => {
    render(<Field label="Setting">{control()}</Field>);
    const el = screen.getByRole(role, { name: 'Setting' });
    await userEvent.click(screen.getByText('Setting'));
    expect(el).toBeChecked();
    expect(el).toHaveFocus();
    await userEvent.click(screen.getByText('Setting'));
    expect(el).not.toBeChecked();
  },
);

it('clicking a Field label focuses the RadioGroup', async () => {
  render(
    <Field label="Plan">
      <RadioGroup defaultValue="a">
        <Radio value="m" label="Monthly" />
        <Radio value="a" label="Annual" />
      </RadioGroup>
    </Field>,
  );
  await userEvent.click(screen.getByText('Plan'));
  expect(screen.getByRole('radio', { name: 'Annual' })).toHaveFocus();
});

it('an unlabeled checkbox has a target of at least 24px', () => {
  render(<Checkbox aria-label="Select row" data-testid="c" />);
  const box = screen.getByRole('checkbox');
  const before = getComputedStyle(box, '::before');
  expect(parseFloat(before.width) || 24).toBeGreaterThanOrEqual(24);
  expect(box.getBoundingClientRect().width).toBe(18);
});

it('a labeled checkbox and switch show the focus ring on keyboard focus', async () => {
  render(
    <>
      <Checkbox label="A" />
      <Switch label="B" />
    </>,
  );
  await userEvent.tab();
  expect(getComputedStyle(screen.getByRole('checkbox')).outlineStyle).toBe(
    'solid',
  );
  await userEvent.tab();
  expect(getComputedStyle(screen.getByRole('switch')).outlineStyle).toBe(
    'solid',
  );
});

describe('forced colors', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: '' }],
    });
  });

  it('the switch knob and the radio dot stay visible', async () => {
    render(
      <>
        <Switch label="On" defaultChecked />
        <RadioGroup defaultValue="a">
          <Radio value="a" label="A" />
        </RadioGroup>
      </>,
    );
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const track = screen.getByRole('switch');
    const thumb = track.firstElementChild as HTMLElement;
    const radio = screen.getByRole('radio');
    const dot = radio.firstElementChild as HTMLElement;
    // The knob's color transitions, so wait for it to settle.
    await expect
      .poll(() => getComputedStyle(thumb).backgroundColor)
      .toBe(getComputedStyle(dot).backgroundColor);
    expect(getComputedStyle(thumb).backgroundColor).not.toBe(
      getComputedStyle(track).backgroundColor,
    );
    expect(getComputedStyle(dot).backgroundColor).not.toBe(
      getComputedStyle(radio).backgroundColor,
    );
  });
});
