import { createState, State, useState } from '@hookstate/core';
import { AppVersionControllerApi, AppVersionInfoDto, AppVersionControllerApiInterface, Configuration } from '../../openapi';
import Config from '../../api/config';
import AppInfoService from './app-info-service';


const appInfoState = createState<AppVersionInfoDto>({ enclave: '', environment: '', version: '' } as AppVersionInfoDto);
const appInfoApi = new AppVersionControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppVersionState = (state: State<AppVersionInfoDto>, api: AppVersionControllerApiInterface): AppInfoService => {
  return new AppInfoService(state, api);
}

export const useAppVersionState = (): AppInfoService => wrapAppVersionState(useState(appInfoState), appInfoApi);