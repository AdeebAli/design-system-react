import { Icon } from '../Icon';
import { ArrowUpIcon } from '../Icon/internal/ArrowUp';
import { IconButton } from './index';

const icon = <Icon icon={ArrowUpIcon} />;

test('aria-label and icon are required, and text icons are not accepted', () => {
  <IconButton icon={icon} aria-label="Close" variant="ghost" />;
  // @ts-expect-error aria-label is required
  <IconButton icon={icon} />;
  // @ts-expect-error icon is required
  <IconButton aria-label="Close" />;
  // @ts-expect-error startIcon isn't accepted
  <IconButton icon={icon} aria-label="Close" startIcon={icon} />;
});
