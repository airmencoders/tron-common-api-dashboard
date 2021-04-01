import { none, State } from "@hookstate/core";
import { AppClientFlat } from "./app-client-flat";
import { AppClientPrivilege } from "./app-client-privilege";
import { PrivilegeType } from "../privilege/privilege-type";
import { AppClientControllerApiInterface } from "../../openapi/apis/app-client-controller-api";
import { AppClientUserDto } from "../../openapi/models/app-client-user-dto";
import { AxiosPromise } from "axios";
import { Privilege, PrivilegeDto } from "../../openapi/models";
import { accessPrivilegeState } from "../privilege/privilege-state";
import { DataService } from "../data-service/data-service";
import { DataCrudFormErrors } from "../../components/DataCrudFormPage/data-crud-form-errors";
import { prepareDataCrudErrorResponse } from "../data-service/data-service-utils";

export default class AppClientsService implements DataService<AppClientFlat, AppClientFlat> {
  constructor(public state: State<AppClientFlat[]>, private appClientsApi: AppClientControllerApiInterface) { }

  fetchAndStoreData(): Promise<AppClientFlat[]> {
    const response = (): AxiosPromise<AppClientUserDto[]> => this.appClientsApi.getAppClientUsers();
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();

    const data = new Promise<AppClientFlat[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        const result = await response();

        resolve(this.convertAppClientsToFlat(result.data));
      } catch (err) {
        reject(prepareDataCrudErrorResponse(err));
      }
    });

    this.state.set(data);

    return data;
  }

  async sendCreate(toCreate: AppClientFlat): Promise<AppClientFlat> {
    try {
      const appClientDto = this.convertToDto(toCreate);
      const createdResponse = await this.appClientsApi.createAppClientUser(appClientDto);
      const createdAppClientFlat = this.convertToFlat(createdResponse.data);

      this.state[this.state.length].set(createdAppClientFlat);

      return Promise.resolve(createdAppClientFlat);
    }
    catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  async sendUpdate(toUpdate: AppClientFlat): Promise<AppClientFlat> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('App Client to update has undefined id.'));
      }
      const appClientDto = this.convertToDto(toUpdate);
      const updatedResponse = await this.appClientsApi.updateAppClient(toUpdate.id, appClientDto);
      const updatedAppClientFlat = this.convertToFlat(updatedResponse.data);

      const index = this.state.get().findIndex(item => item.id === updatedAppClientFlat.id);
      this.state[index].set(updatedAppClientFlat);

      return Promise.resolve(updatedAppClientFlat);
    }
    catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  async sendDelete(toDelete: AppClientFlat): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('App Client to delete has undefined id.');
      }

      await this.appClientsApi.deleteAppClient(toDelete.id);

      const item = this.state.find(item => item.id.get() === toDelete.id);
      if (item)
        item.set(none);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  convertRowDataToEditableData(rowData: AppClientFlat): Promise<AppClientFlat> {
    return Promise.resolve(rowData);
  }

  convertAppClientsToFlat(clients: AppClientUserDto[]): AppClientFlat[] {
    return clients.map(client => {
      return this.convertToFlat(client);
    });
  }

  convertToFlat(client: AppClientUserDto): AppClientFlat {
    const { id, name } = client;

    const privilegeArr = Array.from(client.privileges || []);

    const privileges: AppClientPrivilege = {
      read: privilegeArr.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
      write: privilegeArr.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
    };

    return {
      id,
      name: name || '',
      ...privileges
    };
  }

  convertToDto(client: AppClientFlat): AppClientUserDto {
    return {
      id: client.id,
      name: client.name,
      privileges: this.createAppPrivilegesArr(client)
    };
  }

  createAppPrivilegesArr(client: AppClientFlat): Array<Privilege> {
    return Array.from(this.createAppPrivileges(client));
  }

  createAppPrivileges(client: AppClientFlat): Set<Privilege> {
    const privileges = new Set<Privilege>();

    if (client.read) {
      const privilege = accessPrivilegeState().createPrivilegeFromType(PrivilegeType.READ);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (client.write) {
      const privilege = accessPrivilegeState().createPrivilegeFromType(PrivilegeType.WRITE);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    return privileges;
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get appClients(): AppClientFlat[] {
    return !this.isStateReady() ? new Array<AppClientFlat>() : this.state.get();
  }

  get error(): string | DataCrudFormErrors | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
