import { createState, State, useState } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApi, DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import AuthorizedUserService from './authorized-user-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
const authorizedUserApi = new DashboardUserControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAuthorizedUserState = (state: State<DashboardUserDto | undefined>, dashboardUserApi: DashboardUserControllerApiInterface): AuthorizedUserService => {
  return new AuthorizedUserService(state, dashboardUserApi);
}

export const useAuthorizedUserState = (): AuthorizedUserService => wrapAuthorizedUserState(useState(authorizedUserState), authorizedUserApi);

export const accessAuthorizedUserState = (): AuthorizedUserService => wrapAuthorizedUserState(authorizedUserState, authorizedUserApi);
