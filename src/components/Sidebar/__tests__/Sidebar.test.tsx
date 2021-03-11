import React from 'react';
import { render } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { MemoryRouter } from 'react-router-dom';
import { RouteItem } from '../../../routes';
import HealthPage from '../../../pages/Health/HealthPage';
import {PrivilegeType} from '../../../state/app-clients/interface/privilege-type';
import PersonPage from '../../../pages/Person/PersonPage';
import {DashboardUserDto} from '../../../openapi/models';
import {AxiosResponse} from 'axios';
import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {DashboardUserControllerApi} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import {useAuthorizedUserState} from '../../../state/authorized-user/authorized-user-state';

const testRoutes: RouteItem[] = [
  {
    path: '/health',
    name: 'Health',
    component: HealthPage,
    requiredPrivilege: PrivilegeType.DASHBOARD_USER
  },
  {
    path: "/person",
    name: "Person",
    component: PersonPage,
    requiredPrivilege: PrivilegeType.DASHBOARD_ADMIN
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

describe('Sidebar', () => {
  function mockAuthorizedUserState() {
    let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy = createState<DashboardUserDto | undefined>(undefined);
    let dashboardUserApi: DashboardUserControllerApi = new DashboardUserControllerApi();
    (useAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return Promise.resolve(getSelfDashboardUserResponse);
    });
  }

  it('Renders', async () => {
    mockAuthorizedUserState();
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    const pageRender = render(
      createRenderElem(testRoutes)
    );

    const elem = pageRender.getByTestId('sidebar');

    expect(elem).toBeInTheDocument();
  });

  it('Renders all items (admin & user privilege)', async () => {
    mockAuthorizedUserState();
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    const pageRender = render(
      createRenderElem(testRoutes)
    );

    testRoutes.forEach((item) => {
      expect(pageRender.getByText(item.name)).toBeInTheDocument();
    });
  });
});
