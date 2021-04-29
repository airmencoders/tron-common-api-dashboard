import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../../privilege/privilege-type';
import { Privilege, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryEntry, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import PrivilegeService from '../../privilege/privilege-service';
import { ScratchStorageFlat } from '../scratch-storage-flat';
import ScratchStorageService from '../scratch-storage-service';
import { wrapState } from '../scratch-storage-state';

jest.mock('../../privilege/privilege-state');

describe('scratch storage service tests', () => {
  let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
  let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
  let scratchStorageApi: ScratchStorageControllerApiInterface;
  let wrappedState: ScratchStorageService;

  const flats: ScratchStorageFlat[] = [
      {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: false,
        userPrivs: [
            {
                userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                email: 'test@test.com',
                read: false,
                write: false,
                admin: false
            }
        ]
      },
      {
        id: 'ba85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name 2',
        appHasImplicitRead: false,
        userPrivs: []
      }
  ];

  const dtos: ScratchStorageAppRegistryDto[] = [
      {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: true,
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
        userPrivs: []
      }
  ];

  const dto: ScratchStorageAppRegistryDto = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true,
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

  const entry: ScratchStorageAppRegistryEntry = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true
  }

  const flat: ScratchStorageFlat = {
    id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
    appName: 'Test App Name',
    appHasImplicitRead: true,
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
    data: dtos,
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

  const testClientPrivileges: Privilege[] = [
    {
      id: 1,
      name: PrivilegeType.SCRATCH_READ
    },
    {
      id: 2,
      name: PrivilegeType.SCRATCH_WRITE
    },
    {
      id: 3,
      name: PrivilegeType.SCRATCH_ADMIN
    }
  ]

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

  const privilegDtos: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.SCRATCH_READ
    },
    {
      id: 2,
      name: PrivilegeType.SCRATCH_WRITE
    },
    {
      id: 3,
      name: PrivilegeType.SCRATCH_ADMIN
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

  const rejectMsg = 'failed';

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

  beforeEach(async () => {
    scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
    selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);
    scratchStorageApi = new ScratchStorageControllerApi();
    wrappedState = wrapState(scratchStorageState, selectedScratchStorageState, scratchStorageApi);

    privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
    privilegeApi = new PrivilegeControllerApi();

    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();
  });

  afterEach(() => {
    scratchStorageState.destroy();
    selectedScratchStorageState.destroy();
    privilegeState.destroy();
  });

  it('Test fetch and store', async () => {
    scratchStorageApi.getScratchSpaceApps = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>(resolve => resolve(axiosGetResponse));
    });

    const data = await wrappedState.fetchAndStoreData();

    expect(data).toEqual(dtos);
  });

  it('Test convertToFlat', () => {
    const converted: ScratchStorageFlat = wrappedState.convertToFlat(dto);

    expect(converted).toEqual(flat);
  });

  it('Test error', async () => {
    scratchStorageApi.getScratchSpaceApps = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>((resolve, reject) => {
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
    scratchStorageApi.editExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosPostPutResponse));
    });
    scratchStorageApi.addUserPriv = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(wrappedState.sendUpdate(flat)).resolves.toEqual(Object.assign({}, flat, { userPrivs: [] }));
  });

  it('Test sendUpdate Fail', async () => {
    scratchStorageApi.editExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>((resolve, reject) => reject(rejectMsg));
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
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosPostPutResponse));
    });
    scratchStorageApi.getScratchSpaceApps = jest.fn(() => {
        return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>(resolve => resolve(axiosGetResponse));
    });
    scratchStorageApi.addUserPriv = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(wrappedState.sendCreate(flat)).resolves.toEqual(Object.assign({}, flat, { userPrivs: [] }));
  });

  it('Test sendCreate Fail', async () => {
    scratchStorageApi.postNewScratchSpaceApp = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>((resolve, reject) => reject(rejectMsg));
    });
    scratchStorageApi.getScratchSpaceApps = jest.fn(() => {
        return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await expect(wrappedState.sendCreate(flat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Success', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete(flat)).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(wrappedState.sendDelete(flat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Fail - bad id', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(wrappedState.sendDelete({ ...flat, id: undefined })).rejects.toBeDefined();
  });

  it('Test sendDelete Success - delete from state', async () => {
    scratchStorageApi.deleteExistingAppEntry = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryEntry>>(resolve => resolve(axiosDeleteResponse));
    });

    wrappedState.state.set([dto]);

    await expect(wrappedState.sendDelete(dto)).resolves.not.toThrow();
  });

  it('Test convertRowDataToEditableData', async () => {
    scratchStorageApi.getScratchAppById = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto>>(resolve => resolve(axiosGetByIdResponse));
    });
    await expect(wrappedState.convertRowDataToEditableData(dto)).resolves.toEqual(flat);
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