import type { CSSProperties, ReactNode } from 'react';
import { contrastRatio, resolve } from '../../themes/contrast';
import { softDark } from '../../themes/softDark';
import { softLight } from '../../themes/softLight';
import { softShared } from '../../themes/softShared';
import type { ThemeTokens } from '../../themes/types';
import { tokens } from '../../tokens/primitives';

const swatch: CSSProperties = {
  display: 'inline-block',
  width: '1.5rem',
  height: '1.5rem',
  marginInlineEnd: '0.5rem',
  verticalAlign: 'middle',
  borderRadius: '0.25rem',
  outline: '1px solid rgb(128 128 128 / 0.4)',
};

function ratio(theme: ThemeTokens, path: string, against: string) {
  // A translucent value's contrast depends on what's behind it.
  if (resolve(theme, path).includes('/')) return '—';
  try {
    return `${contrastRatio(resolve(theme, path), resolve(theme, against)).toFixed(2)}:1`;
  } catch {
    // A transparent value has no contrast of its own.
    return '—';
  }
}

function Row({ path, against }: { path: string; against: string }) {
  return (
    <tr>
      <td>
        <code>{path}</code>
      </td>
      {[softLight, softDark].map((theme, index) => (
        <td key={index}>
          <span style={{ ...swatch, background: resolve(theme, path) }} />
          <code>{resolve(theme, path)}</code>
        </td>
      ))}
      <td>{ratio(softLight, path, against)}</td>
      <td>{ratio(softDark, path, against)}</td>
    </tr>
  );
}

/** One group of color tokens, with both themes' values and contrast. */
export function ColorTable({
  group,
  against,
}: {
  group: 'bg' | 'fg' | 'border';
  against: string;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Soft Light</th>
          <th>Soft Dark</th>
          <th>Light contrast</th>
          <th>Dark contrast</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(softLight.color[group])
          // The avatar pairs are a nested group, with a table of their own.
          .filter(([, value]) => typeof value === 'string')
          .map(([name]) => (
            <Row key={name} path={`color.${group}.${name}`} against={against} />
          ))}
      </tbody>
    </table>
  );
}

