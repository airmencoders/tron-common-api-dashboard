import { createState, State, useState } from '@hookstate/core';
import { globalOpenapiConfig } from '../../api/openapi-config';
import { ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../openapi';
import MyDigitizeAppsService from './my-digitize-apps-service';
import { ScratchStorageAppFlat } from './scratch-storage-app-flat';

const myDigitizeAppsState = createState<ScratchStorageAppFlat[]>(new Array<ScratchStorageAppFlat>());

const scratchStorageControllerApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapDigitizeAppsState = (state: State<ScratchStorageAppFlat[]>, scratchStorageApi: ScratchStorageControllerApiInterface) => {
  return new MyDigitizeAppsService(state, scratchStorageApi);
}

export const useMyDigitizeAppsState = () => wrapDigitizeAppsState(useState(myDigitizeAppsState), scratchStorageControllerApi);