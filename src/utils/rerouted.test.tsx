import { render, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Accordion, AccordionItem } from '../components/Accordion';
import { Avatar } from '../components/Avatar';
import { box } from '../components/Box';
import { gridCountClass } from '../components/Box/gridCounts.css';
import { BreadcrumbItem, Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Combobox } from '../components/Combobox';
import { DataTable } from '../components/DataTable';
import { Field } from '../components/Field';
import { FileUpload } from '../components/FileUpload';
import { Input } from '../components/Input';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '../components/Menu';
import { MultiSelect } from '../components/MultiSelect';
import { NavBar } from '../components/NavBar';
import { Pagination } from '../components/Pagination';
import { Popover, PopoverContent, PopoverTrigger } from '../components/Popover';
import { Progress } from '../components/Progress';
import { Radio } from '../components/Radio';
import { RadioGroup } from '../components/RadioGroup';
import { Select } from '../components/Select';
import { Sidebar, SidebarGroup, SidebarLink } from '../components/Sidebar';
import { Switch } from '../components/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/Table';
import { Tab, Tabs, TabsList, TabsPanel } from '../components/Tabs';
import { Textarea } from '../components/Textarea';
import { ToggleChip } from '../components/ToggleChip';
import { ToggleChipGroup } from '../components/ToggleChipGroup';
import type { LayoutProps } from '../components/Box/types';

// The components that render a Base UI element they can't wrap in Box apply
// layout props themselves (Spec 19). Each row renders one with `props` on the
// part that documents receiving them.
type Extra = LayoutProps & { style?: object };
interface Row {
  name: string;
  ui: (props: Extra) => ReactElement;
  /** Whether a consumer's `style` lands on the element that has the layout class. */
  styleOnLayout?: boolean;
  /** Renders into a portal after a tick. */
  async?: boolean;
}

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];
const people = [{ id: '1', name: 'Ada' }];
const dataTable = (props: Extra) => (
  <DataTable
    {...{
      'aria-label': 'People',
      rows: people,
      columns: [
        { id: 'name', header: 'Name', cell: (p: { name: string }) => p.name },
      ],
      getRowId: (p: { id: string }) => p.id,
      ...props,
    }}
  />
);
function menu(part: (props: Extra) => ReactElement) {
  return function OpenMenu(props: Extra) {
    return (
      <Menu open>
        <MenuTrigger>
          <Button>Actions</Button>
        </MenuTrigger>
        <MenuContent>{part(props)}</MenuContent>
      </Menu>
    );
  };
}

