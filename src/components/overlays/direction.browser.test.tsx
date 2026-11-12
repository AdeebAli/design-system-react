import { render, screen } from '@testing-library/react';
import { useDirection } from './direction';

afterEach(() => {
  document.documentElement.removeAttribute('dir');
});

function Reader() {
  return <p data-testid="dir">{useDirection()}</p>;
}

// Renders after `Reader` in the same pass, so `dir` changes after `Reader` has
// read it but before anything has subscribed.
function Flip() {
  document.documentElement.dir = 'rtl';
  return null;
}

it('follows a dir change made between render and subscribe', async () => {
  render(
    <>
      <Reader />
      <Flip />
    </>,
  );
  await expect.poll(() => screen.getByTestId('dir').textContent).toBe('rtl');
});

it('follows later dir changes', async () => {
  render(<Reader />);
  expect(screen.getByTestId('dir').textContent).toBe('ltr');
  document.documentElement.dir = 'rtl';
  await expect.poll(() => screen.getByTestId('dir').textContent).toBe('rtl');
  document.documentElement.dir = 'ltr';
  await expect.poll(() => screen.getByTestId('dir').textContent).toBe('ltr');
});
