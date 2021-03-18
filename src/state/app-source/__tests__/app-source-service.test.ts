import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDetailsDto, AppSourceDto, PrivilegeDto } from '../../../openapi';
import AppSourceService from '../app-source-service';
import { wrapAppSourceState } from '../app-source-state';

describe('App Client State Tests', () => {
  let appSourceState: State<AppSourceDto[]> & StateMethodsDestroy;
  let appSourceApi: AppSourceControllerApiInterface;
  let wrappedState: AppSourceService;

  const appSourceDtos: AppSourceDto[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "App Source 1",
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "App Source 2"
    }
  ];

  const appSourceDetailDtos: AppSourceDetailsDto[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "App Source 1",
      "appClients": [
        {
          "appClientUser": "6e054926-0d6b-41c1-a66e-4e0ab917bf4d",
          "privilegeIds": [
            1,
            2
          ]
        }
      ]
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "App Source 2",
      "appClients": [
        {
          "appClientUser": "d61ae4ac-bdbb-432b-a50c-f3cfbd535a5c",
          "privilegeIds": [
            1
          ]
        }
      ]
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: appSourceDtos,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const rejectMsg = 'failed';

  beforeEach(async () => {
    appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
    appSourceApi = new AppSourceControllerApi();
    wrappedState = wrapAppSourceState(appSourceState, appSourceApi);
  });

  afterEach(() => {
    appSourceState.destroy();
  })

  it('Test fetch and store', async () => {
    appSourceApi.getAppSources = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await wrappedState.fetchAndStoreData();

    expect(wrappedState.appSources).toEqual(appSourceDtos);
  });

  it('Test appSources', async () => {
    appSourceApi.getAppSources = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDto[]>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.appSources).toEqual([]);

    await fetch;
    expect(wrappedState.appSources).toEqual(appSourceDtos);
  });

  it('Test error', async () => {
    appSourceApi.getAppSources = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject(rejectMsg)
        }, 1000)
      });
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(rejectMsg);
    expect(wrappedState.error).toBe(rejectMsg);
  });
});