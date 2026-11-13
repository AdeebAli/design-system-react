import { Accordion, AccordionItem } from './index';

test('values are typed', () => {
  <Accordion
    value={['a']}
    onValueChange={(value: string[]) => void value}
    headingLevel={2}
    size="sm"
    marginTop="4"
  >
    <AccordionItem value="a" title={<b>Title</b>} disabled keepMounted>
      Content
    </AccordionItem>
  </Accordion>;
  // @ts-expect-error not a heading level
  <Accordion headingLevel={7} />;
  // @ts-expect-error not a size
  <Accordion size="lg" />;
  // @ts-expect-error value is a string array
  <Accordion value="a" />;
  // @ts-expect-error an item needs a value
  <AccordionItem title="T">C</AccordionItem>;
  // @ts-expect-error an item needs a title
  <AccordionItem value="a">C</AccordionItem>;
});
