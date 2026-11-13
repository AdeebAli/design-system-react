import {
  Box,
  Flex,
  Sidebar,
  SidebarGroup,
  SidebarLink,
} from '@adeebali/design-system-react';
import type { ReactNode } from 'react';
import NextLink from '../NextLink';
import { Dot } from './Dot';

// A server layout, so the Sidebar stays mounted while its links navigate
// between the pages under it. Its links are built here, on the server.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        aria-label="App"
        menuLabel="App menu"
        collapsible
        brand={<NextLink href="/">Fixture app</NextLink>}
      >
        <SidebarGroup label="Pages">
          <SidebarLink as={NextLink} href="/app-navigation" startIcon={<Dot />}>
            Overview
          </SidebarLink>
          <SidebarLink
            as={NextLink}
            href="/app-navigation/second"
            startIcon={<Dot />}
          >
            Second page
          </SidebarLink>
        </SidebarGroup>
      </Sidebar>
      <Box as="main" flexGrow="1" minWidth="0" padding="6">
        {children}
      </Box>
    </Flex>
  );
}
