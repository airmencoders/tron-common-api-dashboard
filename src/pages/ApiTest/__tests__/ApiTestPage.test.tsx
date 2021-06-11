import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApiTestPage from '../ApiTestPage';

test('Api Test Page', async () => {
  const routeComponentPropsMock = {
    history: {} as any,
    location: {
      search: `?basePath=${encodeURIComponent('http://localhost/9000')}`
    } as any,
    match: {
      params: {
        appId: '1'
      }
    } as any,
  }

  render(
      <MemoryRouter>
        <ApiTestPage {...routeComponentPropsMock} />
      </MemoryRouter>);
  await waitFor(
      () => expect(screen.getByTestId('api-test-page')).toBeTruthy()
  );
});
