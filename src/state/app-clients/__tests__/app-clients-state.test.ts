import { createState, StateMethods } from '@hookstate/core';
import { AppClientsApi } from '../../../api/app-clients/app-clients-api';
import { AppClient } from '../../../api/app-clients/interface/app-client';
import { AppClientFlat } from '../../../api/app-clients/interface/app-client-flat';
import { AppClientsState, wrapState } from '../app-clients-state';
import AppClientsService from '../interface/app-clients-service';

describe('App Client State Tests', () => {
  let appClientsState: StateMethods<AppClientsState | undefined>;
  let appClientsApi: AppClientsApi;
  let state: AppClientsService;

  const flatClients: AppClientFlat[] = [
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      "name": "Test",
      "nameAsLower": "test",
      "read": true,
      "write": true,
      "dashboard": false
    }
  ];

  const clients: AppClient[] = [
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      "name": "Test",
      "nameAsLower": "test",
      "privileges": [
        {
          "id": 1,
          "name": "READ"
        },
        {
          "id": 2,
          "name": "WRITE"
        }
      ]
    }
  ];

  beforeEach(() => {
    appClientsState = createState<AppClientsState | undefined>(undefined);
    appClientsApi = new AppClientsApi();
    state = wrapState(appClientsState, appClientsApi);
  });

  it('Test fetch and store', () => {
    state.fetchAndStoreAppClients = jest.fn(() => {
      appClientsState.set({
        error: undefined,
        clients: flatClients
      })
    });

    state.fetchAndStoreAppClients();

    expect(state.appClients).toEqual(flatClients);
  });

  it('Test convert client to flat', () => {
    const converted: AppClientFlat[] = state.convertAppClientsToFlat(clients);

    expect(converted).toEqual(flatClients);
  });

});