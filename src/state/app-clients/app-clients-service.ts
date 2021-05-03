import { none, State } from "@hookstate/core";
import { AxiosPromise } from "axios";
import { DataCrudFormErrors } from "../../components/DataCrudFormPage/data-crud-form-errors";
import { AppClientControllerApiInterface } from "../../openapi/apis/app-client-controller-api";
import { Privilege } from "../../openapi/models";
import { AppClientUserDetailsDto } from "../../openapi/models/app-client-user-details-dto";
import { AppClientUserDto } from "../../openapi/models/app-client-user-dto";
import { DataService } from "../data-service/data-service";
import { prepareDataCrudErrorResponse } from "../data-service/data-service-utils";
import { PrivilegeType } from "../privilege/privilege-type";
import { AppClientFlat } from "./app-client-flat";
import { AppClientPrivilege } from "./app-client-privilege";

export default class AppClientsService implements DataService<AppClientFlat, AppClientFlat> {
  constructor(public state: State<AppClientFlat[]>, private appClientsApi: AppClientControllerApiInterface) {

  }

  fetchAndStoreData(): Promise<AppClientFlat[]> {
    const response = (): AxiosPromise<AppClientUserDto[]> => this.appClientsApi.getAppClientUsers();
    const data = new Promise<AppClientFlat[]>(async (resolve, reject) => {
      try {
        const result = await response();
        resolve(this.convertAppClientsToFlat(result.data));
      } catch (err) {
        reject(prepareDataCrudErrorResponse(err));
      }
    });

    this.state.set(data);

    return data;
  }

  async getSelectedClient(id: string): Promise<AppClientUserDetailsDto> {
    const record = await this.appClientsApi.getAppClientRecord(id);
    return {...record.data};
  }

  async sendCreate(toCreate: AppClientFlat): Promise<AppClientFlat> {
    try {
      const createdResponse = await this.appClientsApi.createAppClientUser(await this.convertToDto(toCreate));
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

      const updatedResponse = await this.appClientsApi.updateAppClient(toUpdate.id, await this.convertToDto(toUpdate));
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

  async convertRowDataToEditableData(rowData: AppClientFlat): Promise<AppClientFlat> {
    const details = await this.getSelectedClient(rowData.id ?? "");
    const retVal : AppClientFlat = { 
      ...rowData, 
      appClientDeveloperEmails: details.appClientDeveloperEmails, 
      appEndpointPrivs: details.appEndpointPrivs 
    };

    return Promise.resolve(Object.assign({}, retVal));
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

  async convertToDto(client: AppClientFlat): Promise<AppClientUserDto> {
    return {
      id: client.id,
      name: client.name,
      privileges: await this.createAppPrivilegesArr(client),
      appClientDeveloperEmails: client.appClientDeveloperEmails,
    };
  }

  async createAppPrivilegesArr(client: AppClientFlat): Promise<Array<Privilege>> {
    return Array.from(await this.createAppPrivileges(client));
  }

  async createAppPrivileges(client: AppClientFlat): Promise<Set<Privilege>> {
    const privileges = new Set<Privilege>();
    const privilegeResponse = await this.appClientsApi.getClientTypePrivs();

    if (client.read) {
      const privilege = privilegeResponse.data.find(item => item.name === PrivilegeType.READ);
      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (client.write) {  
      const privilege = privilegeResponse.data.find(item => item.name === PrivilegeType.WRITE);
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
