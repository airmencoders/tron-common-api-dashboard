import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';

it('Test Not Found Page', async () => {
  const page = render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );

  expect(page.getByText('Not Found')).toBeDefined();
});