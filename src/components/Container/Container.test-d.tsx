import { Container } from './index';

test('paddingX is the only padding prop', () => {
  <Container paddingX={{ base: '2', md: '4' }} />;
  // @ts-expect-error only paddingX is accepted
  <Container padding="2" />;
  // @ts-expect-error only paddingX is accepted
  <Container paddingY="2" />;
  // @ts-expect-error size isn't responsive
  <Container size={{ md: 'sm' }} />;
});
