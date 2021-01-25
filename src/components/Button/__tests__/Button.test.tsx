import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Button from '../Button';

test('shows the Button', async () => {
  render(<Button type="button">Button Title</Button>);
  await waitFor(
      () => expect(screen.getByText("Button Title"))
          .toBeTruthy());
});

test('is disabled for disabled attribute', async () => {
  render(<Button type="button" disabled>Button Title</Button>);
  await waitFor(
      () => expect(screen.getByText("Button Title").closest('button'))
          .toHaveAttribute('disabled'));
});
