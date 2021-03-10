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
  let wrappedState: AppClientsService;

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

  const axiosDeleteResponse = {
    data: undefined,
    status: 204,
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

  const rejectMsg = 'failed';

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
    wrappedState = wrapState(appClientsState, appClientsApi);
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

    await wrappedState.fetchAndStoreData();

    expect(wrappedState.appClients).toEqual(flatClients);
  });

  it('Test convertToFlat', () => {
    const converted: AppClientFlat[] = wrappedState.convertAppClientsToFlat(clients);

    expect(converted).toEqual(flatClients);
  });

  it('Test convertToFlat empty name', () => {
    const test = {
      ...testClientDto,
      name: undefined
    };

    const testFlat = {
      ...testClientFlat,
      name: ''
    };

    const result = wrappedState.convertToFlat(test);
    expect(result).toEqual(testFlat);
  });

  it('Test appClients', async () => {
    appClientsApi.getAppClientUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.appClients).toEqual([]);

    await fetch;
    expect(wrappedState.appClients).toEqual(flatClients);
  });

  it('Test error', async () => {
    appClientsApi.getAppClientUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject("Rejected")
        }, 1000)
      });
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual("Rejected");
    expect(wrappedState.error).toBe("Rejected");
  });

  it('Test sendUpdate', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    appClientsState.set([testClientFlat]);

    await expect(wrappedState.sendUpdate(testClientFlat)).resolves.toEqual(testClientFlat);
    expect(appClientsState.get()).toEqual([testClientFlat]);
  });

  it('Test sendUpdate Fail', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendUpdate(testClientFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdAppClient: AppClientFlat = {
      ...testClientFlat,
      id: undefined
    };

    expect.assertions(1);

    try {
      await wrappedState.sendUpdate(noIdAppClient);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Test sendCreate', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    appClientsApi.createAppClientUser = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(wrappedState.sendCreate(testClientFlat)).resolves.toEqual(testClientFlat);
  });

  it('Test sendCreate Fail', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    appClientsApi.createAppClientUser = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendCreate(testClientFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Success', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete(testClientFlat)).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<void>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendDelete(testClientFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Fail - bad id', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete({ ...testClientFlat, id: undefined })).rejects.toBeDefined();
  });

  it('Test sendDelete Success - delete from state', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    wrappedState.state.set([testClientFlat]);

    await expect(wrappedState.sendDelete(testClientFlat)).resolves.not.toThrow();
  });

  it('Test convertRowDataToEditableData', async () => {
    await expect(wrappedState.convertRowDataToEditableData(testClientFlat)).resolves.toEqual(testClientFlat);
  });

  it('Test convertAppClientToFlat', () => {
    const result = wrappedState.convertToFlat(testClientDto);
    expect(result).toEqual(testClientFlat);
  });

  it('Test convertToDto', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    const result = wrappedState.convertToDto(testClientFlat);
    expect(result).toEqual(testClientDto);
  });

  it('Test createAppPrivilegesArr', () => {
    mockPrivilegesState()

    const result = wrappedState.createAppPrivilegesArr(testClientFlat);
    expect(result).toEqual(testClientPrivileges);
  });

  it('Test Privilege not exist in state', async () => {
    mockPrivilegesState();

    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve({
        data: [],
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });

    await accessPrivilegeState().fetchAndStorePrivileges();

    const result = wrappedState.createAppPrivileges(testClientFlat);
    expect(result.size).toEqual(0);
  });

  it('Test No privilege user', () => {
    const noPrivUser = {
      ...testClientFlat,
      read: false,
      write: false
    };
    const result = wrappedState.createAppPrivileges(noPrivUser);
    expect(result.size).toEqual(0);
  });
});