import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import DashboardUserPage from '../DashboardUserPage';
import { DashboardUserFlat } from '../../../state/dashboard-user/dashboard-user-flat';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../../openapi';
import { useDashboardUserState } from '../../../state/dashboard-user/dashboard-user-state';
import DashboardUserService from '../../../state/dashboard-user/dashboard-user-service';

jest.mock('../../../state/dashboard-user/dashboard-user-state');

describe('Test Dashboard User Page', () => {
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

  beforeEach(() => {
    dashboardUserState = createState<DashboardUserFlat[]>([...initialDashboardUserState]);
    dashboardUserApi = new DashboardUserControllerApi();
  });

  it('Test Loading Page', async () => {
    function mockDashboardUserState() {
      (useDashboardUserState as jest.Mock).mockReturnValue(new DashboardUserService(dashboardUserState, dashboardUserApi));

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
