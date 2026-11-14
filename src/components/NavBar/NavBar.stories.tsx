import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Box } from '../Box';
import { ColorModeToggle } from '../ColorModeToggle';
import { Link } from '../Link';
import { Text } from '../Text';
import { VisuallyHidden } from '../VisuallyHidden';
import { NavBar } from './NavBar';
import { NavBarLink } from './NavBarLink';

const meta: Meta<typeof NavBar> = {
  title: 'Components/Navigation/NavBar',
  component: NavBar,
  args: {
    'aria-label': 'Main',
    brand: (
      <Link href="#home" tone="neutral" underline="hover">
        Acme
      </Link>
    ),
    children: (
      <>
        <NavBarLink href="#dashboard" active>
          Dashboard
        </NavBarLink>
        <NavBarLink href="#customers">Customers</NavBarLink>
        <NavBarLink href="#blog">Blog</NavBarLink>
      </>
    ),
  },
  decorators: [
    (Story, context) => (
      // ColorModeToggle needs a provider; start from the toolbar's mode.
      <ThemeProvider
        defaultMode={context.globals.mode === 'dark' ? 'dark' : 'light'}
        storageKey="ds-storybook-navbar"
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The site’s main navigation, for links between pages. For switching views within a page, use `Tabs`. Children must be `NavBarLink`s; anything else goes in `brand` or `actions`. Set `active` on the current page’s link: the library doesn’t read the URL. Below `md`, links collapse behind a menu button into a panel that pushes content down; it closes on `Escape` and on a link click. Pass a router link through `as`, such as `as={NextLink}`. In a Next.js server component, `next/link` is a server wrapper that can't be passed to `NavBarLink`, so re-export it from a client module first: a file containing `'use client'; export { default } from 'next/link';`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavBar>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: { actions: <ColorModeToggle variant="ghost" /> },
};

export const SmallScreen: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { actions: <ColorModeToggle variant="ghost" /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = canvas.getByRole('button', { name: 'Menu' });
    // Only shown below md, so this fails if the viewport isn't applied.
    await expect(menu).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Customers', hidden: true }),
    ).not.toBeVisible();
    await userEvent.click(menu);
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Customers' })).toBeVisible();
  },
};

/** The menu button before the brand, as an outline button. */
export const MenuAtStart: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    actions: <ColorModeToggle variant="ghost" />,
    menuPosition: 'start',
    menuVariant: 'outline',
  },
};

export const Sticky: Story = {
  args: { sticky: true },
  render: (args) => (
    <Box>
      <NavBar {...args} />
      <Box paddingY="6">
        {Array.from({ length: 30 }, (_, index) => (
          <Text key={index}>Scroll to see the bar stay at the top.</Text>
        ))}
      </Box>
    </Box>
  ),
};

/** No skip link is built in. Add one before the bar with `VisuallyHidden focusable`. */
export const SkipLink: Story = {
  render: (args) => (
    <>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <NavBar {...args} />
      <Box as="main" id="main" paddingY="6">
        <Text>Press Tab to reveal the skip link.</Text>
      </Box>
    </>
  ),
};
