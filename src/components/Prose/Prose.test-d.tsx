import { NotProse, Prose } from './index';

test('size is sm or md, and layout props are accepted', () => {
  <Prose size="sm" marginX="auto" as="article" />;
  // @ts-expect-error size is sm or md
  <Prose size="lg" />;
  <NotProse as="span" marginTop="2" />;
});

test('content comes from children, not an HTML string', () => {
  <Prose>
    <p>Body</p>
  </Prose>;
  // @ts-expect-error Prose takes children or MDX, not HTML strings
  <Prose dangerouslySetInnerHTML={{ __html: '<p>Body</p>' }} />;
  // @ts-expect-error with as, too
  <Prose as="article" dangerouslySetInnerHTML={{ __html: '<p>Body</p>' }} />;
});
