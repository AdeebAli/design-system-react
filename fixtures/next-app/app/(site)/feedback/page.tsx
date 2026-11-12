import {
  Alert,
  Avatar,
  Button,
  Divider,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  Progress,
  Spinner,
  Stack,
} from '@adeebali/design-system-react';

// A server page: Alert, Spinner, and Divider have no "use client", and the
// client components render into the server HTML (Spec 16).
export default function Page() {
  return (
    <Stack gap="4" data-testid="feedback">
      <Alert tone="danger" title="Could not save your changes">
        The connection dropped. Your edits are still here; try again.
      </Alert>
      <Spinner label="Loading invoices" />
      <Divider />
      <Progress label="Uploading report.pdf" value={42} showValue />
      <Avatar name="Ada Park" src="/avatar.svg" status="online" />
      <Drawer>
        <DrawerTrigger>
          <Button>Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent side="end">
          <DrawerTitle>Server drawer</DrawerTitle>
          <DrawerDescription>Rendered by a server component.</DrawerDescription>
          <DrawerClose>
            <Button variant="soft">Done</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
}
