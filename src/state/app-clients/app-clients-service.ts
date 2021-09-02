import { none, State } from "@hookstate/core";
import { ValidateFunction } from 'ajv';
import axios from 'axios';
import ModelTypes from '../../api/model-types.json';
import { DataCrudFormErrors } from "../../components/DataCrudFormPage/data-crud-form-errors";
import { AppClientControllerApiInterface } from "../../openapi/apis/app-client-controller-api";
import { AppClientUserDetailsDto, PrivilegeDto } from "../../openapi/models";
import { AppClientUserDto } from "../../openapi/models/app-client-user-dto";
import { CancellableDataRequest, makeCancellableDataRequest } from '../../utils/cancellable-data-request';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import { AppSourceDevDetails } from '../app-source/app-source-dev-details';
import { DataService } from "../data-service/data-service";
import { prepareDataCrudErrorResponse, wrapDataCrudWrappedRequest } from "../data-service/data-service-utils";
import { PrivilegeType } from "../privilege/privilege-type";
import { AppClientFlat } from "./app-client-flat";
import { AppClientPrivilege } from "./app-client-privilege";

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

  constructor(public state: State<AppClientFlat[]>, 
              private appClientsApi: AppClientControllerApiInterface,
              public privilegesState: State<PrivilegeDto[]>) {
    this.validate = TypeValidation.validatorFor<AppClientUserDto>(ModelTypes.definitions.AppClientUserDto);
  }

  fetchAndStoreData(): CancellableDataRequest<AppClientFlat[]> {
    const cancelTokenSource = axios.CancelToken.source();

    const appClientRequest = makeCancellableDataRequest(cancelTokenSource, this.appClientsApi.getAppClientUsersWrapped.bind(this.appClientsApi));
    const appClientStatePromise = wrapDataCrudWrappedRequest(appClientRequest.axiosPromise(), this.convertAppClientsToFlat.bind(this));

    this.state.set(appClientStatePromise);

    const privilegeRequest = makeCancellableDataRequest(cancelTokenSource, this.appClientsApi.getClientTypePrivsWrapped.bind(this.appClientsApi));
    const privilegeStatePromise = wrapDataCrudWrappedRequest(privilegeRequest.axiosPromise());

    this.privilegesState.set(privilegeStatePromise);

    return {
      promise: appClientStatePromise,
      cancelTokenSource
    };
  }

  async getSelectedClient(id: string): Promise<AppClientUserDetailsDto> {
    const record = await this.appClientsApi.getAppClientRecord(id);
    return {...record.data};
  }

  async sendCreate(toCreate: AppClientFlat): Promise<AppClientFlat> {
    const appClientDto = await this.convertToDto(toCreate);
    if (!this.validate(appClientDto)) {
      throw TypeValidation.validationError('AppClientUserDto');
    }

    try {
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
    if (toUpdate?.id == null) {
      return Promise.reject(new Error('App Client to update has undefined id.'));
    }

    try {
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
    if (toDelete?.id == null) {
      return Promise.reject('App Client to delete has undefined id.');
    }

    try {
      await this.appClientsApi.deleteAppClient(toDelete.id);
      const item = this.state.find(appClient => appClient.id.get() === toDelete.id);
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
      const details: AppClientUserDetailsDto = await this.getSelectedClient(id);
      const appSourceMap: Record<string, AppSourceDevDetails> = {};
      //groupby appSourceId
      if (details?.appEndpointPrivs != null) {
        for (const endpoint of details.appEndpointPrivs) {
          if (endpoint.appSourceId != null) {
            let existingEndpoints = appSourceMap[endpoint.appSourceId];
            if (existingEndpoints == null) {
              existingEndpoints = appSourceMap[endpoint.appSourceId] =
                  new AppSourceDevDetails(endpoint.appSourceId, endpoint.appSourceName ?? 'Unknown App Source');
            }
            existingEndpoints.allowedEndpoints.push(endpoint);
          }
        }
      }
      const retVal: AppClientFlat = {
        ...rowData,
        appClientDeveloperEmails: details.appClientDeveloperEmails,
        appSourceEndpoints: Object.values(appSourceMap),
        allPrivs: details.privileges,
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

  /**
   * Flattens the AppClientUserDto into an object with no collections (since AgGrid and Hookstate croak).
   * @param client 
   * @returns 
   */
  convertToFlat(client: AppClientUserDto): AppClientFlat {
    const { id, name, clusterUrl } = client;
    const privilegeArr = Array.from(client.privileges || []);

    const privileges: AppClientPrivilege = {
      personCreate: privilegeArr.find(privilege => privilege.name === PrivilegeType.PERSON_CREATE) ? true : false,
      personDelete: privilegeArr.find(privilege => privilege.name === PrivilegeType.PERSON_DELETE) ? true : false,
      personEdit: privilegeArr.find(privilege => privilege.name === PrivilegeType.PERSON_EDIT) ? true : false,
      personRead: privilegeArr.find(privilege => privilege.name === PrivilegeType.PERSON_READ) ? true : false,
      orgCreate: privilegeArr.find(privilege => privilege.name === PrivilegeType.ORGANIZATION_CREATE) ? true : false,
      orgEdit: privilegeArr.find(privilege => privilege.name === PrivilegeType.ORGANIZATION_EDIT) ? true : false,
      orgDelete: privilegeArr.find(privilege => privilege.name === PrivilegeType.ORGANIZATION_DELETE) ? true : false,
      orgRead: privilegeArr.find(privilege => privilege.name === PrivilegeType.ORGANIZATION_READ) ? true : false,
    };

    return {
      id,
      name: name || '',
      appClientDeveloperEmails: client.appClientDeveloperEmails,
      clusterUrl: clusterUrl || '',
      ...privileges
    };
  }

  /**
   * Convert the data from the edit form back into the DTO to send to API.
   *
   * @param client the data from the edit form
   * @returns the DTO to send to backend
   */
  async convertToDto(client: AppClientFlat): Promise<AppClientUserDto> {
    const includesPersonEdit = client.allPrivs?.map(item => item.name).includes(PrivilegeType.PERSON_EDIT);
    const includesOrgEdit = client.allPrivs?.map(item => item.name).includes(PrivilegeType.ORGANIZATION_EDIT);
    let localPrivs : PrivilegeDto[] = [];

    /**
     * Only include relevant privileges.
     * If *_EDIT privilege is not given, then don't
     * include any field level edit privileges for that type.
     */
    localPrivs = client.allPrivs?.filter(item => {
      const isPersonFieldPriv = item.name.startsWith("Person-");
      const isOrgFieldPriv = item.name.startsWith("Organization-");

      if ((!isPersonFieldPriv && !isOrgFieldPriv) ||
        (includesPersonEdit && isPersonFieldPriv) ||
        (includesOrgEdit && isOrgFieldPriv)) {
        return true
      }

      return false;
    }) ?? [];

    return {
      id: client.id,
      name: client.name,
      clusterUrl: client.clusterUrl,
      privileges: localPrivs,
      appClientDeveloperEmails: client.appClientDeveloperEmails,
    };
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
    if (!this.state.promised) {
      this.state.set([]);
    }
  }
}
