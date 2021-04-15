import { createState, State, useState } from '@hookstate/core';
import { Configuration } from '../../openapi';
import Config from '../../api/configuration';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import AuthorizedUserService from './authorized-user-service';

const authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
const authorizedUserApi = new DashboardUserControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAuthorizedUserState = (state: State<DashboardUserDto | undefined>, dashboardUserApi: DashboardUserControllerApiInterface): AuthorizedUserService => {
  return new AuthorizedUserService(state, dashboardUserApi);
}

export const useAuthorizedUserState = (): AuthorizedUserService => wrapAuthorizedUserState(useState(authorizedUserState), authorizedUserApi);

export const accessAuthorizedUserState = (): AuthorizedUserService => wrapAuthorizedUserState(authorizedUserState, authorizedUserApi);
