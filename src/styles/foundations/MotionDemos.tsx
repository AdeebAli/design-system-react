import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../../components/Dialog';
import { Skeleton } from '../../components/Skeleton';
import { Stack } from '../../components/Stack';
import { Switch } from '../../components/Switch';
import { vars } from '../../themes/contract.css';
import { softShared } from '../../themes/softShared';

// Docs-only demos for Foundations/Motion (Spec 18). They read the motion
// tokens as CSS variables, so reduced motion (every duration 0ms) applies.

const { motion } = softShared;
const DOT = '1.5rem';

const track: CSSProperties = {
  position: 'relative',
  height: DOT,
  borderRadius: '9999px',
  background: vars.color.bg.muted,
};

const dot: CSSProperties = {
  width: DOT,
  height: DOT,
  borderRadius: '9999px',
  background: vars.color.bg.accent,
};

/**
 * A dot that crosses its track when `played`. The mover is as wide as the
 * track less the dot, so `translateX(100%)` lands the dot at the end.
 */
function Mover({
  played,
  duration,
  easing,
  testId,
}: {
  played: boolean;
  duration: string;
  easing: string;
  testId: string;
}) {
  return (
    <div style={track}>
      <div
        data-testid={testId}
        style={{
          width: `calc(100% - ${DOT})`,
          transform: played ? 'translateX(100%)' : 'translateX(0)',
          transitionProperty: 'transform',
          transitionDuration: duration,
          transitionTimingFunction: easing,
        }}
      >
        <div style={dot} />
      </div>
    </div>
  );
}

function Demo({
  play,
  rows,
}: {
  play: string;
  rows: (played: boolean) => { label: ReactNode; demo: ReactNode }[];
}) {
  const [played, setPlayed] = useState(false);
  return (
    <Stack gap="4" marginY="4">
      <div>
        <Button variant="outline" onClick={() => setPlayed((p) => !p)}>
          {play}
        </Button>
      </div>
      {rows(played).map(({ label, demo }, index) => (
        <div
          key={index}
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(6rem, 1fr)',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <div>{label}</div>
          {demo}
        </div>
      ))}
    </Stack>
  );
}

/** A bar for each duration that crosses its track when Play is pressed. */
export function DurationDemo() {
  return (
    <Demo
      play="Play durations"
      rows={(played) =>
        (['fast', 'base', 'slow'] as const).map((name) => ({
          label: (
            <>
              <code>duration.{name}</code> {motion.duration[name]}
            </>
          ),
          demo: (
            <Mover
              played={played}
              duration={vars.motion.duration[name]}
              easing={vars.motion.easing.standard}
              testId={`duration-${name}`}
            />
          ),
        }))
      }
    />
  );
}

/** The four numbers of a `cubic-bezier()` value. */
function controlPoints(easing: string): [number, number, number, number] {
  const numbers = easing.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  if (numbers.length !== 4) throw new Error(`Not a cubic-bezier: ${easing}`);
  return numbers as [number, number, number, number];
}

/** An easing's curve, with time across and progress up. */
function Curve({ easing }: { easing: string }) {
  const [x1, y1, x2, y2] = controlPoints(easing);
  const point = (x: number, y: number) => `${x * 100},${100 - y * 100}`;
  return (
    <svg
      viewBox="-4 -4 108 108"
      width="72"
      height="72"
      aria-hidden="true"
      style={{ flexShrink: 0, overflow: 'visible' }}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="none"
        stroke={vars.color.border.subtle}
      />
      <path
        d={`M${point(0, 0)} C${point(x1, y1)} ${point(x2, y2)} ${point(1, 1)}`}
        fill="none"
        stroke={vars.color.bg.accent}
        strokeWidth="4"
      />
    </svg>
  );
}

/** Each easing's curve, and a dot that moves with it over duration.slow. */
export function EasingDemo() {
  return (
    <Demo
      play="Play easings"
      rows={(played) =>
        (['standard', 'enter', 'exit'] as const).map((name) => ({
          label: (
            <div
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <Curve easing={motion.easing[name]} />
              <code>easing.{name}</code>
            </div>
          ),
          demo: (
            <Mover
              played={played}
              duration={vars.motion.duration.slow}
              easing={vars.motion.easing[name]}
              testId={`easing-${name}`}
            />
          ),
        }))
      }
    />
  );
}

function Example({
  tokens,
  children,
}: {
  tokens: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(10rem, 16rem) 1fr',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      {children}
      <span>{tokens}</span>
    </div>
  );
}

/** Real components that use the motion tokens, each with the tokens it uses. */
export function MotionInUse() {
  return (
    <Stack gap="6" marginY="4">
      <Example
        tokens={
          <>
            Opens and closes over <code>duration.fast</code>, with{' '}
            <code>easing.enter</code> to open and <code>easing.exit</code> to
            close.
          </>
        }
      >
        <div>
          <Dialog>
            <DialogTrigger>
              <Button variant="outline">Open a dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Motion in a dialog</DialogTitle>
              <DialogDescription>
                It fades in over duration.fast with easing.enter.
              </DialogDescription>
              <DialogClose>
                <Button>Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </Example>
      <Example
        tokens={
          <>
            The thumb slides over <code>duration.base</code>, with{' '}
            <code>easing.standard</code>.
          </>
        }
      >
        <Switch label="Notifications" />
      </Example>
      <Example
        tokens={
          <>
            Pulses over five times <code>duration.slow</code>, with{' '}
            <code>easing.standard</code>. Under reduced motion it stops pulsing
            and stays visible.
          </>
        }
      >
        <Skeleton />
      </Example>
    </Stack>
  );
}
