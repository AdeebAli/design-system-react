import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { Button } from '../Button';
import { Card } from '../Card';
import { Code } from '../Code';
import { Heading } from '../Heading';
import { Link } from '../Link';
import { Text } from '../Text';
import { NotProse, Prose } from './index';

const css = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const family = (el: Element) =>
  css(el).fontFamily.split(',')[0]!.replace(/"/g, '').trim();
const byTestId = (id: string) => screen.getByTestId(id);

beforeEach(async () => {
  await page.viewport(1024, 800);
});

const longUrl =
  'https://example.com/a/very/long/path/that/keeps/going/without/any/spaces/at/all/so/it/must/wrap/somewhere';

function Article({ size }: { size?: 'sm' | 'md' }) {
  return (
    <Prose as="article" size={size} data-testid="prose">
      <h1 data-testid="h1">Writing a useful changelog</h1>
      <p data-testid="p">
        The hardest part is knowing what to leave out.{' '}
        <a href="#guide">Read the guide</a>.
      </p>
      <h2 data-testid="h2">What changed</h2>
      <h3 data-testid="h3">Details</h3>
      <h4 data-testid="h4">More</h4>
      <figure>
        <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        <figcaption data-testid="caption">A caption</figcaption>
      </figure>
      <table data-testid="table">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>12</td>
          </tr>
        </tbody>
      </table>
      <pre data-testid="pre">
        <code>const x = 1;</code>
      </pre>
    </Prose>
  );
}

describe.each([
  ['md', 18, 36],
  ['sm', 16, 28],
] as const)('a kitchen-sink article at size %s', (size, body, h1) => {
  it('uses the right font on body, headings, captions, tables, and code', () => {
    render(<Article size={size} />);
    expect(family(byTestId('p'))).toBe('Source Serif 4');
    expect(css(byTestId('p')).fontSize).toBe(`${body}px`);
    for (const id of ['h1', 'h2', 'h3', 'h4', 'caption', 'table'])
      expect(family(byTestId(id)), id).toBe('Inter');
    expect(css(byTestId('h1')).fontSize).toBe(`${h1}px`);
    // No heading is smaller than the body text.
    expect(parseFloat(css(byTestId('h4')).fontSize)).toBe(body);
    expect(family(byTestId('pre'))).toBe('IBM Plex Mono');
  });
});

it('the root is 68ch of its own font', () => {
  render(
    <Prose data-testid="prose">
      <span
        data-testid="ch"
        style={{ display: 'inline-block', width: '1ch' }}
      />
    </Prose>,
  );
  const ch = byTestId('ch').getBoundingClientRect().width;
  const width = byTestId('prose').getBoundingClientRect().width;
  expect(Math.abs(width - 68 * ch)).toBeLessThan(1);
});

it('a responsive maxWidth without base is 68ch below lg and full from lg', async () => {
  render(
    <div style={{ width: 1200 }}>
      <Prose data-testid="prose" maxWidth={{ lg: 'full' }} />
    </div>,
  );
  await page.viewport(1000, 800);
  expect(byTestId('prose').getBoundingClientRect().width).toBeLessThan(1200);
  await page.viewport(1280, 800);
  expect(byTestId('prose').getBoundingClientRect().width).toBe(1200);
});

it("at 320px, long URLs and long pre lines don't widen the page", async () => {
  await page.viewport(320, 800);
  render(
    <Prose>
      <p>{longUrl}</p>
      <table>
        <tbody>
          <tr>
            <td>{longUrl}</td>
            <td>Second</td>
          </tr>
        </tbody>
      </table>
      <pre data-testid="pre">{`const url = '${longUrl}';`}</pre>
    </Prose>,
  );
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  const pre = byTestId('pre');
  expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
});

it('library components inside Prose keep their own styles', () => {
  const pair = (prefix: string) => (
    <>
      <Link href="#a" data-testid={`${prefix}-accent`}>
        Accent
      </Link>
      <Link href="#n" tone="neutral" data-testid={`${prefix}-neutral`}>
        Neutral
      </Link>
      <Heading level={2} size="md" data-testid={`${prefix}-heading`}>
        Heading
      </Heading>
      <Code data-testid={`${prefix}-code`}>code</Code>
      <Button as="a" href="#b" data-testid={`${prefix}-button`}>
        Button
      </Button>
      <Text size="md" data-testid={`${prefix}-text`}>
        Text
      </Text>
    </>
  );
  render(
    <>
      <div data-testid="outside">{pair('out')}</div>
      <Prose>
        <p data-testid="para">{pair('in')}</p>
      </Prose>
    </>,
  );
  // What each component sets itself. A Link and Code inherit their size, as
  // Spec 11 intends, so size is compared only where the component sets it.
  const owned = {
    accent: ['color', 'textDecorationLine'],
    heading: ['color', 'fontFamily', 'fontSize', 'fontWeight'],
    code: ['color', 'fontFamily', 'backgroundColor'],
    button: [
      'color',
      'fontSize',
      'fontWeight',
      'textDecorationLine',
      'backgroundColor',
    ],
    // Text inherits its family, and its size unless set, as here.
    text: ['color', 'fontSize'],
  } as const;
  for (const [name, properties] of Object.entries(owned)) {
    const outside = css(byTestId(`out-${name}`));
    const inside = css(byTestId(`in-${name}`));
    for (const property of properties)
      expect(inside[property], `${name} ${property}`).toBe(outside[property]);
  }
  // A neutral link takes the paragraph's color, not Prose's link color.
  expect(css(byTestId('in-neutral')).color).toBe(css(byTestId('para')).color);
  expect(css(byTestId('in-accent')).color).not.toBe(
    css(byTestId('para')).color,
  );
});

it('Code and plain code inside pre have no background of their own, with or without a wrapper', () => {
  render(
    <Prose>
      <pre>
        <Code data-testid="a">a</Code>
      </pre>
      <pre>
        <code data-testid="b">b</code>
      </pre>
      <pre>
        <span>
          <code data-testid="c">c</code>
        </span>
      </pre>
      <pre>
        <span>
          <Code data-testid="d">d</Code>
        </span>
      </pre>
    </Prose>,
  );
  for (const id of ['a', 'b', 'c', 'd']) {
    expect(css(byTestId(id)).backgroundColor, id).toBe('rgba(0, 0, 0, 0)');
    expect(css(byTestId(id)).paddingLeft, id).toBe('0px');
  }
});

it('adjacent NotProse blocks, and NotProse beside a ul or pre, keep their spacing', () => {
  render(
    <Prose>
      <NotProse data-testid="n1">One</NotProse>
      <NotProse data-testid="n2">Two</NotProse>
      <ul data-testid="ul">
        <li>Item</li>
      </ul>
      <NotProse data-testid="n3">Three</NotProse>
      <pre data-testid="pre">code</pre>
    </Prose>,
  );
  const gap = (a: string, b: string) =>
    byTestId(b).getBoundingClientRect().top -
    byTestId(a).getBoundingClientRect().bottom;
  expect(gap('n1', 'n2')).toBeGreaterThan(0);
  expect(gap('n2', 'ul')).toBeGreaterThan(0);
  expect(gap('ul', 'n3')).toBeGreaterThan(0);
  expect(gap('n3', 'pre')).toBeGreaterThan(0);
});

it('a Card with a p inside NotProse matches the same Card outside Prose', () => {
  render(
    <>
      <Card data-testid="out-card">
        <p data-testid="out-p">Readers</p>
      </Card>
      <Prose>
        <NotProse>
          <Card data-testid="in-card">
            <p data-testid="in-p">Readers</p>
          </Card>
        </NotProse>
      </Prose>
    </>,
  );
  for (const [a, b] of [
    ['out-card', 'in-card'],
    ['out-p', 'in-p'],
  ] as const) {
    const outside = css(byTestId(a));
    const inside = css(byTestId(b));
    for (const property of [
      'fontFamily',
      'fontSize',
      'lineHeight',
      'color',
      'marginTop',
      'marginBottom',
      'fontFeatureSettings',
    ] as const)
      expect(inside[property], `${b} ${property}`).toBe(outside[property]);
  }
});

it('NotProse nested in a list stops list styling, and inside a blockquote is not italic', () => {
  render(
    <>
      <ul>
        <li>
          <ul data-testid="plain-ul">
            <li>Plain</li>
          </ul>
        </li>
      </ul>
      <Prose>
        <ul>
          <li>
            <NotProse>
              <ul data-testid="inner-ul">
                <li>Inner</li>
              </ul>
            </NotProse>
          </li>
        </ul>
        <blockquote>
          <NotProse data-testid="quoted">Not italic</NotProse>
        </blockquote>
      </Prose>
    </>,
  );
  expect(css(byTestId('inner-ul')).listStyleType).toBe(
    css(byTestId('plain-ul')).listStyleType,
  );
  expect(css(byTestId('inner-ul')).paddingLeft).toBe(
    css(byTestId('plain-ul')).paddingLeft,
  );
  expect(css(byTestId('quoted')).fontStyle).toBe('normal');
});

it('the first and last children have no outer margins', () => {
  render(
    <Prose>
      <h2 data-testid="first">First</h2>
      <p>Middle</p>
      <p data-testid="last">Last</p>
    </Prose>,
  );
  expect(css(byTestId('first')).marginTop).toBe('0px');
  expect(css(byTestId('last')).marginBottom).toBe('0px');
});

it('list markers are muted and headings have a scroll margin', () => {
  render(
    <Prose>
      <ul>
        <li data-testid="li">Item</li>
      </ul>
      <h2 data-testid="h2">Anchor</h2>
    </Prose>,
  );
  expect(css(byTestId('li'), '::marker').color).not.toBe(
    css(byTestId('li')).color,
  );
  expect(parseFloat(css(byTestId('h2')).scrollMarginTop)).toBeGreaterThan(0);
});
