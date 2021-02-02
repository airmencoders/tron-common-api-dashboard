import { createState, State, useState } from '@hookstate/core';
import { AppClientsApi } from '../../api/app-clients/app-clients-api';
import { AppClient } from '../../api/app-clients/interface/app-client';
import { AppClientFlat } from '../../api/app-clients/interface/app-client-flat';
import { ClientPrivilege } from '../../api/app-clients/interface/client-privilege';
import { PrivilegeType } from '../../api/app-clients/interface/privilege-type';
import AppClientsService from './interface/app-clients-service';

export interface AppClientsState {
  error?: string,
  clients?: AppClientFlat[]
}

const appClientsState = createState<AppClientsState | undefined>(undefined);
const appClientsApi: AppClientsApi = new AppClientsApi();

export const wrapState = (state: State<AppClientsState | undefined>, appClientsApi: AppClientsApi): AppClientsService => {
  return ({
    fetchAndStoreAppClients() {
      const response = () => appClientsApi.getAppClients();

      state.set(response()
        .then(response => {
          return {
            error: undefined,
            clients: this.convertAppClientsToFlat(response.data)
          };
        })
        .catch(error => {
          return {
            error: error.message,
            clients: undefined
          };
        })
      );
    },
    convertAppClientsToFlat(clients: AppClient[]) {
      return clients.map(client => {
        const { id, name, nameAsLower } = client;

        const privileges: ClientPrivilege = {
          read: client.privileges?.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
          write: client.privileges?.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
          dashboard: client.privileges?.find(privilege => privilege.name === PrivilegeType.DASHBOARD) ? true : false
        };

        return {
          id,
          name,
          nameAsLower,
          ...privileges
        };
      });
    },
    get isPromised(): boolean {
      return state.promised;
    },
    get appClients(): AppClient[] | undefined {
      return state.promised ? undefined : state.get()?.clients;
    },
    get error(): string | undefined {
      return state.promised ? undefined : state.get()?.error;
    }
  })
};

export const accessAppClientsState = () => wrapState(appClientsState, appClientsApi);
export const useAppClientsState = () => wrapState(useState(appClientsState), appClientsApi);