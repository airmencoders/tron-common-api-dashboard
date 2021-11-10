import { createState, State, useState } from '@hookstate/core';
import { globalOpenapiConfig } from '../../api/openapi-config';
import { AppVersionControllerApi, AppVersionInfoDto, AppVersionControllerApiInterface } from '../../openapi';
import AppInfoService from './app-info-service';

const appInfoState = createState<AppVersionInfoDto>({ enclave: '', environment: '', version: '' } as AppVersionInfoDto);
const appInfoApi = new AppVersionControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAppVersionState = (state: State<AppVersionInfoDto>, api: AppVersionControllerApiInterface): AppInfoService => {
  return new AppInfoService(state, api);
}

export const useAppVersionState = (): AppInfoService => wrapAppVersionState(useState(appInfoState), appInfoApi);