const rows: Row[] = [
  {
    name: 'Accordion',
    ui: (p) => (
      <Accordion {...p}>
        <AccordionItem value="a" title="A">
          x
        </AccordionItem>
      </Accordion>
    ),
    styleOnLayout: true,
  },
  {
    name: 'AccordionItem',
    ui: (p) => (
      <Accordion>
        <AccordionItem value="a" title="A" {...p}>
          x
        </AccordionItem>
      </Accordion>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Avatar',
    ui: (p) => <Avatar name="Ada" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Breadcrumbs',
    ui: (p) => (
      <Breadcrumbs {...p}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>
    ),
    styleOnLayout: true,
  },
  { name: 'Button', ui: (p) => <Button {...p}>x</Button>, styleOnLayout: true },
  {
    name: 'Checkbox with a label (ChoiceLabel)',
    ui: (p) => <Checkbox label="x" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Checkbox with no label (ChoiceLabel)',
    ui: (p) => <Checkbox aria-label="x" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Switch (ChoiceLabel)',
    ui: (p) => <Switch label="x" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Radio (ChoiceLabel)',
    ui: (p) => (
      <RadioGroup aria-label="r">
        <Radio value="a" label="x" {...p} />
      </RadioGroup>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Combobox',
    ui: (p) => <Combobox aria-label="c" options={options} {...p} />,
    styleOnLayout: true,
  },
  { name: 'DataTable', ui: dataTable, styleOnLayout: false },
  {
    name: 'Field',
    ui: (p) => (
      <Field label="x" {...p}>
        <Input />
      </Field>
    ),
    styleOnLayout: true,
  },
  {
    name: 'FileUpload',
    ui: (p) => <FileUpload aria-label="f" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Input',
    ui: (p) => <Input aria-label="i" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'MultiSelect button',
    ui: (p) => <MultiSelect aria-label="m" options={options} {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'MultiSelect search',
    ui: (p) => (
      <MultiSelect aria-label="m" options={options} searchable {...p} />
    ),
    styleOnLayout: true,
  },
  {
    name: 'NavBar',
    ui: (p) => <NavBar aria-label="n" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Pagination',
    ui: (p) => (
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={() => undefined}
        {...p}
      />
    ),
    styleOnLayout: true,
  },
  {
    name: 'PopoverContent',
    ui: (p) => (
      <Popover open>
        <PopoverTrigger>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent {...p}>x</PopoverContent>
      </Popover>
    ),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'Progress',
    ui: (p) => <Progress aria-label="p" value={1} {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'RadioGroup',
    ui: (p) => (
      <RadioGroup aria-label="r" {...p}>
        <Radio value="a" label="x" />
      </RadioGroup>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Select',
    ui: (p) => <Select aria-label="s" options={options} {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'Sidebar',
    ui: (p) => (
      <Sidebar aria-label="s" {...p}>
        <SidebarGroup>
          <SidebarLink href="#a">A</SidebarLink>
        </SidebarGroup>
      </Sidebar>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Table',
    ui: (p) => (
      <Table {...p}>
        <TableHead>
          <TableRow>
            <TableHeader>H</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>c</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
    styleOnLayout: false,
  },
  {
    name: 'Textarea',
    ui: (p) => <Textarea aria-label="t" {...p} />,
    styleOnLayout: true,
  },
  {
    name: 'ToggleChip',
    ui: (p) => <ToggleChip {...p}>x</ToggleChip>,
    styleOnLayout: true,
  },
  {
    name: 'ToggleChipGroup',
    ui: (p) => (
      <ToggleChipGroup aria-label="g" {...p}>
        <ToggleChip value="a">A</ToggleChip>
      </ToggleChipGroup>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Tabs',
    ui: (p) => (
      <Tabs defaultValue="a" {...p}>
        <TabsList aria-label="v">
          <Tab value="a">A</Tab>
        </TabsList>
        <TabsPanel value="a">x</TabsPanel>
      </Tabs>
    ),
    styleOnLayout: true,
  },
  {
    name: 'TabsList',
    ui: (p) => (
      <Tabs defaultValue="a">
        <TabsList aria-label="v" {...p}>
          <Tab value="a">A</Tab>
        </TabsList>
      </Tabs>
    ),
    styleOnLayout: true,
  },
  {
    name: 'Tab',
    ui: (p) => (
      <Tabs defaultValue="a">
        <TabsList aria-label="v">
          <Tab value="a" {...p}>
            A
          </Tab>
        </TabsList>
      </Tabs>
    ),
    styleOnLayout: true,
  },
  {
    name: 'TabsPanel',
    ui: (p) => (
      <Tabs defaultValue="a">
        <TabsList aria-label="v">
          <Tab value="a">A</Tab>
        </TabsList>
        <TabsPanel value="a" {...p}>
          x
        </TabsPanel>
      </Tabs>
    ),
    styleOnLayout: true,
  },
  {
    name: 'MenuContent',
    ui: (p) => (
      <Menu open>
        <MenuTrigger>
          <Button>Actions</Button>
        </MenuTrigger>
        <MenuContent {...p}>
          <MenuItem>a</MenuItem>
        </MenuContent>
      </Menu>
    ),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuItem',
    ui: menu((p) => <MenuItem {...p}>a</MenuItem>),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuLinkItem',
    ui: menu((p) => (
      <MenuLinkItem href="/" {...p}>
        a
      </MenuLinkItem>
    )),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuCheckboxItem',
    ui: menu((p) => <MenuCheckboxItem {...p}>a</MenuCheckboxItem>),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuRadioItem',
    ui: menu((p) => (
      <MenuRadioGroup value="a">
        <MenuRadioItem value="a" {...p}>
          a
        </MenuRadioItem>
      </MenuRadioGroup>
    )),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuRadioGroup',
    ui: menu((p) => <MenuRadioGroup value="a" {...p} />),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuGroup',
    ui: menu((p) => (
      <MenuGroup {...p}>
        <MenuItem>a</MenuItem>
      </MenuGroup>
    )),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuGroupLabel',
    ui: menu((p) => (
      <MenuGroup>
        <MenuGroupLabel {...p}>g</MenuGroupLabel>
      </MenuGroup>
    )),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuSeparator',
    ui: menu((p) => <MenuSeparator {...p} />),
    styleOnLayout: true,
    async: true,
  },
  {
    name: 'MenuSubmenuTrigger',
    ui: menu((p) => (
      <MenuSubmenu>
        <MenuSubmenuTrigger {...p}>s</MenuSubmenuTrigger>
        <MenuSubmenuContent>
          <MenuItem>a</MenuItem>
        </MenuSubmenuContent>
      </MenuSubmenu>
    )),
    styleOnLayout: true,
    async: true,
  },
];

const layoutClasses = box({ marginTop: '4' }).split(' ');
const layoutElement = () =>
  [...document.body.querySelectorAll<HTMLElement>('*')].find((element) =>
    layoutClasses.every((name) => element.classList.contains(name)),
  );
async function found(row: Row) {
  if (row.async) {
    await waitFor(() => expect(layoutElement()).toBeDefined());
  }
  const element = layoutElement();
  expect(element).toBeDefined();
  return element!;
}

describe.each(rows)('$name', (row) => {
  it('applies a layout prop', async () => {
    render(row.ui({ marginTop: '4' }));
    await found(row);
  });

  it('applies a grid count as a class and a variable', async () => {
    render(row.ui({ marginTop: '4', gridColumn: 14 }));
    const element = await found(row);
    expect(element).toHaveClass(gridCountClass.gridColumn.base);
    expect(element.style.getPropertyValue('--ds-grid-column-base')).toBe('14');
  });

  it('keeps a consumer style beside a grid count', async () => {
    render(row.ui({ marginTop: '4', gridColumn: 14, style: { color: 'red' } }));
    const element = await found(row);
    expect(element.style.getPropertyValue('--ds-grid-column-base')).toBe('14');
    expect(element.style.color === 'red').toBe(row.styleOnLayout);
  });

  it('puts a consumer style where it went before', async () => {
    render(row.ui({ marginTop: '4', style: { color: 'red' } }));
    const element = await found(row);
    expect(element.style.color === 'red').toBe(row.styleOnLayout);
  });
});
