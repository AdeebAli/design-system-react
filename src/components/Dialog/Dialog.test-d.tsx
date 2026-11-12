import { Button } from '../Button';
import { DialogContent, DialogTrigger } from './index';

test('DialogTrigger takes exactly one element', () => {
  <DialogTrigger>
    <Button>Open</Button>
  </DialogTrigger>;
  // @ts-expect-error a string is not an element
  <DialogTrigger>Open</DialogTrigger>;
  // @ts-expect-error two children are not one element
  <DialogTrigger>
    <Button>A</Button>
    <Button>B</Button>
  </DialogTrigger>;
});

test('DialogContent size is sm, md, or lg, and it has no `as`', () => {
  <DialogContent size="lg" />;
  // @ts-expect-error there is no xl
  <DialogContent size="xl" />;
  // @ts-expect-error overlays don't accept `as`
  <DialogContent as="section" />;
});
