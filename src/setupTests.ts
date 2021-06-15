// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {MockedRequest, RequestParams, ResponseComposition, rest, RestContext} from 'msw';
import { setupServer } from 'msw/node';
import {DefaultRequestBodyType} from 'msw/lib/types/utils/handlers/requestHandler';

function returnDefaultResponse(req: MockedRequest<DefaultRequestBodyType, RequestParams>,res: ResponseComposition<any>, ctx: RestContext) {
  console.log(`${req.method} - ${req.url.href}`);
  return res(ctx.json({}));
}

const server = setupServer(
  rest.get('/api/v2/userinfo', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get('/api/v2/privilege', (req, res, ctx) => {
    return res(ctx.json({
      "data": [
        {
          "id": 1,
          "name": "READ"
        },
        {
          "id": 2,
          "name": "WRITE"
        },
        {
          "id": 3,
          "name": "DASHBOARD_ADMIN"
        },
        {
          "id": 4,
          "name": "DASHBOARD_USER"
        },
        {
          "id": 5,
          "name": "SCRATCH_WRITE"
        },
        {
          "id": 6,
          "name": "SCRATCH_READ"
        },
        {
          "id": 7,
          "name": "SCRATCH_ADMIN"
        },
        {
          "id": 8,
          "name": "APP_SOURCE_ADMIN"
        },
        {
          "id": 9,
          "name": "APP_CLIENT_DEVELOPER"
        }
      ]
    }))
  }),
  rest.post('/api/v2/person/find', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('/api/v1/app-source/spec/*', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get(/\/api\/v2\/logs/, (req, res, ctx) => {
    return res(ctx.json({ data: [{}], pagination: {}}));
  }),
  rest.get('*', returnDefaultResponse),
  rest.post('*', returnDefaultResponse),
  rest.patch('*', returnDefaultResponse),
  rest.put('*', returnDefaultResponse),
  rest.delete('*', returnDefaultResponse)
)

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
