import { Button } from '../Button';
import { Tooltip, TooltipProvider } from './index';

test('Tooltip requires content and one element', () => {
  <Tooltip content="Hint">
    <Button>Go</Button>
  </Tooltip>;
  // @ts-expect-error content is required
  <Tooltip>
    <Button>Go</Button>
  </Tooltip>;
  // @ts-expect-error a string is not an element
  <Tooltip content="Hint">Go</Tooltip>;
  // @ts-expect-error left is not a logical side
  <Tooltip content="Hint" side="left">
    <Button>Go</Button>
  </Tooltip>;
});

test('TooltipProvider takes a delay', () => {
  <TooltipProvider delay={100}>
    <span />
  </TooltipProvider>;
  // @ts-expect-error delay is a number
  <TooltipProvider delay="fast" />;
});
