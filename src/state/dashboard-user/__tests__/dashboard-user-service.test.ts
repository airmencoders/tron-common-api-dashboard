import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { AppClientUserDto } from '../../../openapi/models/app-client-user-dto';
import { AxiosResponse } from 'axios';
import { Configuration, DashboardUserControllerApi, DashboardUserControllerApiInterface, DashboardUserDto, Privilege, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto } from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import Config from '../../../api/configuration';
import PrivilegeService from '../../privilege/privilege-service';
import DashboardUserService from '../dashboard-user-service';
import { DashboardUserFlat } from '../dashboard-user-flat';
import { PrivilegeType } from '../../app-clients/interface/privilege-type';
import { wrapDashboardUserState } from '../dashboard-user-state';

jest.mock('../../privilege/privilege-state');

describe('Dashboard User State Test', () => {
  let dashboardUserState: State<DashboardUserFlat[]> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApiInterface;
  let state: DashboardUserService;

  const privilegDtos: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.DASHBOARD_ADMIN
    },
    {
      id: 2,
      name: PrivilegeType.DASHBOARD_USER
    }
  ];

  const flatUsers: DashboardUserFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      email: "test@email.com",
      hasDashboardAdmin: true,
      hasDashboardUser: true
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      email: "test1@email.com",
      hasDashboardAdmin: false,
      hasDashboardUser: false
    }
  ];

  const users: DashboardUserDto[] = [
    {
      id: flatUsers[0].id,
      email: flatUsers[0].email,
      privileges: [
        {
          id: privilegDtos[0].id,
          name: privilegDtos[0].name
        },
        {
          id: privilegDtos[1].id,
          name: privilegDtos[1].name
        }
      ]
    },
    {
      id: flatUsers[1].id,
      email: flatUsers[1].email
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: users,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const testUserPrivileges: Privilege[] = [
    {
      id: privilegDtos[0].id,
      name: privilegDtos[0].name
    },
    {
      id: privilegDtos[1].id,
      name: privilegDtos[1].name
    }
  ];

  const testUserDto: DashboardUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    email: "Test Client",
    privileges: testUserPrivileges
  };

  const testUserFlat: DashboardUserFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    email: 'Test Client',
    hasDashboardAdmin: true,
    hasDashboardUser: true
  };

  const axiosPostPutResponse = {
    data: testUserDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

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
    dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());
    dashboardUserApi = new DashboardUserControllerApi();
    state = wrapDashboardUserState(dashboardUserState, dashboardUserApi);
  });

  afterEach(() => {
    dashboardUserState.destroy();
  })

  afterAll((done) => {
    privilegeState.destroy();
    done();
  })

  it('Test fetch and store', async () => {
    dashboardUserApi.getAllDashboardUsers = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto[]>>(resolve => resolve(axiosGetResponse));
    });

    const fetch = state.fetchAndStoreData();
    expect(state.dashboardUsers).toEqual(new Array<DashboardUserDto>());

    await fetch;
    expect(state.dashboardUsers).toEqual(flatUsers);
  });

  it('Test error', async () => {
    dashboardUserApi.getAllDashboardUsers = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject("Rejected")
        }, 1000)
      });
    });

    const fetch = state.fetchAndStoreData();
    expect(state.error).toBe(undefined);

    await expect(fetch).rejects.toEqual("Rejected");
    expect(state.error).toBe("Rejected");
  });

  it('Test sendUpdate Success', async () => {
    dashboardUserApi.updateDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(state.sendUpdate(testUserDto)).resolves.toEqual(testUserFlat);
  });

  it('Test sendUpdate Fail', async () => {
    dashboardUserApi.updateDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(state.sendUpdate(testUserDto)).rejects.toEqual(rejectMsg);
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdUser = {
      ...testUserDto,
      id: undefined
    };

    expect.assertions(1);

    try {
      await state.sendUpdate(noIdUser);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Test sendCreate Success', async () => {
    dashboardUserApi.addDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(state.sendCreate(testUserDto)).resolves.toEqual(testUserFlat);
  });

  it('Test sendCreate Fail', async () => {
    dashboardUserApi.addDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>((resolve, reject) => reject(rejectMsg));
    });

    await expect(state.sendCreate(testUserDto)).rejects.toEqual(rejectMsg);
  });

  it('Test convertDashboardUsersToFlat', () => {
    const converted: DashboardUserFlat[] = state.convertDashboardUsersToFlat(users);

    expect(converted).toEqual(flatUsers);
  });

  it('Test convertToFlat', () => {
    const result = state.convertToFlat(testUserDto);
    expect(result).toEqual(testUserFlat);
  });

  it('Test convertToFlat empty email', () => {
    const test = {
      ...testUserDto,
      email: undefined
    };

    const testFlat = {
      ...testUserFlat,
      email: ''
    };

    const result = state.convertToFlat(test);
    expect(result).toEqual(testFlat);
  });

  it('Test getDtoForRowData', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    const response = await state.getDtoForRowData(testUserFlat);
    // console.log(response);
    expect(response).toEqual(testUserDto);
  });

  it('Test convertToDto', async () => {
    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges();

    const result = state.convertToDto(testUserFlat);
    expect(result).toEqual(testUserDto);
  });

  it('Test createPrivilegesArr', () => {
    mockPrivilegesState()

    const result = state.createPrivilegesArr(testUserFlat);
    expect(result).toEqual(testUserPrivileges);
  });
});