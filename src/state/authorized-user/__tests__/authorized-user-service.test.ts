import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { DashboardUserDto } from '../../../openapi/models/dashboard-user-dto';
import { PrivilegeType } from '../../privilege/privilege-type';
import { DashboardUserControllerApi } from '../../../openapi/apis/dashboard-user-controller-api';
import AuthorizedUserService from '../authorized-user-service';
import { wrapAuthorizedUserState } from '../authorized-user-state';

describe('Authorized User Service Test', () => {
  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let state: AuthorizedUserService;

  const user: DashboardUserDto = {
    id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
    email: "test@person.com",
    privileges: [
      {
        "id": 1,
        "name": PrivilegeType.DASHBOARD_ADMIN
      },
      {
        "id": 2,
        "name": PrivilegeType.DASHBOARD_USER
      }
    ]
  };

  const axiosGetResponse: AxiosResponse = {
    data: user,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const rejectMsg = 'Rejected';

  function mockGetSelfDashboardUser() {
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      // return new Promise<AxiosResponse<DashboardUserDto>>(resolve => resolve(axiosGetResponse));
      return Promise.resolve(axiosGetResponse);
    });
  }

  function mockGetSelfDashboardUserDelay() {
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });
  }

  function mockGetSelfDashboardUserReject() {
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return Promise.reject(rejectMsg);
    });
  }

  function mockGetSelfDashboardUserRejectDelay() {
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return new Promise<AxiosResponse<DashboardUserDto>>((resolve, reject) => setTimeout(() => reject(rejectMsg), 1000));
    });
  }

  beforeEach(() => {
    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    state = wrapAuthorizedUserState(authorizedUserState, dashboardUserApi);
  });

  afterEach(() => {
    authorizedUserState.destroy();
  });

  it('Test fetchAndStoreDashboardUser', async () => {
    mockGetSelfDashboardUser();

    await state.fetchAndStoreAuthorizedUser();

    expect(state.authorizedUser).toEqual(user);
  });

  it('Test authorizedUserHasPrivilege', async () => {
    mockGetSelfDashboardUserDelay();

    const fetch = state.fetchAndStoreAuthorizedUser();
    expect(state.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)).toEqual(undefined);

    await fetch;
    expect(state.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)).toEqual(true);

  });

  it('Test authorizedUser', async () => {
    mockGetSelfDashboardUserReject();
    await expect(state.fetchAndStoreAuthorizedUser()).rejects.toEqual(rejectMsg);
    expect(state.error).toBeTruthy();
    expect(state.authorizedUser).toEqual(undefined);

    mockGetSelfDashboardUser();
    await state.fetchAndStoreAuthorizedUser();
    expect(state.error).toBeFalsy();
    expect(state.authorizedUser).toEqual(user);
  });

  it('Test error', async () => {
    mockGetSelfDashboardUserRejectDelay();

    const fetch = state.fetchAndStoreAuthorizedUser();
    expect(state.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(rejectMsg);
    expect(state.error).toBe(rejectMsg);
  });

  it('Test promised', async () => {
    mockGetSelfDashboardUserDelay();

    expect(state.isPromised).toBeFalsy();
    state.fetchAndStoreAuthorizedUser();
    expect(state.isPromised).toBeTruthy();
  });
});