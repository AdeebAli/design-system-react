import { Heading } from './index';

test('level is required and numeric', () => {
  <Heading level={1} size={{ base: 'xl', md: '5xl' }} tone="muted" />;
  // @ts-expect-error level is required
  <Heading />;
  // @ts-expect-error level is a number
  <Heading level="1" />;
  // @ts-expect-error 7 isn't a level
  <Heading level={7} />;
});

test('as and regular are not accepted', () => {
  // @ts-expect-error Heading doesn't accept as
  <Heading level={1} as="div" />;
  // @ts-expect-error headings can't be regular weight
  <Heading level={1} weight="regular" />;
  // @ts-expect-error Heading has no family
  <Heading level={1} family="mono" />;
});
