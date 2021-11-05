import { createState, State, useState } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import DashboardUserService from './dashboard-user-service';
import { DashboardUserFlat } from './dashboard-user-flat';
import { globalOpenapiConfig } from '../../api/openapi-config';

const dashboardUserState = createState<DashboardUserFlat[]>(new Array<DashboardUserFlat>());
// cache of dashboard user dtos and ids
const dashboardUserDtoCache = createState<Record<string, DashboardUserDto>>({});
const dashboardUserControllerApi = new DashboardUserControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapDashboardUserState = (state: State<DashboardUserFlat[]>,
                                       dashboardUserApi: DashboardUserControllerApiInterface,
                                       dashboardUserDtoCacheState: State<Record<string, DashboardUserDto>>):
    DashboardUserService => {
  return new DashboardUserService(state, dashboardUserApi, dashboardUserDtoCacheState);
}

export const useDashboardUserState = (): DashboardUserService => wrapDashboardUserState(useState(dashboardUserState),
    dashboardUserControllerApi, useState(dashboardUserDtoCache));
