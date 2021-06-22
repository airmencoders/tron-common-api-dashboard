import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { AppClientUserDetailsDto, AppClientUserDtoResponseWrapped, PrivilegeDto, PrivilegeDtoResponseWrapper } from '../../../openapi';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { PrivilegeType } from '../../privilege/privilege-type';
import { AppClientFlat } from '../app-client-flat';
import AppClientsService from '../app-clients-service';
import { wrapState } from '../app-clients-state';

describe('App Client State Tests', () => {
  let appClientsState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientsApi: AppClientControllerApiInterface;
  let wrappedState: AppClientsService;

  let counter = 0;
  const privilegeDtos: PrivilegeDto[] = Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item }));

  const flatClients: AppClientFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      clusterUrl: "http://app.app.svc.cluster.local/",
      name: "Test",
      personCreate: true,
      personEdit: true,
      personDelete: false,
      orgCreate: true,
      orgEdit: true,
      orgDelete: false,
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      clusterUrl: "http://app2.app2.svc.cluster.local/",
      name: "Test1",      
      personCreate: false,
      personEdit: false,
      personDelete: false,
      orgCreate: false,
      orgEdit: false,
      orgDelete: false,
    }
  ];


  const clients: AppClientUserDto[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test",
      clusterUrl: "http://app.app.svc.cluster.local/",
      privileges: privilegeDtos.filter(item => item.name === 'PERSON_CREATE' || item.name === 'ORGANIZATION_CREATE')
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      clusterUrl: "http://app2.app2.svc.cluster.local/",
      name: "Test1",
      privileges: []
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: { data: clients },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const testClientPrivileges: PrivilegeDto[] = privilegeDtos.filter(item => item.name === 'PERSON_CREATE' || item.name === 'ORGANIZATION_CREATE')
  const testClientPrivilegesDto : PrivilegeDto[] = testClientPrivileges as PrivilegeDto[];

  const testClientDto: AppClientUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test Client",
    clusterUrl: "http://app.app.svc.cluster.local/",
    privileges: testClientPrivileges
  };

  const testClientDetailsDto: AppClientUserDetailsDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    name: "Test Client",
    clusterUrl: "http://app.app.svc.cluster.local/",
    privileges: testClientPrivileges,
    appClientDeveloperEmails: [],
    appEndpointPrivs: [],
  };

  const testClientFlat: AppClientFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    clusterUrl: "http://app.app.svc.cluster.local/",
    name: 'Test Client',
    personCreate: true,
    personEdit: false,
    personDelete: false,
    orgCreate: true,
    orgEdit: false,
    orgDelete: false,
    allPrivs: privilegeDtos.filter(item => item.name === 'PERSON_CREATE' || item.name === 'ORGANIZATION_CREATE')
  }

  const testClientFlatWithDetails: AppClientFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    clusterUrl: "http://app.app.svc.cluster.local/",
    name: 'Test Client',
    appClientDeveloperEmails: [],
    appSourceEndpoints: [],
    personCreate: true,
    personEdit: false,
    personDelete: false,
    orgCreate: true,
    orgEdit: false,
    orgDelete: false,
    allPrivs: privilegeDtos.filter(item => item.name === 'PERSON_CREATE' || item.name === 'ORGANIZATION_CREATE')
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

  beforeEach(async () => {
    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi();
    
    privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());

    wrappedState = wrapState(appClientsState, appClientsApi, privilegeState);
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

    const { allPrivs, ...localTestClientFlat } = {...testClientFlat, personEdit: true, orgEdit: true};
    appClientsState.set([testClientFlat]);

    await expect(wrappedState.sendUpdate(testClientFlat)).resolves.toEqual(localTestClientFlat);
    expect(appClientsState.get()).toEqual([localTestClientFlat]);
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

    const { allPrivs, ...localTestClientFlat } = {...testClientFlat, personEdit: true, orgEdit: true};
    await expect(wrappedState.sendCreate(testClientFlat)).resolves.toEqual(localTestClientFlat);
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
    const { allPrivs, ...localTestClientFlat } = {...testClientFlat, personEdit: true, orgEdit: true};
    expect(result).toEqual(localTestClientFlat);
  });

  it('Test convertToDto', async () => {
    const result = wrappedState.convertToDto(testClientFlat);
    await expect(result).resolves.toEqual(testClientDto);

    const result2 = wrappedState.convertToDto({ id: 'some id',
      name: 'name',
      clusterUrl: '',
      allPrivs: privilegeDtos.filter(item => item.name.match(/PERSON_CREATE|PERSON_EDIT|Person-firstName/))
    });

    await expect(result2).resolves.toEqual({ id: 'some id',
      name: 'name',
      clusterUrl: '',
      appClientDeveloperEmails: undefined,
      privileges: privilegeDtos.filter(item => item.name.match(/PERSON_CREATE/))
    });

    const result3 = wrappedState.convertToDto({ id: 'some id',
      name: 'name',
      clusterUrl: '',
      allPrivs: privilegeDtos.filter(item => item.name.match(/ORGANIZATION_CREATE|PERSON_CREATE|ORGANIZATION_EDIT|Person-firstName|Organization-name/))
    });

    await expect(result3).resolves.toEqual({ id: 'some id',
      name: 'name',
      clusterUrl: '',
      appClientDeveloperEmails: undefined,
      privileges: privilegeDtos.filter(item => item.name.match(/ORGANIZATION_CREATE|PERSON_CREATE/))
    });
  });  
});
