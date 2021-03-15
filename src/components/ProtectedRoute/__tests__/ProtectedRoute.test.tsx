import { render } from '@testing-library/react';
import { PrivilegeType } from '../../../state/app-clients/interface/privilege-type';
import { DashboardUserDto } from '../../../openapi/models/dashboard-user-dto';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { DashboardUserControllerApi } from '../../../openapi/apis/dashboard-user-controller-api';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import { AxiosResponse } from 'axios';
import ProtectedRoute from '../ProtectedRoute';
import { MemoryRouter } from 'react-router-dom';

const adminPrivilegeUser: DashboardUserDto = {
  id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
  email: 'test@person.com',
  privileges: [
    {
      'id': 2,
      'name': PrivilegeType.DASHBOARD_ADMIN
    }
  ]
};

const getAdminPrivilegeUserResponse: AxiosResponse = {
  data: adminPrivilegeUser,
  status: 200,
  statusText: 'OK',
  config: {},
  headers: {}
};

jest.mock('../../../state/authorized-user/authorized-user-state');

describe('ProtectRoute Test', () => {
  function mockAuthorizedUserState() {
    let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy = createState<DashboardUserDto | undefined>(undefined);
    let dashboardUserApi: DashboardUserControllerApi = new DashboardUserControllerApi();
    (useAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));
    dashboardUserApi.getSelfDashboardUser = jest.fn(() => {
      return Promise.resolve(getAdminPrivilegeUserResponse);
    });
  }

  const TestComponent = () => {
    return (
      <div data-testid="test-protected-route">
        <div>Rendered</div>
      </div>
    )
  }

  it('Renders', async () => {
    mockAuthorizedUserState();
    await useAuthorizedUserState().fetchAndStoreAuthorizedUser();

    let pageRender = render(
      <MemoryRouter>
        <ProtectedRoute component={TestComponent} requiredPrivilege={PrivilegeType.DASHBOARD_ADMIN} />
      </MemoryRouter>
    );
    expect(pageRender.getByTestId('test-protected-route')).toBeInTheDocument();

    pageRender = render(
      <MemoryRouter>
        <ProtectedRoute component={TestComponent} requiredPrivilege={PrivilegeType.DASHBOARD_USER} />
      </MemoryRouter>
    );
    expect(pageRender.getByText('Not Authorized')).toBeInTheDocument();
  });
});