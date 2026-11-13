import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, type AccordionProps } from './index';

function Faq(props: Omit<AccordionProps, 'children'>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a" title="Billing" data-testid="a">
        Billing answer
      </AccordionItem>
      <AccordionItem value="b" title="Refunds" data-testid="b">
        Refunds answer
      </AccordionItem>
      <AccordionItem value="c" title="Legacy" disabled data-testid="c">
        Legacy answer
      </AccordionItem>
    </Accordion>
  );
}

const header = (name: string) => screen.getByRole('button', { name });

it('uncontrolled: defaultValue opens an item, and opening another closes it', async () => {
  render(<Faq defaultValue={['a']} />);
  expect(screen.getByText('Billing answer')).toBeVisible();
  await userEvent.click(header('Refunds'));
  expect(screen.getByText('Refunds answer')).toBeVisible();
  expect(screen.queryByText('Billing answer')).toBeNull();
});

it('multiple keeps two items open', async () => {
  render(<Faq multiple defaultValue={['a']} />);
  await userEvent.click(header('Refunds'));
  expect(screen.getByText('Billing answer')).toBeVisible();
  expect(screen.getByText('Refunds answer')).toBeVisible();
});

it('controlled: onValueChange receives only the value, and value decides what is open', async () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <Faq value={['a']} onValueChange={onValueChange} />,
  );
  await userEvent.click(header('Refunds'));
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange.mock.calls[0]).toEqual([['b']]);
  expect(screen.getByText('Billing answer')).toBeVisible();
  expect(screen.queryByText('Refunds answer')).toBeNull();
  rerender(<Faq value={['b']} onValueChange={onValueChange} />);
  expect(screen.getByText('Refunds answer')).toBeVisible();
});

it('headingLevel sets the tag, not the class, and defaults to 3', () => {
  const { rerender } = render(<Faq />);
  const h3 = header('Billing').parentElement!;
  expect(h3.tagName).toBe('H3');
  const className = h3.className;
  rerender(<Faq headingLevel={2} />);
  const h2 = header('Billing').parentElement!;
  expect(h2.tagName).toBe('H2');
  expect(h2.className).toBe(className);
});

it('closed content is absent by default', () => {
  render(<Faq />);
  expect(screen.queryByText('Billing answer')).toBeNull();
});

it('keepMounted keeps closed content, hidden until found', () => {
  render(<Faq keepMounted />);
  const panel = screen.getByText('Billing answer').closest('[hidden]');
  expect(panel).toHaveAttribute('hidden', 'until-found');
});

it("an item's keepMounted overrides the root's", () => {
  render(
    <Accordion keepMounted>
      <AccordionItem value="a" title="Kept">
        Kept answer
      </AccordionItem>
      <AccordionItem value="b" title="Dropped" keepMounted={false}>
        Dropped answer
      </AccordionItem>
    </Accordion>,
  );
  expect(screen.getByText('Kept answer')).toBeInTheDocument();
  expect(screen.queryByText('Dropped answer')).toBeNull();
});

it('an item keeps its content with its own keepMounted', () => {
  render(
    <Accordion>
      <AccordionItem value="a" title="Kept" keepMounted>
        Kept answer
      </AccordionItem>
    </Accordion>,
  );
  expect(screen.getByText('Kept answer').closest('[hidden]')).toHaveAttribute(
    'hidden',
    'until-found',
  );
});

it('items carry data-open and data-disabled', () => {
  render(<Faq defaultValue={['a']} />);
  expect(screen.getByTestId('a')).toHaveAttribute('data-open');
  expect(screen.getByTestId('b')).not.toHaveAttribute('data-open');
  expect(screen.getByTestId('c')).toHaveAttribute('data-disabled');
  expect(screen.getByTestId('a')).not.toHaveAttribute('data-disabled');
});

it('size changes the header class, and defaults to md', () => {
  const { rerender } = render(<Faq />);
  const md = header('Billing').className;
  rerender(<Faq size="md" />);
  expect(header('Billing').className).toBe(md);
  rerender(<Faq size="sm" />);
  expect(header('Billing').className).not.toBe(md);
});

it('accepts layout props', () => {
  const { container } = render(<Faq marginTop="4" />);
  const plain = render(<Faq />).container;
  expect(container.firstElementChild!.className).not.toBe(
    plain.firstElementChild!.className,
  );
});
