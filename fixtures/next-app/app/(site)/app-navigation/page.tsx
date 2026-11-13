import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Heading,
} from '@adeebali/design-system-react';
import type { ComponentProps } from 'react';
import NextLink from '../NextLink';

// A server-defined component, which Breadcrumbs accepts as `as` because it
// has no "use client" (Spec 15).
function ServerLink(props: ComponentProps<'a'>) {
  return <a data-server-link="" {...props} />;
}

// A server page: the Breadcrumbs and the Accordion content are built here.
export default function Page() {
  return (
    <>
      <Breadcrumbs marginBottom="4">
        <BreadcrumbItem as={NextLink} href="/">
          Home
        </BreadcrumbItem>
        <BreadcrumbItem as={ServerLink} href="/blog">
          Blog
        </BreadcrumbItem>
        <BreadcrumbItem current>App navigation</BreadcrumbItem>
      </Breadcrumbs>
      <Heading level={1} marginBottom="4">
        App navigation
      </Heading>
      <Accordion defaultValue={['server']}>
        <AccordionItem value="server" title="Server content">
          Rendered on the server.
        </AccordionItem>
        <AccordionItem value="later" title="Later">
          Shown when opened.
        </AccordionItem>
      </Accordion>
    </>
  );
}
