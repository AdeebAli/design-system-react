import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileText, Home, Settings, Users } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Accordion, AccordionItem } from './Accordion';
import { Badge } from './Badge';
import { Box } from './Box';
import { BreadcrumbItem, Breadcrumbs } from './Breadcrumbs';
import { Card } from './Card';
import { Flex } from './Flex';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Link } from './Link';
import { Sidebar, SidebarGroup, SidebarLink } from './Sidebar';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta = {
  title: 'Overview/App navigation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An app layout built from Sidebar, Breadcrumbs, and Accordion, with no `style` or `className`. The Sidebar sits in a `Flex` with `direction={{ base: \'column\', md: \'row\' }}`, beside a `Box as="main" flexGrow="1" minWidth="0"`. Below `md`, the Sidebar becomes a bar with a menu button that opens its links in a drawer.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function AppLayout() {
  return (
    <Flex direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        aria-label="Main"
        collapsible
        brand={
          <Link href="#home" tone="neutral" underline="hover">
            Acme
          </Link>
        }
      >
        <SidebarGroup label="Workspace">
          <SidebarLink href="#dashboard" startIcon={<Icon icon={Home} />}>
            Dashboard
          </SidebarLink>
          <SidebarLink
            href="#customers"
            active
            startIcon={<Icon icon={Users} />}
            badge={<Badge>12</Badge>}
          >
            Customers
          </SidebarLink>
          <SidebarLink href="#invoices" startIcon={<Icon icon={FileText} />}>
            Invoices
          </SidebarLink>
        </SidebarGroup>
        <SidebarGroup label="Account">
          <SidebarLink href="#settings" startIcon={<Icon icon={Settings} />}>
            Settings
          </SidebarLink>
        </SidebarGroup>
      </Sidebar>
      <Box as="main" flexGrow="1" minWidth="0" padding="6">
        <Stack gap="4" maxWidth="container.md">
          <Breadcrumbs>
            <BreadcrumbItem href="#customers">Customers</BreadcrumbItem>
            <BreadcrumbItem current>Acme</BreadcrumbItem>
          </Breadcrumbs>
          <Heading level={1}>Acme</Heading>
          <Text tone="muted">Customer since 2021, on the Team plan.</Text>
          <Card padding="none" clip>
            <Accordion defaultValue={['billing']} headingLevel={2}>
              <AccordionItem value="billing" title="Billing">
                Invoiced monthly, on the 1st.
              </AccordionItem>
              <AccordionItem value="contacts" title="Contacts">
                Ada Park, account owner.
              </AccordionItem>
              <AccordionItem value="notes" title="Notes">
                Renewal call booked for March.
              </AccordionItem>
            </Accordion>
          </Card>
        </Stack>
      </Box>
    </Flex>
  );
}

export const Desktop: Story = { render: () => <AppLayout /> };

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => <AppLayout />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = canvas.getByRole('button', { name: 'Menu' });
    // Only shown below md, so this fails if the viewport isn't applied.
    await expect(menu).toBeVisible();
    await userEvent.click(menu);
    const drawer = await within(document.body).findByRole('dialog', {
      name: 'Menu',
    });
    await expect(
      within(drawer).getByRole('link', { name: /Customers/ }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.keyboard('{Escape}');
    // Axe runs after play, so wait for the drawer and its focus guards to go.
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).toBeNull(),
    );
  },
};
