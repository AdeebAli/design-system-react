import { Prose } from '@adeebali/design-system-react';

const filler = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <p key={index}>
      Each entry says what changed, why, and what people need to do about it.
    </p>
  ));

// A server page rendering Prose with plain elements, as compiled from MDX. The
// in-page link checks that headings land clear of the sticky NavBar.
export default function Blog() {
  return (
    <Prose as="article" data-testid="article">
      <h1>Writing a useful changelog</h1>
      <p>
        The hardest part is knowing what to leave out.{' '}
        <a href="#details">Jump to the details</a>.
      </p>
      <ul>
        <li>Entries link to their pull requests.</li>
      </ul>
      {filler(12)}
      <h2 id="details">The details</h2>
      {/* Enough below the heading that the page can scroll it to the top. */}
      {filler(40)}
    </Prose>
  );
}
