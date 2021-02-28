import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {OrganizationControllerApi} from '../../../openapi';
import axios from 'axios';
import {render, waitFor, screen} from '@testing-library/react';
import OrganizationPage from '../OrganizationPage';
import { MemoryRouter } from 'react-router-dom';


const server = setupServer(
    rest.get('/api/v1/organization', (req, res, ctx) => {
      return res(ctx.json([]))
    }),
    rest.get('/api/v1/userinfo', (req, res, ctx) => {
      return res(ctx.json({}))
    }),
    rest.get('*', req => console.log(req.url.href))
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
