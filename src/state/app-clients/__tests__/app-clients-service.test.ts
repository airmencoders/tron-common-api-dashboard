import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientFlat } from '../app-client-flat';
import { wrapState } from '../app-clients-state';
import AppClientsService from '../app-clients-service';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../../privilege/privilege-type';
import { AppClientUserDetailsDto, AppClientUserDtoResponseWrapped, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto, PrivilegeDtoResponseWrapper } from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import PrivilegeService from '../../privilege/privilege-service';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';

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
      ],
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "Test1",
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: { data: clients },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const testClientPrivileges: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.READ
    },
    {
      id: 2,
      name: PrivilegeType.WRITE
    }
  ];

  const testClientPrivilegesDto : PrivilegeDto[] = testClientPrivileges as PrivilegeDto[];

  const testClientDto: AppClientUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test Client",
    privileges: testClientPrivileges
  };

  const testClientDetailsDto: AppClientUserDetailsDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test Client",
    privileges: testClientPrivileges,
    appClientDeveloperEmails: [],
    appEndpointPrivs: [],
  };

  const testClientFlat: AppClientFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    name: 'Test Client',
    read: true,
    write: true,
  }

  const testClientFlatWithDetails: AppClientFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    name: 'Test Client',
    read: true,
    write: true,
    appClientDeveloperEmails: [],
    appSourceEndpoints: [],
  }


  const axiosPostPutResponse = {
    data: testClientDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosDeleteResponse = {
    data: testClientDto,
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

  const axiosRejectResponse = {
    response: {
      data: {
        message: 'failed'
      },
      status: 400,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  };

  const getClientTypePrivsWrappedResponse: AxiosResponse = {
    data: { data: testClientPrivilegesDto },
    status: 200,
    headers: {},
    config: {},
    statusText: 'OK'
  };

  const rejectMsg = {
    general: axiosRejectResponse.response.data.message
  } as DataCrudFormErrors;

  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let privilegeApi: PrivilegeControllerApiInterface;

  function mockPrivilegesState() {
    (accessPrivilegeState as jest.Mock).mockReturnValue(new PrivilegeService(privilegeState, privilegeApi));
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve({
        data: { data: privilegDtos },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });
  }

  beforeEach(async () => {
    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi();
    wrappedState = wrapState(appClientsState, appClientsApi);

    privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
    privilegeApi = new PrivilegeControllerApi();

    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();
  });

  afterEach(() => {
    appClientsState.destroy();
    privilegeState.destroy();
  });

  it('Test fetch and store', async () => {
    appClientsApi.getAppClientUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDtoResponseWrapped>>(resolve => resolve(axiosGetResponse));
    });

    await wrappedState.fetchAndStoreData();

    expect(wrappedState.appClients).toEqual(flatClients);
  });

  it('Test convertToFlat', () => {
    const converted: AppClientFlat[] = wrappedState.convertAppClientsToFlat(clients);

    expect(converted).toEqual(flatClients);
  });

  it('Test appClients', async () => {
    appClientsApi.getAppClientUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDtoResponseWrapped>>(resolve => setTimeout(() => resolve(axiosGetResponse), 200));
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.appClients).toEqual([]);

    await fetch;
    expect(wrappedState.appClients).toEqual(flatClients);
  });

  it('Test error', async () => {
    appClientsApi.getAppClientUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDtoResponseWrapped>>((resolve, reject) => {
        setTimeout(() => {
          reject(axiosRejectResponse)
        }, 200)
      });
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(rejectMsg);
    expect(wrappedState.error).toEqual(rejectMsg);
  });

  it('Test sendUpdate', async () => {
    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    appClientsState.set([testClientFlat]);

    await expect(wrappedState.sendUpdate(testClientFlat)).resolves.toEqual(testClientFlat);
    expect(appClientsState.get()).toEqual([testClientFlat]);
  });

  it('Test sendUpdate Fail', async () => {
    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
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
    appClientsApi.createAppClientUser = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    await expect(wrappedState.sendCreate(testClientFlat)).resolves.toEqual(testClientFlat);
  });

  it('Test sendCreate Fail', async () => {
    appClientsApi.createAppClientUser = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    await expect(wrappedState.sendCreate(testClientFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Success', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete(testClientFlat)).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(wrappedState.sendDelete(testClientFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Fail - bad id', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete({ ...testClientFlat, id: undefined })).rejects.toBeDefined();
  });

  it('Test sendDelete Success - delete from state', async () => {
    appClientsApi.deleteAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosDeleteResponse));
    });

    wrappedState.state.set([testClientFlat]);

    await expect(wrappedState.sendDelete(testClientFlat)).resolves.not.toThrow();
  });

  it('Test convertRowDataToEditableData', async () => {
    appClientsApi.getAppClientRecord = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDetailsDto>>(resolve => resolve({
        data: testClientDetailsDto,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });

    await expect(wrappedState.convertRowDataToEditableData(testClientFlat)).resolves.toEqual(testClientFlatWithDetails);
  });

  it('Test convertAppClientToFlat', () => {
    const result = wrappedState.convertToFlat(testClientDto);
    expect(result).toEqual(testClientFlat);
  });

  it('Test convertToDto', async () => {
    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    const result = wrappedState.convertToDto(testClientFlat);
    await expect(result).resolves.toEqual(testClientDto);
  });

  it('Test createAppPrivilegesArr', async () => {
    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    const result = await wrappedState.createAppPrivilegesArr(testClientFlat);
    expect(result).toEqual(testClientPrivileges);
  });

  it('Test Create App Privileges', async () => {
    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    const result = await wrappedState.createAppPrivileges(testClientFlat);
    expect(result.size).toEqual(2);
  });

  it('Test No privilege user', async () => {
    appClientsApi.getClientTypePrivsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(getClientTypePrivsWrappedResponse));
    });

    const noPrivUser = {
      ...testClientFlat,
      read: false,
      write: false
    };
    const result = await wrappedState.createAppPrivileges(noPrivUser);
    expect(result.size).toEqual(0);
  });
});
