import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Inline,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
} from '@adeebali/design-system-react';

// A server page: each overlay is built here, with a server-rendered Button as
// its trigger child (Spec 12).
export default function Page() {
  return (
    <Inline gap="3" data-testid="overlays">
      <Dialog>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogTitle>Server dialog</DialogTitle>
          <DialogDescription>Rendered by a server component.</DialogDescription>
          <DialogClose>
            <Button variant="soft">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <Popover>
        <PopoverTrigger>
          <Button variant="soft">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Server popover</PopoverTitle>
          <PopoverDescription>Also rendered on the server.</PopoverDescription>
        </PopoverContent>
      </Popover>
      <Menu>
        <MenuTrigger>
          <Button variant="outline">Open menu</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem>Archive</MenuItem>
        </MenuContent>
      </Menu>
      <Tooltip content="A hint from the server">
        <Button variant="outline">Hover me</Button>
      </Tooltip>
    </Inline>
  );
}
