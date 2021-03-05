import { createState, State, useState } from '@hookstate/core';
import { Configuration } from '../../openapi';
import Config from '../../api/configuration';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import DashboardUserService from './dashboard-user-service';
import { DashboardUserFlat } from './dashboard-user-flat';


const dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());

export const wrapDashboardUserState = (state: State<DashboardUserFlat[]>, dashboardUserApi: DashboardUserControllerApiInterface): DashboardUserService => {
  return new DashboardUserService(state, dashboardUserApi);
}

export const useDashboardUserState = (): DashboardUserService => wrapDashboardUserState(useState(dashboardUserState),
  new DashboardUserControllerApi(new Configuration({
    basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
  })));
