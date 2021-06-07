import {none, postpone, State} from "@hookstate/core";
import {DataCrudFormErrors} from "../../components/DataCrudFormPage/data-crud-form-errors";
import {AppClientControllerApiInterface} from "../../openapi/apis/app-client-controller-api";
import {PrivilegeDto} from "../../openapi/models";
import {AppClientUserDetailsDto} from "../../openapi/models/app-client-user-details-dto";
import {AppClientUserDto} from "../../openapi/models/app-client-user-dto";
import {DataService} from "../data-service/data-service";
import {prepareDataCrudErrorResponse} from "../data-service/data-service-utils";
import {PrivilegeType} from "../privilege/privilege-type";
import {AppClientFlat} from "./app-client-flat";
import {AppClientPrivilege} from "./app-client-privilege";
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';

/**
 * PII WARNING:
 * Models used by this service has the following PII fields
 * AppClientDto
 *  * appClientDeveloperEmails
 * AppClientFlat
 *  * appClientDeveloperEmails
 */
export default class AppClientsService implements DataService<AppClientFlat, AppClientFlat> {

  private readonly validate: ValidateFunction<AppClientUserDto>;

  constructor(public state: State<AppClientFlat[]>, private appClientsApi: AppClientControllerApiInterface) {
    this.validate = TypeValidation.validatorFor<AppClientUserDto>(ModelTypes.definitions.AppClientUserDto);
  }

  fetchAndStoreData(): Promise<AppClientFlat[]> {
    const data = new Promise<AppClientFlat[]>(async (resolve, reject) => {
      try {
        const result = await this.appClientsApi.getAppClientUsersWrapped();
        resolve(this.convertAppClientsToFlat(result.data.data));
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
      const appClientDto = await this.convertToDto(toCreate);
      if(!this.validate(appClientDto)) {
        throw TypeValidation.validationError('AppClientUserDto');
      }
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

      const appClientDto = await this.convertToDto(toUpdate);
      if(!this.validate(appClientDto)) {
        throw TypeValidation.validationError('AppClientUserDto');
      }
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

  async convertRowDataToEditableData(rowData: AppClientFlat): Promise<AppClientFlat> {
    const { id } = rowData;

    if (!id) {
      return Promise.reject(new Error('App Client ID must be defined.'));
    }

    try {
      const details = await this.getSelectedClient(id);
      const retVal: AppClientFlat = {
        ...rowData,
        appClientDeveloperEmails: details.appClientDeveloperEmails,
        appEndpointPrivs: details.appEndpointPrivs
      };

      return Promise.resolve(Object.assign({}, retVal));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  convertAppClientsToFlat(clients: AppClientUserDto[]): AppClientFlat[] {
    return clients.map(client => {
      return this.convertToFlat(client);
    });
  }

  convertToFlat(client: AppClientUserDto): AppClientFlat {
    const { id, name, clusterUrl } = client;

    const privilegeArr = Array.from(client.privileges || []);

    const privileges: AppClientPrivilege = {
      read: privilegeArr.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
      write: privilegeArr.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
    };

    return {
      id,
      name: name || '',
      clusterUrl: clusterUrl || '',
      ...privileges
    };
  }

  async convertToDto(client: AppClientFlat): Promise<AppClientUserDto> {
    return {
      id: client.id,
      name: client.name,
      clusterUrl: client.clusterUrl,
      privileges: await this.createAppPrivilegesArr(client),
      appClientDeveloperEmails: client.appClientDeveloperEmails,
    };
  }

  async createAppPrivilegesArr(client: AppClientFlat): Promise<Array<PrivilegeDto>> {
    return Array.from(await this.createAppPrivileges(client));
  }

  async createAppPrivileges(client: AppClientFlat): Promise<Set<PrivilegeDto>> {
    const privileges = new Set<PrivilegeDto>();
    const privilegeResponse = await this.appClientsApi.getClientTypePrivsWrapped();
    const data = privilegeResponse.data.data;

    if (client.read) {
      const privilege = data.find(item => item.name === PrivilegeType.READ);
      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (client.write) {
      const privilege = data.find(item => item.name === PrivilegeType.WRITE);
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

  resetState() {
    this.state.batch((state) => {
      if (state.promised) {
        return postpone;
      }

      this.state.set([]);
    });
  }
}
