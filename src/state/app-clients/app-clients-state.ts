import { createState, State, useState } from '@hookstate/core';
import { AppClientFlat } from './app-client-flat';
import Config from '../../api/configuration';
import { Configuration } from '../../openapi';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../openapi/apis/app-client-controller-api';
import AppClientsService from './app-clients-service';

const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<AppClientFlat[]>, appClientsApi: AppClientControllerApiInterface): AppClientsService => {
  return new AppClientsService(state, appClientsApi);
};

export const useAppClientsState = () => wrapState(useState(appClientsState), appClientsApi);