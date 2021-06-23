import { createState, State, useState } from '@hookstate/core';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto, Configuration } from '../../openapi';
import Config from '../../api/config';
import AppSourceService from './app-source-service';


const appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
const appSourceApi = new AppSourceControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppSourceState = (state: State<AppSourceDto[]>, api: AppSourceControllerApiInterface): AppSourceService => {
  return new AppSourceService(state, api);
}

export const useAppSourceState = (): AppSourceService => wrapAppSourceState(useState(appSourceState), appSourceApi);
