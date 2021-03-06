import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { Configuration, DashboardUserControllerApi, DashboardUserControllerApiInterface, DashboardUserDto, DashboardUserDtoResponseWrapper, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto, PrivilegeDtoResponseWrapper } from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import Config from '../../../api/config';
import PrivilegeService from '../../privilege/privilege-service';
import DashboardUserService from '../dashboard-user-service';
import { DashboardUserFlat } from '../dashboard-user-flat';
import { PrivilegeType } from '../../privilege/privilege-type';
import { wrapDashboardUserState } from '../dashboard-user-state';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { prepareDataCrudErrorResponse } from '../../data-service/data-service-utils';

jest.mock('../../privilege/privilege-state');

describe('Dashboard User State Test', () => {
  let dashboardUserState: State<DashboardUserFlat[]> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApiInterface;
  let dashboardUserDtoCache: State<Record<string, DashboardUserDto>> & StateMethodsDestroy;
  let state: DashboardUserService;

  const privilegDtos: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.DASHBOARD_ADMIN
    }
  ];

  const flatUsers: DashboardUserFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      email: "test@email.com",
      hasDashboardAdmin: true,
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      email: "test1@email.com",
      hasDashboardAdmin: false,
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
        }
      ]
    },
    {
      id: flatUsers[1].id,
      email: flatUsers[1].email
    }
  ];

  const axiosGetResponse: AxiosResponse = {
    data: { data: users },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const testUserPrivileges: PrivilegeDto[] = [
    {
      id: privilegDtos[0].id,
      name: privilegDtos[0].name
    }
  ];

  const testUserDto: DashboardUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    email: "test@email.com",
    privileges: testUserPrivileges
  };

  const testUserFlat: DashboardUserFlat = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    email: 'test@email.com',
    hasDashboardAdmin: true,
  };

  const axiosPostPutResponse = {
    data: testUserDto,
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

  const axiosRejectResponse = {
    response: {
      data: {
        reason: 'failed'
      },
      status: 400,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  };

  const rejectMsg = {
    general: axiosRejectResponse.response.data.reason
  } as DataCrudFormErrors;


  const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
  const privilegeApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));

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
    dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());
    dashboardUserApi = new DashboardUserControllerApi();
    dashboardUserDtoCache = createState<Record<string, DashboardUserDto>>({});
    state = wrapDashboardUserState(dashboardUserState, dashboardUserApi, dashboardUserDtoCache);

    mockPrivilegesState();
    await accessPrivilegeState().fetchAndStorePrivileges().promise;
  });

  afterEach(() => {
    dashboardUserState.destroy();
  })

  afterAll((done) => {
    privilegeState.destroy();
    done();
  })

  it('Test fetch and store', async () => {
    dashboardUserApi.getAllDashboardUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const cancellableRequest = state.fetchAndStoreData();
    expect(state.dashboardUsers).toEqual([]);

    await cancellableRequest.promise;
    expect(state.dashboardUsers).toEqual(flatUsers);

    const dtoCache = users.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.id!]: curr
      }
    }, {});
    expect(dashboardUserDtoCache.get()).toEqual(dtoCache);
  });

  it('Test error', async () => {
    dashboardUserApi.getAllDashboardUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDtoResponseWrapper>>((resolve, reject) => {
        setTimeout(() => {
          reject(axiosRejectResponse)
        }, 1000)
      });
    });

    const errorRequest = prepareDataCrudErrorResponse(axiosRejectResponse);

    const cancellableRequest = state.fetchAndStoreData();
    expect(state.error).toBe(undefined);

    await expect(cancellableRequest.promise).rejects.toEqual(errorRequest);
    expect(state.error).toEqual(errorRequest);
  });

  it('Test sendUpdate Success', async () => {
    dashboardUserApi.updateDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>(resolve => resolve(axiosPostPutResponse));
    });

    dashboardUserState.set([testUserFlat])

    await expect(state.sendUpdate(testUserDto)).resolves.toEqual(testUserFlat);
    expect(dashboardUserState.get()).toEqual([testUserFlat]);
    expect(dashboardUserDtoCache.get()).toEqual({
      [testUserDto.id!]: testUserDto
    })
  });

  it('Test sendUpdate Fail', async () => {
    dashboardUserApi.updateDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendUpdate(testUserFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdUser: DashboardUserFlat = {
      ...testUserFlat,
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

    await expect(state.sendCreate(testUserFlat)).resolves.toEqual(testUserFlat);
    expect(dashboardUserState.get()).toEqual([testUserFlat]);
    expect(dashboardUserDtoCache.get()).toEqual({
      [testUserDto.id!]: testUserDto
    });
  });

  it('Test sendCreate Fail', async () => {
    dashboardUserApi.addDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendCreate(testUserFlat)).rejects.toEqual(axiosRejectResponse);
  });

  it('Test sendDelete Success', async () => {
    dashboardUserApi.deleteDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(state.sendDelete(testUserFlat)).resolves.not.toThrow();
    expect(dashboardUserState.get()).toHaveLength(0);
    expect(Object.keys(dashboardUserDtoCache.get())).toHaveLength(0);
  });

  it('Test sendDelete Fail', async () => {
    dashboardUserApi.deleteDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<void>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendDelete(testUserFlat)).rejects.toEqual(rejectMsg);
  });

  it('Test sendDelete Fail - bad id', async () => {
    dashboardUserApi.deleteDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(state.sendDelete({ ...testUserFlat, id: undefined })).rejects.toBeDefined();
  });

  it('Test sendDelete Success - delete from state', async () => {
    dashboardUserApi.deleteDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<void>>(resolve => resolve(axiosDeleteResponse));
    });

    state.state.set([testUserFlat]);
    dashboardUserDtoCache.set({ [testUserDto.id!]: testUserDto });
    expect(dashboardUserState.get()).toHaveLength(1);
    expect(Object.keys(dashboardUserDtoCache.get())).toHaveLength(1);

    await expect(state.sendDelete(testUserFlat)).resolves.not.toThrow();

    expect(dashboardUserState.get()).toHaveLength(0);
    expect(Object.keys(dashboardUserDtoCache.get())).toHaveLength(0);
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

  it('Test convertRowDataToEditableData', async () => {
    dashboardUserApi.getAllDashboardUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    await state.fetchAndStoreData().promise;
    const editableData = await state.convertRowDataToEditableData(testUserFlat);
    expect(editableData).toEqual(testUserDto);
  });

  it('Test convertToDto', async () => {
    const result = state.convertToDto(testUserFlat);
    expect(result).toEqual(testUserDto);
  });

  it('Test createPrivilegesArr', () => {
    const result = state.createPrivilegesArr(testUserFlat);
    expect(result).toEqual(testUserPrivileges);
  });

  it('Test No privilege user', () => {
    const noPrivUser = {
      ...testUserFlat,
      hasDashboardAdmin: false,
      hasDashboardUser: false
    }
    const result = state.createPrivileges(noPrivUser);
    expect(result.size).toEqual(0);
  });

  it('Test Privilege not exist in state', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve({
        data: { data: [] },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });

    await accessPrivilegeState().fetchAndStorePrivileges().promise;

    const result = state.createPrivileges(testUserFlat);
    expect(result.size).toEqual(0);
  });
});
