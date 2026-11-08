import { render, screen } from '@testing-library/react';
import { expectSameClass } from '../../utils/testUtils';
import { Box } from '../Box';
import { Center } from './index';

it('centers on both axes by default', () => {
  expectSameClass(
    <Center data-testid="c" />,
    <Box
      data-testid="c"
      display="flex"
      alignItems="center"
      justifyContent="center"
    />,
  );
});

it('axis="horizontal" sets only justifyContent', () => {
  expectSameClass(
    <Center data-testid="c" axis="horizontal" />,
    <Box data-testid="c" display="flex" justifyContent="center" />,
  );
});

it('axis="vertical" sets only alignItems', () => {
  expectSameClass(
    <Center data-testid="c" axis="vertical" />,
    <Box data-testid="c" display="flex" alignItems="center" />,
  );
});

it('inline uses inline-flex', () => {
  expectSameClass(
    <Center data-testid="c" inline />,
    <Box
      data-testid="c"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    />,
  );
});

it('a missing display base falls back to the inline default', () => {
  expectSameClass(
    <Center data-testid="c" inline display={{ md: 'none' }} />,
    <Box
      data-testid="c"
      display={{ base: 'inline-flex', md: 'none' }}
      alignItems="center"
      justifyContent="center"
    />,
  );
});

it('never forwards axis or inline, and renders as another element', () => {
  render(<Center as="span" data-testid="k" axis="both" inline />);
  const el = screen.getByTestId('k');
  expect(el.tagName).toBe('SPAN');
  expect(el.getAttribute('axis')).toBeNull();
  expect(el.getAttribute('inline')).toBeNull();
});
