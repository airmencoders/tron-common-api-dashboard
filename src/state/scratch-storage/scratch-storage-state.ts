import {createState, State, useState} from '@hookstate/core';
import { ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../openapi';
import ScratchStorageService from './scratch-storage-service';
import { PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageEntryDto } from '../../openapi/models';
import { ScratchStorageFlat } from './scratch-storage-flat';
import { globalOpenapiConfig } from '../../api/openapi-config';

const scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
const scratchStoragePrivilegesState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const scratchStorageKeysToCreateUpdateState = createState<ScratchStorageEntryDto[]>(new Array<ScratchStorageEntryDto>());
const scratchStorageKeysToDeleteState = createState<string[]>(new Array<string>());

// this holds the selected app we're editing/updating
const selectedScratchStorageGlobalState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);

const scratchStorageControllerApi: ScratchStorageControllerApiInterface = new ScratchStorageControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
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
