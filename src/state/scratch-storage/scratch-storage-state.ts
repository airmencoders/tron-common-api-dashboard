import {createState, State, useState} from '@hookstate/core';
import {Configuration, ScratchStorageControllerApi, ScratchStorageControllerApiInterface} from '../../openapi';
import Config from '../../api/config';
import ScratchStorageService from './scratch-storage-service';
import { PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageEntryDto } from '../../openapi/models';
import { ScratchStorageFlat } from './scratch-storage-flat';

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
const scratchStoragePrivilegesState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const scratchStorageKeysToCreateUpdateState = createState<ScratchStorageEntryDto[]>(new Array<ScratchStorageEntryDto>());
const scratchStorageKeysToDeleteState = createState<string[]>(new Array<string>());

// this holds the selected app we're editing/updating
const selectedScratchStorageGlobalState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);

const scratchStorageControllerApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  state: State<ScratchStorageAppRegistryDto[]>, 
  selectedScratchStorageState: State<ScratchStorageFlat>,
  scratchStorageApi: ScratchStorageControllerApiInterface,
  privilegeState: State<PrivilegeDto[]>,
  createUpdateState: State<ScratchStorageEntryDto[]>,
  deleteState: State<string[]>) => {
    return new ScratchStorageService(state, 
      selectedScratchStorageState, 
      scratchStorageApi, 
      privilegeState,
      createUpdateState, 
      deleteState);
}

export const useScratchStorageState = () => wrapState(
  useState(scratchStorageState),
  useState(selectedScratchStorageGlobalState),
  scratchStorageControllerApi,
  useState(scratchStoragePrivilegesState),
  useState(scratchStorageKeysToCreateUpdateState),
  useState(scratchStorageKeysToDeleteState));
