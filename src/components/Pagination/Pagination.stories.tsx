import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

const noop = (page: number) => void page;

const meta: Meta<typeof Pagination> = {
  title: 'Components/Data/Pagination',
  component: Pagination,
  args: { page: 3, totalPages: 10 },
  parameters: {
    docs: {
      description: {
        component:
          'Page navigation. With `getHref` it renders links, which work without JavaScript, open in a new tab, and keep the page in the URL; this works from a server component. With `onPageChange` it renders buttons and needs a client parent. Long ranges keep the same number of items while paging, so buttons don’t shift. Below `sm` it shows previous, “Page 3 of 10”, and next. Pass a router link through `as` with `getHref`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Links: Story = {
  args: { getHref: (page: number) => `#page-${page}` },
};

function Controlled(args: { totalPages: number; siblingCount?: 0 | 1 | 2 }) {
  const [page, setPage] = useState(1);
  return <Pagination page={page} onPageChange={setPage} {...args} />;
}

export const Buttons: Story = {
  render: () => <Controlled totalPages={20} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(
      canvas.getByRole('button', { name: 'Page 3' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};

export const Small: Story = {
  args: { size: 'sm', onPageChange: noop },
};

export const MoreSiblings: Story = {
  render: () => <Controlled totalPages={30} siblingCount={2} />,
};

export const SmallScreen: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { onPageChange: noop },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Only shown below sm, so this fails if the viewport isn't applied.
    await expect(canvas.getByText('Page 3 of 10')).toBeVisible();
  },
};

export const Translated: Story = {
  args: {
    onPageChange: noop,
    'aria-label': 'Seitennavigation',
    labels: {
      previous: 'Zurück',
      next: 'Weiter',
      page: 'Seite {page}',
      status: 'Seite {page} von {total}',
    },
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Pagination page={3} totalPages={10} onPageChange={noop} />
    </div>
  ),
};
