import { Image, Stack } from '@adeebali/design-system-react';
import NextImage from 'next/image';
import hero from './hero.png';

// A server page (Spec 17): Image is a client component, and next/image is one
// too, so both can be passed from here.
export default function Page() {
  return (
    <Stack gap="4" maxWidth="container.sm">
      <Image
        data-testid="native"
        src="/avatar.svg"
        alt="A portrait"
        htmlWidth={64}
        htmlHeight={64}
      />
      <Image
        as={NextImage}
        data-testid="next"
        src={hero}
        alt="Two bands of indigo"
        ratio="3/2"
        fill
        sizes="(min-width: 768px) 40rem, 100vw"
      />
      <Image
        data-testid="missing"
        src="/missing.png"
        alt="The office from the street"
        ratio="16/9"
      />
    </Stack>
  );
}
