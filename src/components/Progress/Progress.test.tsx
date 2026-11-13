import { render, screen } from '@testing-library/react';
import { Progress } from './index';

it('value and max set aria-valuenow and aria-valuemax', () => {
  render(<Progress aria-label="Uploading" value={30} max={60} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuenow', '30');
  expect(bar).toHaveAttribute('aria-valuemax', '60');
});

it('max defaults to 100', () => {
  render(<Progress aria-label="Uploading" value={42} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuemax',
    '100',
  );
});

it('null is indeterminate, with no aria-valuenow', () => {
  render(<Progress aria-label="Importing" value={null} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).not.toHaveAttribute('aria-valuenow');
  expect(bar).toHaveAttribute('data-indeterminate');
});

it('a visible label names the progressbar', () => {
  render(<Progress label="Uploading report.pdf" value={42} />);
  expect(
    screen.getByRole('progressbar', { name: 'Uploading report.pdf' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Uploading report.pdf')).toBeVisible();
});

it('aria-label names the progressbar', () => {
  render(<Progress aria-label="Importing" value={10} />);
  expect(
    screen.getByRole('progressbar', { name: 'Importing' }),
  ).toBeInTheDocument();
});

it('showValue shows the percentage', () => {
  render(<Progress label="Uploading" value={21} max={50} showValue />);
  expect(screen.getByText('42%')).toBeInTheDocument();
});

it('shows no percentage without showValue', () => {
  render(<Progress label="Uploading" value={42} />);
  expect(screen.queryByText('42%')).toBeNull();
});

it('marks a full bar complete', () => {
  render(<Progress aria-label="Done" value={100} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-complete');
});
