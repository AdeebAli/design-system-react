import { render } from '@testing-library/react';
import { axEntries, axNames } from './browserTestUtils';

it('leaves out nodes hidden from screen readers', async () => {
  render(
    <>
      <button type="button">First</button>
      <button type="button" aria-hidden="true">
        Hidden
      </button>
      <button type="button">Second</button>
    </>,
  );
  const entries = await axEntries();
  const between = entries.slice(
    entries.indexOf('button:First') + 1,
    entries.indexOf('button:Second'),
  );
  // Chrome keeps the hidden button as an ignored node, which isn't listed.
  expect(between).toEqual(['StaticText:First', 'InlineTextBox:First']);
});

it('lists nodes as role:name in reading order, and names by role', async () => {
  render(
    <>
      <button type="button">First</button>
      <a href="#x">Link</a>
      <button type="button">Second</button>
    </>,
  );
  const entries = await axEntries();
  expect(entries.filter((entry) => entry.startsWith('button:'))).toEqual([
    'button:First',
    'button:Second',
  ]);
  expect(await axNames('button')).toEqual(['First', 'Second']);
});
