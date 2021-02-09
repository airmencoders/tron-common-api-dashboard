import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientFlat } from '../interface/app-client-flat';
import { wrapState } from '../app-clients-state';
import AppClientsService from '../app-clients-service';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../interface/privilege-type';

describe('App Client State Tests', () => {
  let appClientsState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientsApi: AppClientControllerApiInterface;
  let state: AppClientsService;

  const flatClients: AppClientFlat[] = [
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      "name": "Test",
      "read": true,
      "write": true,
      "dashboard_admin": true,
      "dashboard_user": true
    },
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      "name": "Test1",
      "read": false,
      "write": false,
      "dashboard_admin": false,
      "dashboard_user": false
    }
  ];

  const clients: AppClientUserDto[] = [
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      "name": "Test",
      "privileges": new Set([
        {
          "id": 1,
          "name": PrivilegeType.READ
        },
        {
          "id": 2,
          "name": PrivilegeType.WRITE
        },
        {
          "id": 3,
          "name": PrivilegeType.DASHBOARD_ADMIN
        },
        {
          "id": 4,
          "name": PrivilegeType.DASHBOARD_USER
        }
      ])
    },
    {
      "id": "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      "name": "Test1"
    }
  ];

  const axiosRes: AxiosResponse = {
    data: clients,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(() => {
    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi();
    state = wrapState(appClientsState, appClientsApi);
  });

  afterEach(() => {
    appClientsState.destroy();
  })

  afterAll((done) => {
    done();
  })

  it('Test fetch and store', async () => {
    appClientsApi.getUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => resolve(axiosRes));
    });

    await state.fetchAndStoreAppClients();

    expect(state.appClients).toEqual(flatClients);
  });

  it('Test convert client to flat', () => {
    const converted: AppClientFlat[] = state.convertAppClientsToFlat(clients);

    expect(converted).toEqual(flatClients);
  });

  it('Test appClients', async () => {
    appClientsApi.getUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => setTimeout(() => resolve(axiosRes), 1000));
    });

    const fetch = state.fetchAndStoreAppClients();
    expect(state.appClients).toBe(undefined);

    await fetch;
    expect(state.appClients).toEqual(flatClients);
  });

  it('Test error', async () => {
    appClientsApi.getUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject("Rejected")
        }, 1000)
      });
    });

    const fetch = state.fetchAndStoreAppClients();
    expect(state.error).toBe(undefined);

    await expect(fetch).rejects.toEqual("Rejected");
    expect(state.error).toBe("Rejected");
  });

});