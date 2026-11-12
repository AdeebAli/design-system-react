import { Button } from '../Button';
import { DrawerContent, DrawerTrigger } from './index';

test('DrawerTrigger takes exactly one element', () => {
  <DrawerTrigger>
    <Button>Open</Button>
  </DrawerTrigger>;
  // @ts-expect-error a string is not an element
  <DrawerTrigger>Open</DrawerTrigger>;
  // @ts-expect-error two children are not one element
  <DrawerTrigger>
    <Button>A</Button>
    <Button>B</Button>
  </DrawerTrigger>;
});

test('DrawerContent side is start, end, or bottom', () => {
  <DrawerContent side="start" />;
  <DrawerContent side="end" />;
  <DrawerContent side="bottom" />;
  // @ts-expect-error side is logical, so there is no left
  <DrawerContent side="left" />;
});

test('DrawerContent size is sm, md, or lg, for start and end only', () => {
  <DrawerContent size="lg" />;
  <DrawerContent side="start" size="sm" />;
  // @ts-expect-error there is no xl
  <DrawerContent size="xl" />;
  // @ts-expect-error a bottom sheet has no size
  <DrawerContent side="bottom" size="md" />;
});

test('DrawerContent dir is ltr or rtl, and it has no `as`', () => {
  <DrawerContent dir="rtl" />;
  // @ts-expect-error auto is not a direction
  <DrawerContent dir="auto" />;
  // @ts-expect-error overlays don't accept `as`
  <DrawerContent as="section" />;
});
