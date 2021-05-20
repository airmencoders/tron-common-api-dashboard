import {rest} from 'msw';
import { setupServer } from 'msw/node';
import {render, waitFor, screen} from '@testing-library/react';
import OrganizationPage from '../OrganizationPage';
import { MemoryRouter } from 'react-router-dom';

const server = setupServer(
    rest.get('/api/v1/organization', (req, res, ctx) => {
      return res(ctx.json([ { id: 'some id', name: 'SOme Org'}]))
    })
)

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should render', async () => {
  server.listen();
  render(
    <MemoryRouter>
      <OrganizationPage />
    </MemoryRouter>
  );

  await waitFor(
      () => expect(screen.getAllByText('Organizations')).toBeTruthy()
  )
});

it('should test delete', async () => {
  server.listen();
  render(
    <MemoryRouter>
      <OrganizationPage />
    </MemoryRouter>
  );

  

});
