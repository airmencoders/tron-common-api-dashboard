import { createState, State, useState } from '@hookstate/core';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto, Configuration } from '../../openapi';
import Config from '../../api/configuration';
import AppSourceService from './app-source-service';


const dashboardUserState = createState<AppSourceDto[]>(new Array<AppSourceDto>());

export const wrapAppSourceState = (state: State<AppSourceDto[]>, appSourceApi: AppSourceControllerApiInterface): AppSourceService => {
  return new AppSourceService(state, appSourceApi);
}

export const useAppSourceState = (): AppSourceService => wrapAppSourceState(useState(dashboardUserState),
  new AppSourceControllerApi(new Configuration({
    basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
  })));
