import { createState, State, useState } from '@hookstate/core';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto, Configuration } from '../../openapi';
import Config from '../../api/configuration';
import AppSourceService from './app-source-service';


const appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
const appSourceApi = new AppSourceControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppSourceState = (state: State<AppSourceDto[]>, appSourceApi: AppSourceControllerApiInterface): AppSourceService => {
  return new AppSourceService(state, appSourceApi);
}

export const useAppSourceState = (): AppSourceService => wrapAppSourceState(useState(appSourceState), appSourceApi);