/** `Avatar`'s six color pairs, each text color on its own background. */
export function AvatarColorTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Pair</th>
          <th>Soft Light</th>
          <th>Soft Dark</th>
          <th>Light contrast</th>
          <th>Dark contrast</th>
        </tr>
      </thead>
      <tbody>
        {(['1', '2', '3', '4', '5', '6'] as const).map((n) => (
          <tr key={n}>
            <td>
              <code>{`color.{bg,fg}.avatar.${n}`}</code>
            </td>
            {[softLight, softDark].map((theme, index) => (
              <td key={index}>
                <span
                  style={{
                    ...swatch,
                    display: 'inline-grid',
                    placeItems: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    background: theme.color.bg.avatar[n],
                    color: theme.color.fg.avatar[n],
                  }}
                >
                  AP
                </span>
                <code>
                  {theme.color.fg.avatar[n]} on {theme.color.bg.avatar[n]}
                </code>
              </td>
            ))}
            {[softLight, softDark].map((theme, index) => (
              <td key={index}>
                {ratio(theme, `color.fg.avatar.${n}`, `color.bg.avatar.${n}`)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Table({
  headings,
  rows,
}: {
  headings: string[];
  rows: [string, ...ReactNode[]][];
}) {
  return (
    <table>
      <thead>
        <tr>
          {headings.map((heading) => (
            <th key={heading}>{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, ...cells]) => (
          <tr key={name}>
            <td>
              <code>{name}</code>
            </td>
            {cells.map((cell, index) => (
              <td key={index}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const { font, space, radius, motion } = softShared;

/** The font sizes, each rendered at its size. */
export function TypeScale() {
  return (
    <Table
      headings={['Token', 'Value', 'Sample']}
      rows={Object.entries(font.size).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="sample"
          style={{
            fontFamily: font.family.sans,
            fontSize: value,
            lineHeight: 1.2,
          }}
        >
          Quick fox
        </span>,
      ])}
    />
  );
}

/** The font weights, each rendered at its weight. */
export function Weights() {
  return (
    <Table
      headings={['Token', 'Value', 'Sample']}
      rows={Object.entries(font.weight).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="sample"
          style={{ fontFamily: font.family.sans, fontWeight: value }}
        >
          Quick fox
        </span>,
      ])}
    />
  );
}

/** Inter's distinct `I`, `l`, and `1`, with its alternates on and off. */
export function InterFeatures() {
  const sample = { fontFamily: font.family.sans, fontSize: '2rem' };
  return (
    <Table
      headings={['Setting', 'Sample']}
      rows={[
        [
          `On: ${font.features.sans}`,
          <span
            key="on"
            style={{ ...sample, fontFeatureSettings: font.features.sans }}
          >
            Il1 Illinois
          </span>,
        ],
        [
          'Off',
          <span key="off" style={{ ...sample, fontFeatureSettings: 'normal' }}>
            Il1 Illinois
          </span>,
        ],
      ]}
    />
  );
}

/** The spacing scale, as bars. */
export function SpaceScale() {
  return (
    <Table
      headings={['Token', 'Value', 'Size']}
      rows={Object.entries(space).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="bar"
          style={{
            display: 'block',
            width: value,
            height: '1rem',
            background: 'rgb(128 128 128 / 0.5)',
          }}
        />,
      ])}
    />
  );
}

/** The radii, as boxes. */
export function RadiusScale() {
  return (
    <Table
      headings={['Token', 'Value', 'Shape']}
      rows={Object.entries(radius).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="shape"
          style={{
            display: 'block',
            width: '4rem',
            height: '4rem',
            borderRadius: resolve(softLight, `radius.${name}`),
            background: 'rgb(128 128 128 / 0.5)',
          }}
        />,
      ])}
    />
  );
}

function Shadows({ theme }: { theme: ThemeTokens }) {
  return (
    <Table
      headings={['Token', 'Value', 'Sample']}
      rows={Object.entries(theme.shadow).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="sample"
          style={{
            display: 'block',
            width: '4rem',
            height: '4rem',
            margin: '0.5rem',
            borderRadius: '0.75rem',
            background: theme.color.bg.surface,
            boxShadow: value,
          }}
        />,
      ])}
    />
  );
}

/** Soft Light's shadows, on its canvas. */
export function LightShadows() {
  return (
    <div
      style={{
        background: softLight.color.bg.canvas,
        color: softLight.color.fg.default,
        padding: '1rem',
      }}
    >
      <Shadows theme={softLight} />
    </div>
  );
}

/** Soft Dark's shadows, on its canvas. */
export function DarkShadows() {
  return (
    <div
      style={{
        background: softDark.color.bg.canvas,
        color: softDark.color.fg.default,
        padding: '1rem',
      }}
    >
      <Shadows theme={softDark} />
    </div>
  );
}

/** The durations and easings. */
export function MotionTokens() {
  return (
    <Table
      headings={['Token', 'Value']}
      rows={[
        ...Object.entries(motion.duration).map(
          ([name, value]): [string, ReactNode] => [
            `duration.${name}`,
            <code key="value">{value}</code>,
          ],
        ),
        ...Object.entries(motion.easing).map(
          ([name, value]): [string, ReactNode] => [
            `easing.${name}`,
            <code key="value">{value}</code>,
          ],
        ),
      ]}
    />
  );
}

const FAMILIES = [
  {
    token: 'sans',
    name: 'Inter',
    use: 'All interface text: every component, unless it sets another family.',
    bundled: 'Variable, weights 100 to 900, normal and italic',
    source: '`inter-ui` (Fontsource drops the cv05 and cv08 features)',
  },
  {
    token: 'mono',
    name: 'IBM Plex Mono',
    use: '`Code`, `Kbd`, code in `Prose`, and `Text family="mono"`.',
    bundled: '400 and 500 normal, 400 italic',
    source: '`@fontsource/ibm-plex-mono`',
  },
  {
    token: 'prose',
    name: 'Source Serif 4',
    use: '`Prose`\'s reading text, and `Text family="prose"`.',
    bundled: 'Variable, weights 200 to 900, normal and italic',
    source: '`@fontsource-variable/source-serif-4`',
  },
] as const;

// Renders `code` spans for text written with backticks.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split('`')
        .map((part, index) =>
          index % 2 ? <code key={index}>{part}</code> : part,
        )}
    </>
  );
}

/** The three font families, each with its stack, use, and license. */
export function FontFamilies() {
  return (
    <Table
      headings={['Token', 'Sample', 'Stack', 'Used by', 'Bundled', 'Source']}
      rows={FAMILIES.map(({ token, name, use, bundled, source }) => [
        `font.family.${token}`,
        <span
          key="sample"
          style={{
            fontFamily: font.family[token],
            fontFeatureSettings:
              token === 'sans' ? font.features.sans : 'normal',
            fontSize: '1.25rem',
          }}
        >
          {name}
        </span>,
        <code key="stack">{font.family[token]}</code>,
        <Inline key="use" text={use} />,
        bundled,
        <span key="source">
          <Inline text={source} />. SIL Open Font License 1.1.
        </span>,
      ])}
    />
  );
}

const PARAGRAPH =
  'Tokens keep every value in one place, so a theme can change the look of every component without touching any of them.';

/** The line heights, each on a short paragraph. */
export function LineHeights() {
  return (
    <Table
      headings={['Token', 'Value', 'Sample']}
      rows={Object.entries(font.lineHeight).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <p
          key="sample"
          style={{
            fontFamily: font.family.sans,
            lineHeight: value,
            maxWidth: '28ch',
            margin: 0,
          }}
        >
          {PARAGRAPH}
        </p>,
      ])}
    />
  );
}

