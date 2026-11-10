import { Prose } from '@adeebali/design-system-react';

// A server page rendering Prose with HTML content, as from Markdown.
const html =
  '<h1>Writing a useful changelog</h1><p>The hardest part is knowing what to leave out.</p><ul><li>Entries link to their pull requests.</li></ul>';

export default function Blog() {
  return (
    <Prose
      as="article"
      data-testid="article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
