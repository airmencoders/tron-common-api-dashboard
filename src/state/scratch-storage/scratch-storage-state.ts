import {createState, State, useState} from '@hookstate/core';
import {Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface} from '../../openapi';
import Config from '../../api/config';
import ScratchStorageService from './scratch-storage-service';
import { PrivilegeDto, ScratchStorageAppRegistryDto } from '../../openapi/models';
import { ScratchStorageFlat } from './scratch-storage-flat';

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
const scratchStoragePrivilegesState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());

// this holds the selected app we're editing/updating
const selectedScratchStorageGlobalState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);

const scratchStorageControllerApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  state: State<ScratchStorageAppRegistryDto[]>, 
  selectedScratchStorageState: State<ScratchStorageFlat>,
  scratchStorageApi: ScratchStorageControllerApiInterface,
  privilegeState: State<PrivilegeDto[]>) => {
  return new ScratchStorageService(state, selectedScratchStorageState, scratchStorageApi, privilegeState);
}

export const useScratchStorageState = () => wrapState(
  useState(scratchStorageState),
  useState(selectedScratchStorageGlobalState),
  scratchStorageControllerApi,
  useState(scratchStoragePrivilegesState));
