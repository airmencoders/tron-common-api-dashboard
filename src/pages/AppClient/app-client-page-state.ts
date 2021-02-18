import {AppClientFormActionType} from './AppClientFormActionType';
import {AppClientFlat} from '../../state/app-clients/interface/app-client-flat';
import {createState, useState} from '@hookstate/core';

export interface AppClientPageState {
  isOpen: boolean,
  formAction?: AppClientFormActionType,
  client?: AppClientFlat
}

const appClientPageState = createState<AppClientPageState>({
  isOpen: false,
  formAction: undefined,
  client: undefined
});

export const useAppClientPageState = () => useState(appClientPageState);
