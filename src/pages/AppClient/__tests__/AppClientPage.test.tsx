import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppClientPage } from '../AppClientPage';

it('Test App Client Page', async () => {
  const page = render(
    <MemoryRouter>
      <AppClientPage />
    </MemoryRouter>
  );

  expect(page.getByText(/Loading/i)).toBeDefined();
});