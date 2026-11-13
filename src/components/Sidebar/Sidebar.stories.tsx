import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Settings, Users, FileText } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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
  title: 'Components/Sidebar',
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
    docs: {
      description: {
        component:
          'An app’s main navigation, down one side of the page. Group links with `SidebarGroup`, whose `label` names its list. Set `active` on the current page’s link: the library doesn’t read the URL. It stays in view at full height (`sticky`, the default) and its links scroll inside it, while `brand` and `footer` stay put. `collapsible` adds a button, from `md` up, that shrinks it to a rail of icons with tooltips; links then need a `startIcon`, and a `badge` becomes a dot. Page layout is yours: put it in a `Flex` beside the main content. Pass a router link through `as`, such as `as={NextLink}`.',
      },
    },
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
    <Flex>
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
    await expect(canvas.getByRole('navigation')).toHaveAttribute(
      'data-collapsed',
    );
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
