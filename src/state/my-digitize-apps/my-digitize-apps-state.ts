import { createState, State, useState } from '@hookstate/core';
import { Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../openapi';
import Config from '../../api/config';
import MyDigitizeAppsService from './my-digitize-apps-service';
import { ScratchStorageAppFlat } from './scratch-storage-app-flat';
import { openapiAxiosInstance } from '../../api/openapi-axios';

const myDigitizeAppsState = createState<ScratchStorageAppFlat[]>(new Array<ScratchStorageAppFlat>());

const scratchStorageControllerApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }), '', openapiAxiosInstance
);

export const wrapDigitizeAppsState = (state: State<ScratchStorageAppFlat[]>, scratchStorageApi: ScratchStorageControllerApiInterface) => {
  return new MyDigitizeAppsService(state, scratchStorageApi);
}

export const useMyDigitizeAppsState = () => wrapDigitizeAppsState(useState(myDigitizeAppsState), scratchStorageControllerApi);