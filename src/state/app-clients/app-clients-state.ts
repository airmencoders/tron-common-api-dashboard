import { createState, State, useState } from '@hookstate/core';
import { AppClientFlat } from './app-client-flat';
import { PrivilegeDto } from '../../openapi';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../openapi/apis/app-client-controller-api';
import AppClientsService from './app-clients-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
const appClientsPrivileges = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<AppClientFlat[]>, appClientApi: AppClientControllerApiInterface, privilegesState: State<PrivilegeDto[]>): AppClientsService => {
  return new AppClientsService(state, appClientApi, privilegesState);
};

export const useAppClientsState = () => wrapState(useState(appClientsState), appClientsApi, useState(appClientsPrivileges));

export const accessAppClientsState = () => wrapState(appClientsState, appClientsApi, appClientsPrivileges);