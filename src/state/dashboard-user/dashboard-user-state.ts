import { createState, State, useState } from '@hookstate/core';
import { Configuration } from '../../openapi';
import Config from '../../api/config';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import DashboardUserService from './dashboard-user-service';
import { DashboardUserFlat } from './dashboard-user-flat';


const dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());
const dashboardUserControllerApi = new DashboardUserControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapDashboardUserState = (state: State<DashboardUserFlat[]>, dashboardUserApi: DashboardUserControllerApiInterface): DashboardUserService => {
  return new DashboardUserService(state, dashboardUserApi);
}

export const useDashboardUserState = (): DashboardUserService => wrapDashboardUserState(useState(dashboardUserState), dashboardUserControllerApi);
