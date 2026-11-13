import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { axNames } from '../../utils/browserTestUtils';
import { Pagination } from './Pagination';

const noop = (page: number) => void page;

const example = <Pagination page={3} totalPages={10} onPageChange={noop} />;

it('from sm, only the full list is in the accessibility tree', async () => {
  await page.viewport(1280, 800);
  render(example);
  const buttons = await axNames('button');
  expect(buttons.filter((n) => n === 'Page 4')).toHaveLength(1);
  expect(buttons.filter((n) => n === 'Previous')).toHaveLength(1);
  expect(buttons.filter((n) => n === 'Next')).toHaveLength(1);
  expect(screen.getByText('Page 3 of 10').checkVisibility()).toBe(false);
});

it('below sm, only previous, status, and next are in the accessibility tree', async () => {
  await page.viewport(390, 800);
  render(example);
  const buttons = await axNames('button');
  expect(buttons).toEqual(['Previous', 'Next']);
  expect(screen.getByText('Page 3 of 10').checkVisibility()).toBe(true);
  expect(
    document.querySelector('button[aria-label="Page 4"]')!.checkVisibility(),
  ).toBe(false);
});

it('page buttons are square at the control height', async () => {
  await page.viewport(1280, 800);
  render(example);
  const rect = screen
    .getByRole('button', { name: 'Page 4' })
    .getBoundingClientRect();
  expect(Math.round(rect.width)).toBe(Math.round(rect.height));
});
