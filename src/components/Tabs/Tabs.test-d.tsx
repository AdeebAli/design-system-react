import { Tab, Tabs, TabsPanel } from './index';

test('value or defaultValue is required, and values are strings', () => {
  <Tabs value="a" />;
  <Tabs defaultValue="a" onValueChange={(value: string) => value} />;
  // @ts-expect-error value or defaultValue is required
  <Tabs />;
  // @ts-expect-error values are strings
  <Tabs value={1} />;
  // @ts-expect-error variant is underline or pill
  <Tabs value="a" variant="solid" />;
});

test('Tab and TabsPanel require value', () => {
  <Tab value="a" />;
  // @ts-expect-error value is required
  <Tab />;
  <TabsPanel value="a" keepMounted />;
  // @ts-expect-error value is required
  <TabsPanel />;
});
