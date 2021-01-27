import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import PageFormat from '../PageFormat';
import { MemoryRouter } from 'react-router-dom';

test('includes child elements in page', async () => {
  render(
    <MemoryRouter>
      <PageFormat>
        <div>Child Content</div>
      </PageFormat>
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText('Child Content')).toBeTruthy();
  })
});
