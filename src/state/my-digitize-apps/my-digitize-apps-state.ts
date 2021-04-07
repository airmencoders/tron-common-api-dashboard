import { createState, State, useState } from '@hookstate/core';
import { Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../openapi';
import Config from '../../api/configuration';
import MyDigitizeAppsService from './my-digitize-apps-service';
import { ScratchStorageAppFlat } from './scratch-storage-app-flat';

const myDigitizeAppsState = createState<ScratchStorageAppFlat[]>(new Array<ScratchStorageAppFlat>());

const scratchStorageApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapDigitizeAppsState = (state: State<ScratchStorageAppFlat[]>, scratchStorageApi: ScratchStorageControllerApiInterface) => {
  return new MyDigitizeAppsService(state, scratchStorageApi);
}

export const useMyDigitizeAppsState = () => wrapDigitizeAppsState(useState(myDigitizeAppsState), scratchStorageApi);