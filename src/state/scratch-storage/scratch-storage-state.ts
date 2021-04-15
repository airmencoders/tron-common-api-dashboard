import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import ScratchStorageService from './scratch-storage-service';
import { ScratchStorageFlat } from './scratch-storage-flat';

// export interface ScratchStorageDetailsFlat {
//   id?: string;
//   appName: string;
//   HasImplicitRead: boolean;
//   userPrivs?: Array<ScratchStorageUserWithPrivsFlat>;
// }

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());

// this holds the selected org we're editing/updating
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

// export const accessScratchStorageState = () => wrapState(scratchStorageState, scratchStorageApi);