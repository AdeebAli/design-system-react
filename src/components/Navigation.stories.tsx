import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Box } from './Box';
import { Container } from './Container';
import { Link } from './Link';
import { NavBar, NavBarLink } from './NavBar';
import { Prose } from './Prose';
import { Stack } from './Stack';
import { Tab, Tabs, TabsList, TabsPanel } from './Tabs';
import { Text } from './Text';

const meta: Meta = {
  title: 'Overview/Navigation and prose',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A content site built from NavBar, Tabs, and Prose, with no `style` or `className`. Use NavBar for links between pages, and Tabs for views within a page.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const paragraphs = Array.from({ length: 6 }, (_, index) => (
  <p key={index}>
    A changelog is for the people who use your software. Lead with what changed
    for them, link each entry to its pull request, and keep internal refactors
    out of it.
  </p>
));

export const ContentSite: Story = {
  render: () => (
    <Container size="lg" marginY="4">
      <Stack gap="6">
        <NavBar
          aria-label="Main"
          sticky
          brand={
            <Link href="#top" tone="neutral" underline="hover">
              Acme
            </Link>
          }
        >
          <NavBarLink href="#docs">Docs</NavBarLink>
          <NavBarLink href="#blog" active>
            Blog
          </NavBarLink>
          <NavBarLink href="#about">About</NavBarLink>
        </NavBar>
        <Tabs defaultValue="latest">
          <TabsList aria-label="Posts">
            <Tab value="latest">Latest</Tab>
            <Tab value="popular">Popular</Tab>
          </TabsList>
          <TabsPanel value="latest" marginTop="4">
            <Text size="sm" tone="muted">
              November 5, 2026
            </Text>
            <Prose as="article" marginX="auto">
              <h1>Writing a useful changelog</h1>
              <p>
                Jump to <a href="#details">the details</a>.
              </p>
              {paragraphs}
              <h2 id="details">The details</h2>
              {paragraphs}
              {paragraphs}
              {paragraphs}
            </Prose>
          </TabsPanel>
          <TabsPanel value="popular" marginTop="4">
            <Text>Popular posts.</Text>
          </TabsPanel>
        </Tabs>
        <Box paddingY="24" />
      </Stack>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { name: 'The details' });
    // Following the link would navigate the test's frame, so scroll the way a
    // fragment link does: scrollIntoView applies the same scroll margin.
    // Fonts loading later would shift the layout after scrolling.
    await document.fonts.ready;
    heading.scrollIntoView({ block: 'start' });
    const nav = canvas.getByRole('navigation', { name: 'Main' });
    // The anchor lands below the sticky NavBar, not underneath it.
    await waitFor(async () => {
      await expect(heading.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        nav.getBoundingClientRect().bottom,
      );
      await expect(heading.getBoundingClientRect().top).toBeLessThan(
        nav.getBoundingClientRect().bottom + 48,
      );
    });
  },
};
