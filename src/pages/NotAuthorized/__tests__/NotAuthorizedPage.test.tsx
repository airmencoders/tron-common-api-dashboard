import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotAuthorizedPage } from '../NotAuthorizedPage';

it('Test Not Authorized Page', async () => {
  const page = render(
    <MemoryRouter>
      <NotAuthorizedPage />
    </MemoryRouter>
  );

  expect(page.getByText('Not Authorized')).toBeDefined();
});