import { createState, State, useState } from '@hookstate/core';
import { AppClientsApi } from '../../api/app-clients/app-clients-api';
import { AppClient } from '../../api/app-clients/interface/app-client';
import { AppClientFlat } from '../../api/app-clients/interface/app-client-flat';
import { ClientPrivilege } from '../../api/app-clients/interface/client-privilege';
import { PrivilegeType } from '../../api/app-clients/interface/privilege-type';
import AppClientsService from './interface/app-clients-service';

export interface AppClientsState {
  error?: string,
  clients: AppClientFlat[]
}

const appClientsState = createState<AppClientFlat[]>(
  new Promise<AppClientFlat[]>(resolve => resolve(new Array<AppClientFlat>()))
);

const appClientsApi: AppClientsApi = new AppClientsApi();

export const wrapState = (state: State<AppClientFlat[]>, appClientsApi: AppClientsApi): AppClientsService => {
  return ({
    fetchAndStoreAppClients() {
      const response = () => appClientsApi.getAppClients();
      const data = new Promise<AppClientFlat[]>(resolve => resolve(response().then(r => this.convertAppClientsToFlat(r.data))));
      state.set(data);

      return data;
    },
    convertAppClientsToFlat(clients: AppClient[]) {
      return clients.map(client => {
        const { id, name } = client;

        const privileges: ClientPrivilege = {
          read: client.privileges?.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
          write: client.privileges?.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
          dashboard_user: client.privileges?.find(privilege => privilege.name === PrivilegeType.DASHBOARD_USER) ? true : false,
          dashboard_admin: client.privileges?.find(privilege => privilege.name === PrivilegeType.DASHBOARD_ADMIN) ? true : false
        };

        return {
          id,
          name,
          ...privileges
        };
      });
    },
    get isPromised(): boolean {
      return state.promised;
    },
    get appClients(): State<AppClientFlat[]> {
      return state;
    },
    get error(): any {
      return state.error;
    }
  })
};

export const accessAppClientsState = () => wrapState(appClientsState, appClientsApi);
export const useAppClientsState = () => wrapState(useState(appClientsState), appClientsApi);