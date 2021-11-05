import { createState, State, useState } from '@hookstate/core';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto } from '../../openapi';
import AppSourceService from './app-source-service';
import { globalOpenapiConfig } from '../../api/openapi-config';


const appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
const appSourceApi = new AppSourceControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAppSourceState = (state: State<AppSourceDto[]>, api: AppSourceControllerApiInterface): AppSourceService => {
  return new AppSourceService(state, api);
}

export const useAppSourceState = (): AppSourceService => wrapAppSourceState(useState(appSourceState), appSourceApi);
