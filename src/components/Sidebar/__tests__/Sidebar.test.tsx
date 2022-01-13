import React from 'react';
import { render } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { MemoryRouter } from 'react-router-dom';
import { RouteItem } from '../../../routes';
import HealthPage from '../../../pages/Health/HealthPage';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import PersonPage from '../../../pages/Person/PersonPage';
import {AppVersionInfoDto, DashboardUserDto} from '../../../openapi/models';
import {AxiosResponse} from 'axios';
import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {AppVersionControllerApi, DashboardUserControllerApi} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import AppInfoService from '../../../state/app-info/app-info-service';
import {useAuthorizedUserState} from '../../../state/authorized-user/authorized-user-state';
import {useAppVersionState} from '../../../state/app-info/app-info-state';

const testRoutes: RouteItem[] = [
  {
    path: '/health',
    name: 'Health',
    component: HealthPage,
    requiredPrivileges: [PrivilegeType.DASHBOARD_USER]
  },
  {
    path: "/person",
    name: "Person",
    component: PersonPage,
    requiredPrivileges: [PrivilegeType.DASHBOARD_ADMIN]
  }
];

const fullPrivilegeUser: DashboardUserDto = {
  id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
  email: 'test@person.com',
  privileges: [
    {
      'id': 1,
      'name': PrivilegeType.DASHBOARD_ADMIN
    },
    {
      'id': 2,
      'name': PrivilegeType.DASHBOARD_USER
    }
  ]
};

const getSelfDashboardUserResponse: AxiosResponse = {
  data: fullPrivilegeUser,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

function createRenderElem(routes: RouteItem[]) {
  return (
    <MemoryRouter>
      <Sidebar items={routes} />
    </MemoryRouter>
  );
}

jest.mock('../../../state/authorized-user/authorized-user-state');
jest.mock('../../../state/app-info/app-info-state');

describe('Sidebar', () => {
  function mockAuthorizedUserState() {
    let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy = createState<DashboardUserDto | undefined>(undefined);
    let dashboardUserApi: DashboardUserControllerApi = new DashboardUserControllerApi();
    (useAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return Promise.resolve(getSelfDashboardUserResponse);
    });
  }

  function mockAppInfoState(enclave: string) {
    let appInfoState: State<AppVersionInfoDto> & StateMethodsDestroy = createState<AppVersionInfoDto>({ enclave: '', environment: '', version: '' } as AppVersionInfoDto);
    let appVersionApi: AppVersionControllerApi = new AppVersionControllerApi();
    (useAppVersionState as jest.Mock).mockReturnValue(new AppInfoService(appInfoState, appVersionApi));
    appVersionApi.getVersion = jest.fn(() => {
      return Promise.resolve({ 
        data: { enclave: enclave, environment: '', version: '' },
        status: 200,
        statusText: 'OK',
        config: {},
        headers: {}
      });
    });
  }

  it('Renders', async () => {
    mockAuthorizedUserState();
    mockAppInfoState('IL2');
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    const pageRender = render(
      createRenderElem(testRoutes)
    );

    const elem = pageRender.getByTestId('sidebar');

    expect(elem).toBeInTheDocument();
  });

  it('Does not show document space for IL2', async () => {
    mockAuthorizedUserState();
    mockAppInfoState('IL2');
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    const pageRender = render(
      createRenderElem(testRoutes)
    );

    testRoutes.forEach((item) => {
      if (item.name === 'Document Space') {
        expect(pageRender.getByText(item.name)).not.toBeInTheDocument();
      } else {
        expect(pageRender.getByText(item.name)).toBeInTheDocument();
      }
    });
  });

  it('Renders all items (admin & user privilege)', async () => {
    mockAuthorizedUserState();
    mockAppInfoState('IL4');
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    const pageRender = render(
      createRenderElem(testRoutes)
    );

    testRoutes.forEach((item) => {
      expect(pageRender.getByText(item.name)).toBeInTheDocument();
    });
  });
});
