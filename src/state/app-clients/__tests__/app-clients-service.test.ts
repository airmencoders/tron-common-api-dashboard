import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientFlat } from '../interface/app-client-flat';
import { wrapState } from '../app-clients-state';
import AppClientsService from '../app-clients-service';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../interface/privilege-type';
import { Configuration, Privilege, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto } from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import Config from '../../../api/configuration';
import PrivilegeService from '../../privilege/privilege-service';

jest.mock('../../privilege/privilege-state');

describe('App Client State Tests', () => {
  let appClientsState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientsApi: AppClientControllerApiInterface;
  let state: AppClientsService;

  const flatClients: AppClientFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test",
      read: true,
      write: true
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "Test1",
      read: false,
      write: false
    }
  ];

  const clients: AppClientUserDto[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test",
      privileges: [
        {
          "id": 1,
          "name": PrivilegeType.READ
        },
        {
          "id": 2,
          "name": PrivilegeType.WRITE
        }
      ]
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "Test1"
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: clients,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const testClientPrivileges: Privilege[] = [
    {
      id: 1,
      name: PrivilegeType.READ
    },
    {
      id: 2,
      name: PrivilegeType.WRITE
    }
  ]

  const testClientDto: AppClientUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test Client",
    privileges: testClientPrivileges
  };

  const testClientFlat: AppClientFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    name: 'Test Client',
    read: true,
    write: true
  }

  const axiosPostPutResponse = {
    data: testClientDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const privilegDtos: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.READ
    },
    {
      id: 2,
      name: PrivilegeType.WRITE
    }
  ];

  const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
  const privilegeApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));

  function mockPrivilegesState() {
    (accessPrivilegeState as jest.Mock).mockReturnValue(new PrivilegeService(privilegeState, privilegeApi));
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve({
        data: privilegDtos,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });
  }

  beforeEach(() => {
    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi();
    state = wrapState(appClientsState, appClientsApi);
  });

  afterEach(() => {
    appClientsState.destroy();
  })

  afterAll((done) => {
    privilegeState.destroy();
    done();
  })

  it('Test fetch and store', async () => {
    appClientsApi.getAppClientUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await state.fetchAndStoreAppClients();

    expect(state.appClients?.get()).toEqual(flatClients);
  });

  it('Test convertAppClientsToFlat', () => {
    const converted: AppClientFlat[] = state.convertAppClientsToFlat(clients);

    expect(converted).toEqual(flatClients);
  });

  it('Test appClients', async () => {
    appClientsApi.getAppClientUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const fetch = state.fetchAndStoreAppClients();
    expect(state.appClients).toBe(undefined);

    await fetch;
    expect(state.appClients?.get()).toEqual(flatClients);
  });

  it('Test error', async () => {
    appClientsApi.getAppClientUsers = jest.fn(() => {
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

  it('Test sendUpdatedAppClient', async () => {
    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    const updatePromise = await state.sendUpdatedAppClient(testClientDto);
    expect(updatePromise.data).toEqual(testClientDto);
  });

  it('Test sendCreateAppClient', async () => {
    appClientsApi.createAppClientUser = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    const updatePromise = await state.sendCreateAppClient(testClientDto);
    expect(updatePromise.data).toEqual(testClientDto);
  });

  it('Test convertAppClientToFlat', () => {
    const result = state.convertAppClientToFlat(testClientDto);
    expect(result).toEqual(testClientFlat);
  });

  it('Test convertToDto', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    const result = state.convertToDto(testClientFlat);
    expect(result).toEqual(testClientDto);
  });

  it('Test createAppPrivilegesArr', () => {
    mockPrivilegesState()

    const result = state.createAppPrivilegesArr(testClientFlat);
    expect(result).toEqual(testClientPrivileges);
  });

});