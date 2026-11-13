// Type tests that need next/image's types (Spec 17), checked by this fixture's
// tsc in npm run test:fixtures. Nothing imports this file.
import { Image } from '@adeebali/design-system-react';
import NextImage from 'next/image';
import hero from './hero.png';

export function TypeTests() {
  return (
    <>
      {/* next/image's props, with a static import as src. */}
      <Image as={NextImage} src={hero} alt="" fill sizes="100vw" />
      {/* @ts-expect-error a plain img's src is a string, not a static import */}
      <Image src={hero} alt="" />
      {/* @ts-expect-error a plain img has no fill */}
      <Image src="/a.png" alt="" fill />
    </>
  );
}
