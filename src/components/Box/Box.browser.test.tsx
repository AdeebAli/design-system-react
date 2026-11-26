import { render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { Box } from './index';
import { componentPadding, projectThreeColumns } from './Box.browser.css';

const el = () => screen.getByTestId('b');
const css = () => getComputedStyle(el());

it('applies responsive values at the right breakpoints', async () => {
  render(<Box data-testid="b" padding={{ base: '2', md: '8', xl: '4' }} />);
  await page.viewport(500, 600);
  expect(css().paddingTop).toBe('8px');
  await page.viewport(767, 600);
  expect(css().paddingTop).toBe('8px');
  await page.viewport(768, 600);
  expect(css().paddingTop).toBe('32px');
  await page.viewport(1280, 600);
  expect(css().paddingTop).toBe('16px');
});

it('a prop beats a component style, and unlayered CSS beats the prop', () => {
  render(<Box data-testid="b" className={componentPadding} />);
  expect(css().paddingTop).toBe('4px');
  render(<Box data-testid="c" className={componentPadding} padding="4" />);
  const prop = screen.getByTestId('c');
  expect(getComputedStyle(prop).paddingTop).toBe('16px');

  const unlayered = document.createElement('style');
  unlayered.textContent = '[data-testid="c"]{padding:40px}';
  document.head.append(unlayered);
  expect(getComputedStyle(prop).paddingTop).toBe('40px');
  unlayered.remove();
});

it('a larger breakpoint wins, regardless of which prop set it', async () => {
  render(<Box data-testid="b" padding={{ md: '8' }} paddingX="2" />);
  await page.viewport(500, 600);
  expect(css().paddingLeft).toBe('8px');
  await page.viewport(900, 600);
  expect(css().paddingLeft).toBe('32px');
});

it('within a breakpoint, the more specific prop wins', async () => {
  await page.viewport(1000, 600);
  render(<Box data-testid="b" paddingStart="1" paddingX="2" padding="4" />);
  expect(css().paddingTop).toBe('16px');
  expect(css().paddingRight).toBe('8px');
  expect(css().paddingLeft).toBe('4px');
});

it('a token override changes a prop', () => {
  render(<Box data-testid="b" padding="4" />);
  document.documentElement.style.setProperty('--ds-space-4', '50px');
  expect(css().paddingTop).toBe('50px');
  document.documentElement.style.removeProperty('--ds-space-4');
});

it('borderWidth sets the style as well', () => {
  render(<Box data-testid="b" borderWidth="thin" borderColor="control" />);
  expect(css().borderTopWidth).toBe('1px');
  expect(css().borderTopStyle).toBe('solid');
});

it('sides use logical properties', () => {
  document.documentElement.dir = 'rtl';
  render(<Box data-testid="b" paddingStart="4" />);
  expect(css().paddingRight).toBe('16px');
  document.documentElement.dir = '';
});

describe('grid counts', () => {
  const trackWidth = (count: number) =>
    screen.getByTestId('grid').getBoundingClientRect().width / count;
  const childColumns = () =>
    Math.round(
      screen.getByTestId('child').getBoundingClientRect().width /
        trackWidth(16),
    );

  it.each([14, 'span-14'] as const)('gridColumn=%s spans 14 of 16', (span) => {
    render(
      <Box data-testid="grid" display="grid" gridTemplateColumns={16}>
        <Box data-testid="child" gridColumn={span} />
      </Box>,
    );
    expect(childColumns()).toBe(14);
  });

  it('gridColumn="full" spans every column', () => {
    render(
      <Box data-testid="grid" display="grid" gridTemplateColumns={16}>
        <Box data-testid="child" gridColumn="full" />
      </Box>,
    );
    expect(childColumns()).toBe(16);
  });

  it('gridRow={3} spans three rows', () => {
    render(
      <Box data-testid="grid" display="grid" gridTemplateColumns={2}>
        <Box data-testid="child" gridRow={3} />
        <div style={{ height: 10 }} />
        <div style={{ height: 10 }} />
        <div style={{ height: 10 }} />
      </Box>,
    );
    // The first child covers three auto rows of 10px each.
    expect(screen.getByTestId('child').getBoundingClientRect().height).toBe(30);
  });

  it('a project class that sets grid-template-columns beats the count', () => {
    render(
      <Box
        data-testid="grid"
        display="grid"
        gridTemplateColumns={16}
        className={projectThreeColumns}
      />,
    );
    expect(
      getComputedStyle(screen.getByTestId('grid')).gridTemplateColumns.split(
        ' ',
      ),
    ).toHaveLength(3);
  });

  it("a nested box's own span wins, and it doesn't inherit the parent's", async () => {
    await page.viewport(500, 600);
    render(
      <Box data-testid="grid" display="grid" gridTemplateColumns={16}>
        <Box
          data-testid="parent"
          gridColumn={14}
          display="grid"
          gridTemplateColumns={16}
        >
          <Box data-testid="child" gridColumn={{ md: 3 }} />
        </Box>
      </Box>,
    );
    const parent = () => screen.getByTestId('parent').getBoundingClientRect();
    const child = screen.getByTestId('child');
    // Below md the child has no span class, so it takes one track of the parent.
    expect(child.getBoundingClientRect().width).toBeCloseTo(
      parent().width / 16,
      0,
    );
    await page.viewport(900, 600);
    expect(child.getBoundingClientRect().width).toBeCloseTo(
      (parent().width / 16) * 3,
      0,
    );
  });
});
