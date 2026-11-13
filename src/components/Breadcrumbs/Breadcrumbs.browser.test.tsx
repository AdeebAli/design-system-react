import { render, screen } from '@testing-library/react';
import { cdp, page } from 'vitest/browser';
import { axTree } from '../../utils/browserTestUtils';
import { BreadcrumbItem, Breadcrumbs } from './index';

const names = ['Home', 'Customers', 'Acme Corporation', 'Billing', 'Invoices'];

function Long() {
  return (
    <Breadcrumbs>
      {names.map((name) => (
        <BreadcrumbItem key={name} href={`#${name}`}>
          {name}
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem current>November 2026</BreadcrumbItem>
    </Breadcrumbs>
  );
}

const separator = (index: number) =>
  getComputedStyle(
    screen.getByRole('navigation').querySelectorAll('li')[index]!,
    '::before',
  );

afterEach(async () => {
  document.documentElement.removeAttribute('dir');
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

it('at 320px, a six-item trail wraps without widening the page', async () => {
  await page.viewport(320, 600);
  render(<Long />);
  expect(document.documentElement.scrollWidth).toBe(
    document.documentElement.clientWidth,
  );
  const items = screen.getByRole('navigation').querySelectorAll('li');
  const first = items[0]!.getBoundingClientRect();
  const last = items[items.length - 1]!.getBoundingClientRect();
  expect(last.top).toBeGreaterThan(first.bottom - 1);
});

it('separators sit between items, not before the first', async () => {
  await page.viewport(800, 600);
  render(<Long />);
  expect(separator(0).content).toBe('none');
  expect(separator(1).content).toBe('""');
  expect(parseFloat(separator(1).width)).toBeGreaterThan(0);
});

it('separators are absent from the accessibility tree', async () => {
  await page.viewport(800, 600);
  render(<Long />);
  const texts = (await axTree())
    .filter((node) => node.role?.value === 'StaticText')
    .map((node) => node.name?.value);
  expect(texts).toEqual([...names, 'November 2026']);
});

it('separators flip in RTL', async () => {
  await page.viewport(800, 600);
  const { unmount } = render(<Long />);
  expect(separator(1).transform).toBe('none');
  unmount();
  document.documentElement.dir = 'rtl';
  render(<Long />);
  expect(separator(1).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
});

it('forced colors: separators take the text color', async () => {
  await page.viewport(800, 600);
  render(<Long />);
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: 'active' }],
  });
  const probe = document.createElement('span');
  probe.style.color = 'CanvasText';
  document.body.append(probe);
  const text = getComputedStyle(probe).color;
  probe.remove();
  expect(separator(1).backgroundColor).toBe(text);
});

it.each(['sm', 'md'] as const)(
  'links are at least 24px tall at %s',
  async (size) => {
    await page.viewport(800, 600);
    render(
      <Breadcrumbs size={size}>
        <BreadcrumbItem href="#a">Home</BreadcrumbItem>
        <BreadcrumbItem current>Here</BreadcrumbItem>
      </Breadcrumbs>,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  },
);
