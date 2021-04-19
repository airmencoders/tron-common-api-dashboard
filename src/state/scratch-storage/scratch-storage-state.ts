import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import ScratchStorageService from './scratch-storage-service';
import { ScratchStorageFlat } from './scratch-storage-flat';

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());

// this holds the selected app we're editing/updating
const selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);

const scratchStorageApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  state: State<ScratchStorageAppRegistryDto[]>, 
  selectedScratchStorageState: State<ScratchStorageFlat>,
  scratchStorageApi: ScratchStorageControllerApiInterface) => {
  return new ScratchStorageService(state, selectedScratchStorageState, scratchStorageApi);
}

export const useScratchStorageState = () => wrapState(
  useState(scratchStorageState),
  useState(selectedScratchStorageState),
  scratchStorageApi);