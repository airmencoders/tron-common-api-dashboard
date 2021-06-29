import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import DashboardUserPage from '../DashboardUserPage';
import { DashboardUserFlat } from '../../../state/dashboard-user/dashboard-user-flat';
import {
  Configuration,
  DashboardUserControllerApi,
  DashboardUserControllerApiInterface,
  DashboardUserDto,
  PrivilegeControllerApi,
  PrivilegeControllerApiInterface,
  PrivilegeDto,
  PrivilegeDtoResponseWrapper
} from '../../../openapi';
import { useDashboardUserState } from '../../../state/dashboard-user/dashboard-user-state';
import DashboardUserService from '../../../state/dashboard-user/dashboard-user-service';
import Config from '../../../api/configuration';
import { usePrivilegeState } from '../../../state/privilege/privilege-state';
import PrivilegeService from '../../../state/privilege/privilege-service';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../../../state/privilege/privilege-type';

jest.mock('../../../state/dashboard-user/dashboard-user-state');
jest.mock('../../../state/privilege/privilege-state');

describe('Test Dashboard User Page', () => {
  const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
  const privilegeApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));

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

  function mockPrivilegesState() {
    (usePrivilegeState as jest.Mock).mockReturnValue(new PrivilegeService(privilegeState, privilegeApi));
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

  const initialDashboardUserState: DashboardUserFlat[] = [
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

  let dashboardUserState: State<DashboardUserFlat[]> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApiInterface;
  let dashboardUserDtoCache: State<Record<string, DashboardUserDto>> & StateMethodsDestroy;

  beforeEach(() => {
    dashboardUserState = createState<DashboardUserFlat[]>([...initialDashboardUserState]);
    dashboardUserApi = new DashboardUserControllerApi();
    dashboardUserDtoCache = createState<Record<string, DashboardUserDto>>({});

    mockPrivilegesState();
  });

  it('Test Loading Page', async () => {
    function mockDashboardUserState() {
      (useDashboardUserState as jest.Mock).mockReturnValue(new DashboardUserService(dashboardUserState,
          dashboardUserApi, dashboardUserDtoCache));

      jest.spyOn(useDashboardUserState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockDashboardUserState();

    const page = render(
      <MemoryRouter>
        <DashboardUserPage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });
})
