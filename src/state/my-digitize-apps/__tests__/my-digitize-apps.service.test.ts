import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {AxiosResponse} from 'axios';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  ScratchStorageAppRegistryDto,
  ScratchStorageControllerApi,
  ScratchStorageControllerApiInterface
} from '../../../openapi';
import MyDigitizeAppsService from '../my-digitize-apps-service';
import {ScratchStorageAppFlat} from '../scratch-storage-app-flat';
import {wrapDigitizeAppsState} from '../my-digitize-apps-state';
import {PrivilegeType} from '../../privilege/privilege-type';
import {accessAuthorizedUserState} from '../../authorized-user/authorized-user-state';
import AuthorizedUserService from '../../authorized-user/authorized-user-service';

jest.mock('../../authorized-user/authorized-user-state');

const userPrivilegedUser: DashboardUserDto = {
  id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
  email: 'test@person.com',
  privileges: [
    {
      id: 2,
      name: PrivilegeType.DASHBOARD_USER
    }
  ]
};

const getUserPrivilegedUserResponse: AxiosResponse = {
  data: userPrivilegedUser,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

describe('My Digitize Apps Service Tests', () => {
  let digitizeAppsState: State<ScratchStorageAppFlat[]> & StateMethodsDestroy;
  let digitizeAppsApi: ScratchStorageControllerApiInterface;
  let wrappedState: MyDigitizeAppsService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;

  const scratchStorageAppDtos: ScratchStorageAppRegistryDto[] = [
    {
      id: "78e79165-9f22-4d9b-8ea1-e89ab5e46128",
      appName: "App 3",
      appHasImplicitRead: false,
      userPrivs: [
        {
          userId: "547ba45f-e28e-499f-b3b6-3cf89b832c31",
          emailAddress: userPrivilegedUser.email,
          privs: [
            {
              userPrivPairId: "6527fca6-0e97-4ca8-bde7-61dc393df9fb",
              priv: {
                id: 7,
                name: PrivilegeType.SCRATCH_ADMIN
              }
            },
            {
              userPrivPairId: "6527fca6-0e97-4ca8-bde7-61dc393df9fe",
              priv: {
                id: 9,
                name: PrivilegeType.SCRATCH_READ
              }
            }
          ]
        }
      ]
    },
    {
      id: "cd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      appName: "Test App Client 2",
      appHasImplicitRead: true,
      userPrivs: [
        {
          userId: "fd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
          emailAddress: userPrivilegedUser.email,
          privs: [
            {
              userPrivPairId: "fd05272f-aeb8-4c58-89a8-e5c0b2f48dd3",
              priv: {
                id: 7,
                name: PrivilegeType.READ
              }
            },
            {
              userPrivPairId: "6527fca6-0e97-4ca8-bde7-61dc393df9fe",
              priv: {
                id: 9,
                name: PrivilegeType.SCRATCH_WRITE
              }
            }
          ]
        }
      ]
    },
    {
      appName: "Test App Client 3",
      appHasImplicitRead: false,
      userPrivs: [
        {
          userId: "fd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
          emailAddress: userPrivilegedUser.email,
          privs: [
            {
              userPrivPairId: "6527fca6-0e97-4ca8-bde7-61dc393df9fe",
              priv: {
                id: 9,
                name: PrivilegeType.SCRATCH_WRITE
              }
            }
          ]
        }
      ]
    }
  ];

  const scratchStorageAppFlats: ScratchStorageAppFlat[] = [
    {
      id: "78e79165-9f22-4d9b-8ea1-e89ab5e46128",
      appName: "App 3",
      appHasImplicitRead: false,
      scratchAdmin: true,
      scratchRead: true,
      scratchWrite: false
    },
    {
      id: "cd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      appName: "Test App Client 2",
      appHasImplicitRead: true,
      scratchAdmin: false,
      scratchRead: true,
      scratchWrite: true
    },
    {
      id: "",
      appName: "Test App Client 3",
      appHasImplicitRead: false,
      scratchAdmin: false,
      scratchRead: false,
      scratchWrite: true
    }
  ];

  const axiosGetAppSourceDtosResponse: AxiosResponse = {
    data: scratchStorageAppDtos,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const rejectMsg = 'Rejected';

  beforeEach(async () => {
    digitizeAppsState = createState<ScratchStorageAppFlat[]>(new Array<ScratchStorageAppFlat>());
    digitizeAppsApi = new ScratchStorageControllerApi();
    wrappedState = wrapDigitizeAppsState(digitizeAppsState, digitizeAppsApi);

    // Mock the authorized user
    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    (accessAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return Promise.resolve(getUserPrivilegedUserResponse);
    });
    await accessAuthorizedUserState().fetchAndStoreAuthorizedUser();
  });

  afterEach(() => {
    digitizeAppsState.destroy();
    authorizedUserState.destroy();
  })

  it('Test fetch and store', async () => {
    digitizeAppsApi.getScratchSpaceAppsByAuthorizedUser = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>(resolve => resolve(axiosGetAppSourceDtosResponse));
    });

    await wrappedState.fetchAndStoreData();

    expect(wrappedState.state.get()).toEqual(scratchStorageAppFlats);
  });

  it('Test error', async () => {
    digitizeAppsApi.getScratchSpaceAppsByAuthorizedUser = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject(rejectMsg);
        }, 200)
      });
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(rejectMsg);
    expect(wrappedState.error).toBe(rejectMsg);
  });

  it('Test promised state', async () => {
    digitizeAppsApi.getScratchSpaceAppsByAuthorizedUser = jest.fn(() => {
      return new Promise<AxiosResponse<ScratchStorageAppRegistryDto[]>>((resolve) => {
        setTimeout(() => {
          resolve(axiosGetAppSourceDtosResponse);
        }, 200)
      });
    });

    const fetch = wrappedState.fetchAndStoreData();
    expect(wrappedState.isPromised).toBe(true);

    await fetch;
    expect(wrappedState.isPromised).toBe(false);
  });

  it('Test convertDtoToFlat', () => {
    const flat = wrappedState.convertScratchStorageAppRegistryDtoToFlat(scratchStorageAppDtos[0]);

    expect(flat).toEqual(scratchStorageAppFlats[0]);
  });

  it('sendUpdate should throw -- not implemented', async () => {
    await expect(wrappedState.sendUpdate(scratchStorageAppDtos[0])).rejects.toThrow();
  });

  it('sendCreate should throw -- not implemented', async () => {
    await expect(wrappedState.sendCreate(scratchStorageAppDtos[0])).rejects.toThrow();
  });

  it('should not allow incorrectly formatted orgs to be sent', async () => {
    await expect(wrappedState.sendCreate({ badParam: 'some id'} as unknown as ScratchStorageAppRegistryDto))
        .rejects
        .toThrowError();
  });

  it('sendDelete should throw -- not implemented', async () => {
    await expect(wrappedState.sendDelete(scratchStorageAppDtos[0])).rejects.toThrow();
  });

  it('convertRowDataToEditableData should throw -- not implemented', async () => {
    await expect(wrappedState.convertRowDataToEditableData(scratchStorageAppFlats[0])).rejects.toThrow();
  });
});
