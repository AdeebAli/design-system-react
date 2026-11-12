import { Avatar, type AvatarStatus } from './index';

test('requires a name', () => {
  <Avatar name="Ada Park" />;
  <Avatar
    name="Ada Park"
    src="/ada.jpg"
    size="xl"
    shape="square"
    fallback={<span>?</span>}
    status="busy"
    statusLabels={{ busy: 'Occupé' }}
    colorFromName
    decorative
    marginStart="2"
  />;
  const status: AvatarStatus = 'away';
  <Avatar name="Ada" status={status} />;
  // @ts-expect-error name is required
  <Avatar src="/ada.jpg" />;
  // @ts-expect-error unknown size
  <Avatar name="Ada" size="xs" />;
  // @ts-expect-error unknown status
  <Avatar name="Ada" status="dnd" />;
  // @ts-expect-error unknown shape
  <Avatar name="Ada" shape="hexagon" />;
  // @ts-expect-error statusLabels are strings
  <Avatar name="Ada" statusLabels={{ busy: 1 }} />;
  // @ts-expect-error background isn't an Avatar prop
  <Avatar name="Ada" background="surface" />;
});
