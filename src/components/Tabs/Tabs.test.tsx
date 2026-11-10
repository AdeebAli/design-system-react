import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Tab, Tabs, TabsList, TabsPanel, type TabsProps } from './index';
import * as styles from './Tabs.css';

function Example(props: Partial<TabsProps> & { keepMounted?: boolean }) {
  const { keepMounted, ...rest } = props;
  const root = (
    'value' in rest ? rest : { defaultValue: 'a', ...rest }
  ) as TabsProps;
  return (
    <Tabs {...root}>
      <TabsList aria-label="Views">
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
        <Tab value="c" disabled>
          C
        </Tab>
      </TabsList>
      <TabsPanel value="a">Panel A</TabsPanel>
      <TabsPanel value="b" keepMounted={keepMounted}>
        <input aria-label="Draft" />
      </TabsPanel>
      <TabsPanel value="c">Panel C</TabsPanel>
    </Tabs>
  );
}

it('uncontrolled: defaultValue selects, and clicking another tab switches panels', async () => {
  render(<Example />);
  expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A');
  await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('textbox', { name: 'Draft' })).toBeInTheDocument();
});

it('controlled: onValueChange receives only the value', async () => {
  const onValueChange = vi.fn();
  render(<Example value="a" onValueChange={onValueChange} />);
  await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).toHaveBeenCalledWith('b');
  expect(onValueChange.mock.calls[0]).toHaveLength(1);
  // Controlled: nothing changes until the value does.
  expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

it('onValueChange is never called with null when defaultValue matches no tab and none is enabled', () => {
  const onValueChange = vi.fn();
  render(
    <Tabs defaultValue="zzz" onValueChange={onValueChange}>
      <TabsList aria-label="Views">
        <Tab value="a" disabled>
          A
        </Tab>
        <Tab value="b" disabled>
          B
        </Tab>
      </TabsList>
      <TabsPanel value="a">Panel A</TabsPanel>
      <TabsPanel value="b">Panel B</TabsPanel>
    </Tabs>,
  );
  // Base UI reports null on mount here (the test fails with the guard removed);
  // the consumer must see no call at all.
  expect(onValueChange).not.toHaveBeenCalled();
});

it('controlled: follows the value', async () => {
  function Controlled() {
    const [value, setValue] = useState('a');
    return <Example value={value} onValueChange={setValue} />;
  }
  render(<Controlled />);
  await userEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

it('an inactive panel is not rendered; keepMounted keeps it, hidden, with data-hidden', () => {
  const { unmount } = render(<Example />);
  expect(screen.queryByRole('textbox', { hidden: true })).toBeNull();
  unmount();
  render(<Example keepMounted />);
  const input = screen.getByRole('textbox', { name: 'Draft', hidden: true });
  const panel = input.closest('[role="tabpanel"]')!;
  expect(panel).toHaveAttribute('hidden');
  expect(panel).toHaveAttribute('data-hidden');
});

it('TabsList warns once without aria-label or aria-labelledby', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <Tab value="a">A</Tab>
      </TabsList>
      <TabsList>
        <Tab value="a">A</Tab>
      </TabsList>
    </Tabs>,
  );
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]![0])).toMatch(/TabsList/);
  warn.mockRestore();
});

it('TabsList with aria-labelledby does not warn', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  render(
    <Tabs defaultValue="a">
      <h2 id="t">Views</h2>
      <TabsList aria-labelledby="t">
        <Tab value="a">A</Tab>
      </TabsList>
    </Tabs>,
  );
  expect(screen.getByRole('tablist', { name: 'Views' })).toBeInTheDocument();
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

it('a disabled tab cannot be activated and has data-disabled', async () => {
  render(<Example />);
  const c = screen.getByRole('tab', { name: 'C' });
  expect(c).toHaveAttribute('data-disabled');
  await userEvent.click(c);
  expect(c).not.toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A');
});

it('the selected tab has data-active', () => {
  render(<Example />);
  expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('data-active');
  expect(screen.getByRole('tab', { name: 'B' })).not.toHaveAttribute(
    'data-active',
  );
});

it('a value with no matching Tab renders no active tab and no panel', () => {
  render(<Example value="gone" />);
  for (const tab of screen.getAllByRole('tab')) {
    expect(tab).not.toHaveAttribute('aria-selected', 'true');
    expect(tab).not.toHaveAttribute('data-active');
  }
  expect(screen.queryByRole('tabpanel')).toBeNull();
});

it('variant and size apply their classes, defaulting to underline and md', () => {
  const { rerender } = render(<Example />);
  const list = () => screen.getByRole('tablist');
  const tab = () => screen.getByRole('tab', { name: 'A' });
  expect(list()).toHaveClass(styles.listVariant.underline);
  expect(tab()).toHaveClass(styles.tabVariant.underline, styles.tabSize.md);
  rerender(<Example variant="pill" size="sm" />);
  expect(list()).toHaveClass(styles.listVariant.pill);
  expect(tab()).toHaveClass(styles.tabVariant.pill, styles.tabSize.sm);
});

it('startIcon is decorative and the tab is named by its text', () => {
  render(
    <Tabs defaultValue="a">
      <TabsList aria-label="Views">
        <Tab value="a" startIcon={<svg data-testid="icon" />}>
          A
        </Tab>
      </TabsList>
    </Tabs>,
  );
  expect(screen.getByRole('tab', { name: 'A' })).toContainElement(
    screen.getByTestId('icon'),
  );
});

it('className and layout props go on the root', () => {
  const { container } = render(<Example className="extra" marginTop="4" />);
  expect(container.firstElementChild).toHaveClass('extra');
});

it('value and defaultValue do not reach the root element', () => {
  const { container, unmount } = render(<Example />);
  expect(container.firstElementChild).not.toHaveAttribute('defaultValue');
  expect(container.firstElementChild).not.toHaveAttribute('value');
  unmount();
  const controlled = render(<Example value="a" />);
  expect(controlled.container.firstElementChild).not.toHaveAttribute('value');
});
