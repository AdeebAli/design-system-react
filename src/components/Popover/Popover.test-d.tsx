import { Button } from '../Button';
import { PopoverContent, PopoverTrigger } from './index';

test('PopoverTrigger takes exactly one element', () => {
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>;
  // @ts-expect-error a string is not an element
  <PopoverTrigger>Open</PopoverTrigger>;
  // @ts-expect-error two children are not one element
  <PopoverTrigger>
    <Button>A</Button>
    <Button>B</Button>
  </PopoverTrigger>;
});

test('PopoverContent side and align are logical, and it has no `as`', () => {
  <PopoverContent side="end" align="start" arrow aria-label="Hi" />;
  // @ts-expect-error left is not a logical side
  <PopoverContent side="left" />;
  // @ts-expect-error there is no stretch
  <PopoverContent align="stretch" />;
  // @ts-expect-error overlays don't accept `as`
  <PopoverContent as="section" />;
});
