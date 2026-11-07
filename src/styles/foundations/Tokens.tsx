import type { CSSProperties, ReactNode } from 'react';
import { contrastRatio, resolve } from '../../themes/contrast';
import { softDark } from '../../themes/softDark';
import { softLight } from '../../themes/softLight';
import { softShared } from '../../themes/softShared';
import type { ThemeTokens } from '../../themes/types';

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
  try {
    return `${contrastRatio(resolve(theme, path), resolve(theme, against)).toFixed(2)}:1`;
  } catch {
    // Transparent and translucent values have no single contrast.
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
        {Object.keys(softLight.color[group]).map((name) => (
          <Row key={name} path={`color.${group}.${name}`} against={against} />
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
        <span key="sample" style={{ fontSize: value, lineHeight: 1.2 }}>
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
        <span key="sample" style={{ fontWeight: value }}>
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
