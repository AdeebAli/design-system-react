import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Settings, Users, FileText } from 'lucide-react';
import { useState } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '../Breadcrumbs';
import { Heading } from '../Heading';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Badge } from '../Badge';
import { Box } from '../Box';
import { ColorModeToggle } from '../ColorModeToggle';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { Link } from '../Link';
import { Text } from '../Text';
import { Sidebar, SidebarGroup, SidebarLink, type SidebarProps } from './index';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/App navigation/Sidebar',
  component: Sidebar,
  args: { 'aria-label': 'Main' },
  decorators: [
    (Story, context) => (
      // ColorModeToggle needs a provider; start from the toolbar's mode.
      <ThemeProvider
        defaultMode={context.globals.mode === 'dark' ? 'dark' : 'light'}
        storageKey="ds-storybook-sidebar"
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

function Links() {
  return (
    <>
      <SidebarGroup label="Workspace">
        <SidebarLink href="#dashboard" active startIcon={<Icon icon={Home} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink
          href="#customers"
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
    </>
  );
}

function Page(props: SidebarProps) {
  return (
    <Flex direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        brand={
          <Link href="#home" tone="neutral" underline="hover">
            Acme
          </Link>
        }
        footer={<ColorModeToggle variant="ghost" />}
        {...props}
      >
        <Links />
      </Sidebar>
      <Box as="main" flexGrow="1" minWidth="0" padding="6">
        <Breadcrumbs marginBottom="4">
          <BreadcrumbItem href="#workspace">Workspace</BreadcrumbItem>
          <BreadcrumbItem current>Dashboard</BreadcrumbItem>
        </Breadcrumbs>
        <Heading level={1} marginBottom="2">
          Dashboard
        </Heading>
        <Text>Page content.</Text>
      </Box>
    </Flex>
  );
}

export const Default: Story = { render: (args) => <Page {...args} /> };

export const Collapsible: Story = {
  render: (args) => <Page {...args} collapsible />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Collapse sidebar' }),
    );
    await expect(
      canvas.getByRole('navigation', { name: 'Main' }),
    ).toHaveAttribute('data-collapsed');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Expand sidebar' }),
    );
  },
};

export const Collapsed: Story = {
  render: (args) => <Page {...args} collapsible defaultCollapsed />,
};

function ControlledExample() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Page
      aria-label="Main"
      collapsible
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
    />
  );
}

export const Controlled: Story = { render: () => <ControlledExample /> };

/** Scrolls with the page, at its content's height. */
export const NotSticky: Story = {
  render: (args) => <Page {...args} sticky={false} />,
};

/** The app layout at phone width: a bar with the menu button, and the links in a drawer. */
export const PhoneWidth: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => <Page {...args} collapsible />,
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
      within(drawer).getByRole('link', { name: 'Settings' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    // Axe runs after play, so wait for the drawer and its focus guards to go.
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).toBeNull(),
    );
  },
};

const COOKIE = 'sidebar-collapsed';

function readCookie() {
  return document.cookie.split('; ').some((part) => part === `${COOKIE}=1`);
}

function CookieExample() {
  // On a server-rendered page, read the cookie on the server instead, so the
  // first HTML already has the right state: see the description.
  const [collapsed, setCollapsed] = useState(readCookie);
  return (
    <Page
      aria-label="Main"
      collapsible
      collapsed={collapsed}
      onCollapsedChange={(next) => {
        setCollapsed(next);
        document.cookie = `${COOKIE}=${next ? 1 : 0}; path=/; max-age=31536000; samesite=lax`;
      }}
    />
  );
}

/**
 * Keeps `collapsed` in a cookie. In Next.js, read it in a server component
 * and pass it down, so the server HTML starts in the right state:
 *
 * ```tsx
 * import { cookies } from 'next/headers';
 *
 * const collapsed = (await cookies()).get('sidebar-collapsed')?.value === '1';
 * return <AppSidebar defaultCollapsed={collapsed} />;
 * ```
 *
 * `AppSidebar` is a client component that renders `Sidebar` with
 * `defaultCollapsed`, and writes the cookie in `onCollapsedChange`.
 */
export const CollapsedInACookie: Story = { render: () => <CookieExample /> };
