import { Button } from '../Button';
import { MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from './index';

function Stub(props: { to: string; label?: string }) {
  return <a href={props.to}>{props.label}</a>;
}

test('MenuTrigger takes exactly one element', () => {
  <MenuTrigger>
    <Button>Open</Button>
  </MenuTrigger>;
  // @ts-expect-error a string is not an element
  <MenuTrigger>Open</MenuTrigger>;
});

test('MenuContent side and align are logical', () => {
  <MenuContent side="end" align="start" />;
  // @ts-expect-error left is not a logical side
  <MenuContent side="left" />;
});

test('MenuItem has no `as`', () => {
  <MenuItem tone="danger">Delete</MenuItem>;
  // @ts-expect-error only links accept `as`
  <MenuItem as="a">Delete</MenuItem>;
  // @ts-expect-error unknown tone
  <MenuItem tone="loud">Delete</MenuItem>;
});

test('MenuLinkItem as={Stub} takes Stub props', () => {
  <MenuLinkItem href="/a">Plain</MenuLinkItem>;
  <MenuLinkItem as={Stub} to="/a" label="x">
    Stub
  </MenuLinkItem>;
  // @ts-expect-error Stub requires `to`
  <MenuLinkItem as={Stub}>Stub</MenuLinkItem>;
  // @ts-expect-error `nope` is not a Stub prop
  <MenuLinkItem as={Stub} to="/a" nope="x">
    Stub
  </MenuLinkItem>;
});
