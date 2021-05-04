import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { AppClientControllerApi, AppClientControllerApiInterface, AppClientUserDto, AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDetailsDto, AppSourceDto, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto } from '../../../openapi';
import { AppClientFlat } from '../../app-clients/app-client-flat';
import AppClientsService from '../../app-clients/app-clients-service';
import { accessAppClientsState } from '../../app-clients/app-clients-state';
import PrivilegeService from '../../privilege/privilege-service';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import { PrivilegeType } from '../../privilege/privilege-type';
import AppSourceService from '../app-source-service';
import { wrapAppSourceState } from '../app-source-state';

jest.mock('../../privilege/privilege-state');
jest.mock('../../app-clients/app-clients-state');

describe('App Source State Tests', () => {
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

  const testAppSourceDto: AppSourceDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "App Source 1",
  }

  const testAppSourceDetailsDto: AppSourceDetailsDto = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    name: 'test',
    appClients: [
      {
        appClientUser: 'App Client User ID',
        appClientUserName: 'App Client Name',
        appEndpoint: 'test_endpoint',
      }
    ],
    appSourceAdminUserEmails: [
      'test@email.com'
    ],
    endpoints: [
      {
        id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
        path: 'endpoint_path',
        requestType: 'GET'
      }
    ],
    appSourcePath: 'test'
  };

  const testAppSourceDetailsDtoWithFullPath: AppSourceDetailsDto = {
    ...testAppSourceDetailsDto,
    appSourcePath: '/api/v1/app/test/<app-source-endpoint>'
  };

  const axiosGetAppSourceDtosResponse: AxiosResponse = {
    data: appSourceDtos,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosGetAppSourceDetailsDtoResponse: AxiosResponse = {
    data: testAppSourceDetailsDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosPostPutResponse: AxiosResponse<AppSourceDetailsDto> = {
    data: testAppSourceDetailsDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const rejectMsg = 'failed';

  /**
   * Mock Privilege state
   */
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

  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let privilegeApi: PrivilegeControllerApiInterface;

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

  /**
   * Mock App Clients state
   */
  const appClientUserDtos: AppClientUserDto[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd1",
      name: "Test",
      privileges: [
        ...privilegDtos
      ]
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd2",
      name: "Test1"
    }
  ];

  let appClientsState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientsApi: AppClientControllerApiInterface;

  function mockAppClientsState() {
    (accessAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.getAppClientUsers = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto[]>>(resolve => resolve({
        data: appClientUserDtos,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });
  }

  beforeEach(async () => {
    appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
    appSourceApi = new AppSourceControllerApi();
    wrappedState = wrapAppSourceState(appSourceState, appSourceApi);

    privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
    privilegeApi = new PrivilegeControllerApi();

    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi();

    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    mockAppClientsState();
    await accessAppClientsState().fetchAndStoreData();
  });

  afterEach(() => {
    appSourceState.destroy();
    privilegeState.destroy();
    appClientsState.destroy();
  })

  it('Test fetch and store', async () => {
    appSourceApi.getAppSources = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDto[]>>(resolve => resolve(axiosGetAppSourceDtosResponse));
    });

    await wrappedState.fetchAndStoreData();

    expect(wrappedState.appSources).toEqual(appSourceDtos);
  });

  it('Test appSources', async () => {
    appSourceApi.getAppSources = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDto[]>>(resolve => setTimeout(() => resolve(axiosGetAppSourceDtosResponse), 1000));
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

  it('Test sendUpdate', async () => {
    appSourceApi.updateAppSourceDetails = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDetailsDto>>(resolve => resolve(axiosPostPutResponse));
    });

    const expectedResponse: AppSourceDto = {
      id: testAppSourceDetailsDto.id,
      name: testAppSourceDetailsDto.name,
      clientCount: testAppSourceDetailsDto.appClients?.length,
      endpointCount: testAppSourceDetailsDto.endpoints?.length
    };

    appSourceState.set([expectedResponse]);

    await expect(wrappedState.sendUpdate(testAppSourceDetailsDto)).resolves.toEqual(expectedResponse);
    expect(appSourceState.get()).toEqual([expectedResponse]);
  });

  it('Test sendUpdate Fail', async () => {
    appSourceApi.updateAppSourceDetails = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDetailsDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendUpdate(testAppSourceDetailsDto)).rejects.toEqual(rejectMsg);
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdAppSourceDetailsDto: AppSourceDetailsDto = {
      ...testAppSourceDetailsDto,
      id: ''
    };

    expect.assertions(1);

    try {
      await wrappedState.sendUpdate(noIdAppSourceDetailsDto);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('sendCreate should throw -- not implemented', async () => {
    await expect(wrappedState.sendCreate(testAppSourceDetailsDto)).rejects.toThrow();
  });

  it('sendDelete should throw -- not implemented', async () => {
    await expect(wrappedState.sendDelete(testAppSourceDetailsDto)).rejects.toThrow();
  });

  it('Test convertRowDataToEditableData', async () => {
    appSourceApi.getAppSourceDetails = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceDetailsDto>>(resolve => resolve(axiosGetAppSourceDetailsDtoResponse));
    });

    await expect(wrappedState.convertRowDataToEditableData(testAppSourceDto)).resolves.toEqual(testAppSourceDetailsDtoWithFullPath);

    await expect(wrappedState.convertRowDataToEditableData({ ...testAppSourceDto, id: undefined })).rejects.toBeDefined();
    await expect(wrappedState.convertRowDataToEditableData({ ...testAppSourceDto, id: '' })).rejects.toBeDefined();
  });

  it('should generate full path based on app source path', () => {
    const fullPath = wrappedState.generateFullPath('test');

    expect(fullPath).toEqual('/api/v1/app/test/<app-source-endpoint>');
  });
});