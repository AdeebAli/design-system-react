import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Radio } from '../Radio';
import { RadioGroup } from './index';

const radio = (name: string) => screen.getByRole('radio', { name });

function Plans() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="monthly">
      <Radio value="monthly" label="Monthly" />
      <Radio value="annual" label="Annual" />
      <Radio value="lifetime" label="Lifetime" />
    </RadioGroup>
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('dir');
});

it('ArrowLeft checks the next radio in RTL', async () => {
  const { unmount } = render(<Plans />);
  radio('Monthly').focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(radio('Annual')).toBeChecked();
  unmount();

  document.documentElement.dir = 'rtl';
  render(<Plans />);
  radio('Monthly').focus();
  await userEvent.keyboard('{ArrowLeft}');
  expect(radio('Annual')).toBeChecked();
});
