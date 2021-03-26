import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import ScratchStorageService from './scratch-storage-service';

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());

const scratchStorageApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<ScratchStorageAppRegistryDto[]>, scratchStorageApi: ScratchStorageControllerApiInterface) => {
  return new ScratchStorageService(state, scratchStorageApi);
}

export const useScratchStorageState = () => wrapState(useState(scratchStorageState), scratchStorageApi);

export const accessScratchStorageState = () => wrapState(scratchStorageState, scratchStorageApi);