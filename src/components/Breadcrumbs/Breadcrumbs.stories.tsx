import type { Meta, StoryObj } from '@storybook/react-vite';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { BreadcrumbItem, Breadcrumbs } from './index';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    docs: {
      description: {
        component:
          'Where a page sits, with links back up. Each `BreadcrumbItem` takes `href` (and a router link through `as`), or `current` for the page itself, which renders text with `aria-current="page"`. Separators come from CSS, are hidden from screen readers, and flip in right-to-left text. Long trails wrap. There’s no `"use client"` and no context, so it works in a server component, with a server-defined `as` too.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbItem href="#customers">Customers</BreadcrumbItem>
      <BreadcrumbItem href="#acme">Acme</BreadcrumbItem>
      <BreadcrumbItem current>Invoices</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Medium: Story = { ...Default, args: { size: 'md' } };

/** Long trails wrap instead of hiding items. */
export const LongTrail: Story = {
  render: (args) => (
    <Breadcrumbs {...args} width="1/3">
      <BreadcrumbItem href="#home">Home</BreadcrumbItem>
      <BreadcrumbItem href="#customers">Customers</BreadcrumbItem>
      <BreadcrumbItem href="#acme">Acme Corporation</BreadcrumbItem>
      <BreadcrumbItem href="#billing">Billing</BreadcrumbItem>
      <BreadcrumbItem href="#invoices">Invoices</BreadcrumbItem>
      <BreadcrumbItem current>November 2026</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  function RouterLink({ children, ...props }, ref) {
    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    );
  },
);

/** Pass a router's link component through `as`, such as `next/link`. */
export const WithRouterLink: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbItem as={RouterLink} href="#customers">
        Customers
      </BreadcrumbItem>
      <BreadcrumbItem current>Acme</BreadcrumbItem>
    </Breadcrumbs>
  ),
};
