import { createState, State, useState } from '@hookstate/core';
import { Configuration } from '../../openapi';
import Config from '../../api/configuration';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import DashboardUserService from './dashboard-user-service';

const dashboardUserState = createState<DashboardUserDto | undefined>(undefined);

export const wrapState = (state: State<DashboardUserDto | undefined>, dashboardUserApi: DashboardUserControllerApiInterface): DashboardUserService => {
  return new DashboardUserService(state, dashboardUserApi);
}

export const useDashboardUserState = (): DashboardUserService => wrapState(useState(dashboardUserState),
  new DashboardUserControllerApi(new Configuration({
    basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
  })));
