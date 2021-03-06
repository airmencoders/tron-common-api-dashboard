import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { GenericStringArrayResponseWrapper, PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDtoResponseWrapper, ScratchStorageControllerApi, ScratchStorageControllerApiInterface, ScratchStorageEntryDto } from '../../../openapi';
import { prepareDataCrudErrorResponse } from '../../data-service/data-service-utils';
import { ScratchStorageFlat } from '../scratch-storage-flat';
import ScratchStorageService from '../scratch-storage-service';
import { wrapState } from '../scratch-storage-state';

jest.mock('../../privilege/privilege-state');

describe('scratch storage service tests', () => {
  let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
  let scratchStorageApi: ScratchStorageControllerApiInterface;
  let wrappedState: ScratchStorageService;
  let scratchStorageKeysToCreateUpdateState : State<ScratchStorageEntryDto[]> & StateMethodsDestroy;
  let scratchStorageKeysToDeleteState : State<string[]> & StateMethodsDestroy;

  const dtos: ScratchStorageAppRegistryDto[] = [
      {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: true,
        aclMode: false,
        userPrivs: [
            {
                userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                emailAddress: 'test@test.com',
                privs: [
                    {
                        userPrivPairId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        priv: {
                            id: 0,
                            name: "string"
                        }
                    }
                ]
            }
        ]
      },
      {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: true,
        aclMode: false,
        userPrivs: []
      }
  ];

  const dto: ScratchStorageAppRegistryDto = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true,
    aclMode: false,
    userPrivs: [
        {
            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            emailAddress: 'test@test.com',
            privs: [
                {
                    userPrivPairId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    priv: {
                        id: 1,
                        name: "SCRATCH_READ"
                    }
                }
            ]
        }
    ]
  }

  const entry: ScratchStorageAppRegistryDto = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true,
    aclMode: false,
  }

  const flat: ScratchStorageFlat = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true,
    aclMode: false,
    keyNames: [],
    userPrivs: [
        {
            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            email: 'test@test.com',
            read: true,
            write: false,
            admin: false
        }
    ]
  }

  const axiosGetResponse: AxiosResponse = {
    data: { data: dtos },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosGetByIdResponse: AxiosResponse = {
    data: dto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosPostPutResponse = {
    data: entry,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosDeleteResponse = {
    data: entry,
    status: 204,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const rejectMsg = 'failed';

  const axiosGetKeysResponse : AxiosResponse<GenericStringArrayResponseWrapper> = {
    data: { data: ['some-key'], pagination: {} },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(async () => {
    scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
    selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);
    privilegeState = createState<PrivilegeDto[]>([]);
    scratchStorageApi = new ScratchStorageControllerApi();
    scratchStorageKeysToCreateUpdateState = createState<ScratchStorageEntryDto[]>([{
      appId: 'some other id',
      key: 'other-key',
      value: 'some other value',
    }]);
    scratchStorageKeysToDeleteState = createState<string[]>(new Array<string>());
      wrappedState = wrapState(scratchStorageState, 
        selectedScratchStorageState, 
        scratchStorageApi, 
        privilegeState,
        scratchStorageKeysToCreateUpdateState,
        scratchStorageKeysToDeleteState);
  });

  afterEach(() => {
    scratchStorageState.destroy();
    selectedScratchStorageState.destroy();
    privilegeState.destroy();
    scratchStorageKeysToCreateUpdateState.destroy();
    scratchStorageKeysToDeleteState.destroy();
  });

  it('Test fetch and store', async () => {
    scratchStorageApi.getScratchSpaceAppsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const cancellableRequest = wrappedState.fetchAndStoreData();
    const data = await cancellableRequest.promise;

    expect(data).toEqual(dtos);
  });

  it('Test convertToFlat', () => {
    const converted: ScratchStorageFlat = wrappedState.convertToFlat(dto);

    expect(converted).toEqual(flat);
  });

  it('Test error', async () => {
    scratchStorageApi.getScratchSpaceAppsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDtoResponseWrapper>>((resolve, reject) => {
        setTimeout(() => {
          reject(rejectMsg)
        }, 1000)
      });
    });

    const errorRequest = prepareDataCrudErrorResponse(rejectMsg);

    const cancellableRequest = wrappedState.fetchAndStoreData();
    expect(wrappedState.error).toBe(undefined);

    await expect(cancellableRequest.promise).rejects.toEqual(errorRequest);
    expect(wrappedState.error).toEqual(errorRequest);
  });

  it('Test sendUpdate', async () => {
    scratchStorageApi.editExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosPostPutResponse));
    });
    scratchStorageApi.addUserPriv = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(wrappedState.sendUpdate(flat)).resolves.toEqual(Object.assign({}, flat, { userPrivs: [] }));
  });

  it('Test sendUpdate Fail', async () => {
    scratchStorageApi.editExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendUpdate(flat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdFlat: ScratchStorageFlat = {
      ...flat,
      id: ''
    };

    expect.assertions(1);

    try {
      await wrappedState.sendUpdate(noIdFlat);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Test sendCreate', async () => {
    scratchStorageApi.postNewScratchSpaceApp = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosPostPutResponse));
    });
    scratchStorageApi.getScratchSpaceAppsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });
    scratchStorageApi.addUserPriv = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(wrappedState.sendCreate(flat)).resolves.toEqual(Object.assign({}, flat, { userPrivs: [] }));
  });

  it('Test sendCreate Fail', async () => {
    scratchStorageApi.postNewScratchSpaceApp = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>((resolve, reject) => reject(rejectMsg));
    });
    scratchStorageApi.getScratchSpaceAppsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    await expect(wrappedState.sendCreate(flat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Success', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete(flat)).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendDelete(flat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Fail - bad id', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete({ ...flat, id: undefined })).rejects.toBeDefined();
  });

  it('Test sendDelete Success - delete from state', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosDeleteResponse));
    });

    wrappedState.state.set([dto]);

    await expect(wrappedState.sendDelete(dto)).resolves.not.toThrow();
  });

  it('Test convertRowDataToEditableData', async () => {
    scratchStorageApi.getScratchAppById = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosGetByIdResponse));
    });
    scratchStorageApi.getAllKeysForAppIdWrapped = jest.fn(() => Promise.resolve(axiosGetKeysResponse))
    await expect(wrappedState.convertRowDataToEditableData(dto)).resolves.toEqual({...flat, keyNames: ['some-key']});
  });

  it('Test convertAppClientToFlat', () => {
    const result = wrappedState.convertToFlat(dto);
    expect(result).toEqual(flat);
  });

  it('Test convertToDto', () => {
    const result = wrappedState.convertToDto(flat);
    expect(result).toEqual(Object.assign({}, dto, { userPrivs: undefined }));
  });
});