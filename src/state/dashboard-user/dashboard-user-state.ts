import { createState, State, useState } from '@hookstate/core';
import {Configuration, DashboardUserDto} from '../../openapi';
import Config from '../../api/config';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import DashboardUserService from './dashboard-user-service';
import { DashboardUserFlat } from './dashboard-user-flat';


const dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());
// cache of dashboard user dtos and ids
const dashboardUserDtoCache = createState<Record<string, DashboardUserDto>>({});
const dashboardUserControllerApi = new DashboardUserControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapDashboardUserState = (state: State<DashboardUserFlat[]>,
                                       dashboardUserApi: DashboardUserControllerApiInterface,
                                       dashboardUserDtoCache: State<Record<string, DashboardUserDto>>):
    DashboardUserService => {
  return new DashboardUserService(state, dashboardUserApi, dashboardUserDtoCache);
}

export const useDashboardUserState = (): DashboardUserService => wrapDashboardUserState(useState(dashboardUserState),
    dashboardUserControllerApi, useState(dashboardUserDtoCache));
