// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {MockedRequest, RequestParams, ResponseComposition, rest, RestContext} from 'msw';
import { setupServer } from 'msw/node';
import {DefaultRequestBodyType} from 'msw/lib/types/utils/handlers/requestHandler';
import { PrivilegeType } from './state/privilege/privilege-type';
import { Configuration } from './openapi';

const mockOpenapiConfig = jest.fn();
jest.mock('./api/openapi-config', () => ({
  get globalOpenapiConfig() {
    return mockOpenapiConfig;
  }
}));

function returnDefaultResponse(req: MockedRequest<DefaultRequestBodyType, RequestParams>,res: ResponseComposition<any>, ctx: RestContext) {
  console.log(`${req.method} - ${req.url.href}`);
  return res(ctx.json({}));
}

const server = setupServer(
  rest.get(/\/api\/v2\/userinfo/, (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get(/\/api\/v2\/userinfo\/existing-person/, (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get(/\/api\/v2\/document-space\/spaces\/files\/recently-uploaded/, (req, res, ctx) => {
    return res(ctx.json({ data: [] }));
  }),
  rest.get(/api\/v2\/document-space\/spaces\/.*?\/contents/, (req, res, ctx) => {
    return res(ctx.json({ documents: [] }));
  }),
  rest.get(/api\/v2\/document-space\/spaces\/.*\/users\/dashboard\/privileges\/self/, (req, res, ctx) => {
    return res(ctx.json({ type: 'MEMBERSHIP' }));
  }),
  rest.get(/\/api\/v2\/version/, (req, res, ctx) => {
    return res(ctx.json({ version: 'sdfsf', enclave: 'il2', environment: 'staging' }))
  }),
  rest.get(/\/api\/v2\/document-space\/spaces\/.*?\/collection\/favorite/, (req, res, ctx) => {
    return res(ctx.json({ data: [] }));
  }),
  rest.get(/\/api\/v2\/privilege/, (req, res, ctx) => {
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
  rest.get(/app-client\/privs/, (req, res, ctx) => {
    let counter = 0;
    return res(ctx.json({
      "data": Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item }))
    }))
  }),
  rest.post(/\api\/v2\/person\/find/, (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get(/\/api\/v1\/app-source\/spec\/.*/, (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get(/\/api\/v2\/logs/, (req, res, ctx) => {
    return res(ctx.json({ data: [{}], pagination: {}}));
  }),
  rest.get(/dashboard-users\/self/, (req, res, ctx) => {
    return res(ctx.json({
      "id": "bc621874-99c7-4b4b-8c5b-b6124f563706",
      "email": "jj2@gmail.com",
      "privileges": [
        {
          "id": 7,
          "name": "SCRATCH_ADMIN"
        },
        {
          "id": 6,
          "name": "DASHBOARD_ADMIN"
        },
        {
          "id": 5,
          "name": "DASHBOARD_USER"
        }
        ]
      }))
  }),
  rest.get(/scratch\/users\/privs/, (req, res, ctx) => {
    let counter = 0;
    return res(ctx.json({
      "data": Object.values(PrivilegeType).filter((item : string) => item.startsWith("SCRATCH")).map((item : any) => ({id: counter++, name: item }))
    }))
  }),
  rest.get('*', returnDefaultResponse),
  rest.post('*', returnDefaultResponse),
  rest.patch('*', returnDefaultResponse),
  rest.put('*', returnDefaultResponse),
  rest.delete('*', returnDefaultResponse)
)

beforeAll(() => {
  mockOpenapiConfig.mockReturnValue({
    configuration: new Configuration(),
    basePath: '',
    axios: undefined
  });
  server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
