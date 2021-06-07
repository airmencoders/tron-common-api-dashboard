import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SubscriberDtoSubscribedEventEnum } from '../../../openapi';
import PubSubPage from '../PubSubPage';
import {render, waitFor, screen} from '@testing-library/react';

const server = setupServer(
    rest.get('/api/v2/subscriptions', (req, res, ctx) => {
        return res(ctx.json({ data: [ { 
            id: 'some id', 
            appClientUser: 'blackhawk',
            subscriberAddress: '/api/organization',
            subscribedEvent: SubscriberDtoSubscribedEventEnum.OrganizationChange,
            secret: '',
        }]})
    )})
)

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should render', async () => {
  server.listen();
  render(
    <MemoryRouter>
      <PubSubPage />
    </MemoryRouter>
  );

  await waitFor(
      () => expect(screen.getAllByText('Pub Sub Subscribers')).toBeTruthy()
  )
});
