import { createState, State, useState } from '@hookstate/core';
import { AppClientFlat } from './app-client-flat';
import Config from '../../api/config';
import { Configuration, PrivilegeDto } from '../../openapi';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../openapi/apis/app-client-controller-api';
import AppClientsService from './app-clients-service';

const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
const appClientsPrivileges = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<AppClientFlat[]>, appClientsApi: AppClientControllerApiInterface, privilegesState: State<PrivilegeDto[]>): AppClientsService => {
  return new AppClientsService(state, appClientsApi, privilegesState);
};

export const useAppClientsState = () => wrapState(useState(appClientsState), appClientsApi, useState(appClientsPrivileges));

export const accessAppClientsState = () => wrapState(appClientsState, appClientsApi, appClientsPrivileges);