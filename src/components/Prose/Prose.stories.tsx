import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Container } from '../Container';
import { Stat } from '../Stat';
import { Text } from '../Text';
import { NotProse } from './NotProse';
import { Prose } from './Prose';

function Article() {
  return (
    <>
      <h1>Writing a useful changelog</h1>
      <p>
        The hardest part is knowing what to leave out. A changelog is for the
        people who use your software, so{' '}
        <strong>lead with what changed for them</strong>, and{' '}
        <em>skip the internal refactors</em>.{' '}
        <a href="#guide">Read the guide</a>.
      </p>
      <h2 id="what-changed">What changed</h2>
      <ul>
        <li>Entries now link to their pull requests.</li>
        <li>
          Breaking changes get their own section:
          <ul>
            <li>listed first,</li>
            <li>with a migration note.</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Write the entry.</li>
        <li>
          Run <code>npm run release</code> and press <kbd>Enter</kbd>.
        </li>
      </ol>
      <NotProse>
        <Card>
          <Stat label="Readers" value="21.4k" change="4.1" trend="up" />
          <Badge tone="accent">New</Badge>
        </Card>
      </NotProse>
      <h3>An example entry</h3>
      <blockquote>
        <p>Fixed a crash when a Select had no options.</p>
      </blockquote>
      {/* A scrolling region needs a keyboard route (Spec 11). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre tabIndex={0}>
        <code>{`## 0.3.0

- Added NavBar, Tabs, and Prose (#22)
- Fixed Select with value="toString"`}</code>
      </pre>
      <figure>
        <img
          alt="A plain gradient"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='200'%3E%3Crect width='640' height='200' fill='%23ccd'/%3E%3C/svg%3E"
        />
        <figcaption>Figure 1: a caption in the interface font.</figcaption>
      </figure>
      <h4>Release cadence</h4>
      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Date</th>
            <th>Entries</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0.2.0</td>
            <td>November 9</td>
            <td>16</td>
          </tr>
          <tr>
            <td>0.1.0</td>
            <td>November 7</td>
            <td>14</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <dl>
        <dt>Entry</dt>
        <dd>One line about one change.</dd>
      </dl>
      <p>
        Water is H<sub>2</sub>O, and E = mc<sup>2</sup>.
      </p>
    </>
  );
}

const meta: Meta<typeof Prose> = {
  title: 'Components/Prose',
  component: Prose,
  args: { as: 'article', marginX: 'auto' },
  render: (args) => (
    <Container size="lg">
      <Text size="sm" tone="muted">
        November 5, 2026
      </Text>
      <Prose {...args}>
        <Article />
      </Prose>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Styles long-form content, including plain HTML from Markdown or a CMS. Set the width on `Prose` itself, not on a wrapper, since `ch` depends on its own font; add `marginX="auto"` to center it. Keep a post’s date and byline outside, in `Text`. Wrap library components that should keep the interface font, such as a `Card`, in `NotProse`. `Prose` doesn’t sanitize HTML. See the Markdown and MDX page for setup.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Prose>;

export const Article18px: Story = {
  name: 'Article (md)',
  args: { size: 'md' },
};

export const Article16px: Story = {
  name: 'Article (sm)',
  args: { size: 'sm' },
};