/** The letter spacings, each on sample text. */
export function LetterSpacings() {
  return (
    <Table
      headings={['Token', 'Value', 'Sample']}
      rows={Object.entries(font.letterSpacing).map(([name, value]) => [
        name,
        <code key="value">{value}</code>,
        <span
          key="sample"
          style={{
            fontFamily: font.family.sans,
            letterSpacing: value,
            fontSize: '1.25rem',
          }}
        >
          Quick brown fox
        </span>,
      ])}
    />
  );
}

function Ramp({
  name,
  steps,
}: {
  name: string;
  steps: Record<string, string>;
}) {
  return (
    <div style={{ marginBlockEnd: '1rem' }}>
      <code>{name}</code>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBlockStart: '0.5rem',
        }}
      >
        {Object.entries(steps).map(([step, value]) => (
          <div
            key={step}
            style={{
              width: '5.5rem',
              fontSize: '0.75rem',
              overflowWrap: 'anywhere',
            }}
          >
            <span
              data-swatch={value}
              style={{
                ...swatch,
                display: 'block',
                width: '100%',
                height: '2.5rem',
                margin: 0,
                background: value,
              }}
            />
            <div>{step}</div>
            <code>{value}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Every palette ramp in `tokens`, as swatches. */
export function PrimitiveRamps() {
  return (
    <>
      <Ramp name="tokens.neutral" steps={tokens.neutral} />
      <Ramp name="tokens.indigo" steps={tokens.indigo} />
      {Object.entries(tokens.status).map(([name, steps]) => (
        <Ramp key={name} name={`tokens.status.${name}`} steps={steps} />
      ))}
    </>
  );
}

const spaceOrder = (key: string) => (key === 'px' ? 0.25 : Number(key));

/** The raw font stacks, font sizes, and spacing scale in `tokens`. */
export function PrimitiveScales() {
  return (
    <Table
      headings={['Token', 'Value']}
      rows={[
        ...Object.entries(tokens.fontFamily).map(
          ([name, value]): [string, ReactNode] => [
            `fontFamily.${name}`,
            <code key="value">{value}</code>,
          ],
        ),
        ...Object.entries(tokens.fontSize).map(
          ([name, value]): [string, ReactNode] => [
            `fontSize.${name}`,
            <code key="value">{value}</code>,
          ],
        ),
        // Object keys put integers first, so sort the scale by size.
        ...Object.entries(tokens.space)
          .sort(([a], [b]) => spaceOrder(a) - spaceOrder(b))
          .map(([name, value]): [string, ReactNode] => [
            `space.${name}`,
            <code key="value">{value}</code>,
          ]),
      ]}
    />
  );
}
