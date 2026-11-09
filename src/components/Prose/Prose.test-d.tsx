import { NotProse, Prose } from './index';

test('size is sm or md, and layout props are accepted', () => {
  <Prose size="sm" marginX="auto" as="article" />;
  // @ts-expect-error size is sm or md
  <Prose size="lg" />;
  <NotProse as="span" marginTop="2" />;
});
