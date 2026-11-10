import { NotProse, Prose } from './index';

test('size is sm or md, and layout props are accepted', () => {
  <Prose size="sm" marginX="auto" as="article" />;
  // @ts-expect-error size is sm or md
  <Prose size="lg" />;
  <NotProse as="span" marginTop="2" />;
});

test('content comes from children or an HTML string, as on any element', () => {
  <Prose>
    <p>Body</p>
  </Prose>;
  <Prose dangerouslySetInnerHTML={{ __html: '<p>Body</p>' }} />;
  <Prose as="article" dangerouslySetInnerHTML={{ __html: '<p>Body</p>' }} />;
  // @ts-expect-error __html is required, as React types it
  <Prose dangerouslySetInnerHTML={{}} />;
});
