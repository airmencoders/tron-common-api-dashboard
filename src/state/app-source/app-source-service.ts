import {postpone, State} from '@hookstate/core';
import {AxiosPromise} from 'axios';
import {DataService} from '../data-service/data-service';
import {
  AppClientSummaryDto,
  AppClientSummaryDtoResponseWrapper,
  AppSourceControllerApiInterface,
  AppSourceDetailsDto,
  AppSourceDto
} from '../../openapi';
import Config from '../../api/config';
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';
import { CancellableDataRequest, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { wrapDataCrudWrappedRequest } from '../data-service/data-service-utils';

/**
 * PII WARNING:
 * Models used by this service has the following PII fields
 * AppSourceDetailsDto
 *  * appSourceAdminUserEmails
 */
export default class AppSourceService implements DataService<AppSourceDto, AppSourceDetailsDto> {

  private readonly validate: ValidateFunction<AppSourceDetailsDto>;

  constructor(public state: State<AppSourceDto[]>, private appSourceApi: AppSourceControllerApiInterface) {
    this.validate = TypeValidation.validatorFor<AppSourceDetailsDto>(ModelTypes.definitions.AppSourceDetailsDto);
  }

  fetchAndStoreData(): CancellableDataRequest<AppSourceDto[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.appSourceApi.getAppSourcesWrapped.bind(this.appSourceApi));
    const requestPromise = wrapDataCrudWrappedRequest(cancellableRequest.axiosPromise());

    this.state.set(requestPromise);

    return {
      promise: requestPromise,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  fetchAppClients(): Promise<AppClientSummaryDto[]> {
    const response = (): AxiosPromise<AppClientSummaryDtoResponseWrapper> => this.appSourceApi.getAvailableAppClientsWrapped();

    return response().then(res => res.data.data);
  }

  fetchAPISpecFile(id: string): Promise<any> {
    const response = (): AxiosPromise<any> => this.appSourceApi.getSpecFile(id)

    return response().then(res => res.data);
  }

  fetchAPISpecFileByEndpointId(id: string): Promise<any> {
    const response = (): AxiosPromise<any> => this.appSourceApi.getSpecFileByEndpointPriv(id)

    return response().then(res => res.data);
  }

  generateAppSourcePath(appSourcePath?: string): string {
    if (appSourcePath == null) {
      return '';
    }

    return `${Config.API_URL}app/${appSourcePath}/<app-source-endpoint>`;
  }

  /**
   * NOT USED
   * App Source creation handled on server
   */
  async sendCreate(toCreate: AppSourceDetailsDto): Promise<AppSourceDto> {
    throw new Error('Not implemented');
  }

  async sendUpdate(toUpdate: AppSourceDetailsDto): Promise<AppSourceDto> {
    if(!this.validate(toUpdate)) {
      throw TypeValidation.validationError('AppSourceDetailsDto');
    }
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('App Source to update has undefined id.'));
      }

      const updatedResponse = await this.appSourceApi.updateAppSourceDetails(toUpdate.id, toUpdate);

      const appSourceDto: AppSourceDto = {
        id: updatedResponse.data.id,
        name: updatedResponse.data.name,
        clientCount: updatedResponse.data.clientCount,
        endpointCount: updatedResponse.data.endpointCount
      };

      this.state.find(item => item.id.value === updatedResponse.data.id)?.set(appSourceDto);

      return Promise.resolve(appSourceDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Not used.
   * Delete not supported.
   */
  async sendDelete(toDelete: AppSourceDetailsDto): Promise<void> {
    throw new Error('Not yet implemented');
  }

  async convertRowDataToEditableData(rowData: AppSourceDto): Promise<AppSourceDetailsDto> {
    if (rowData.id == null || rowData.id.trim().length <= 0) {
      return Promise.reject(new Error('App Source ID must be defined'));
    }

    try {
      const appSourceDetailsDto = (await this.appSourceApi.getAppSourceDetails(rowData.id)).data;
      const appSourceDetails: AppSourceDetailsDto = {
        ...appSourceDetailsDto,
        appSourcePath: this.generateAppSourcePath(appSourceDetailsDto.appSourcePath)
      };

      return Promise.resolve(appSourceDetails);
    } catch (err) {
      return Promise.reject(err);
    }

  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get appSources(): AppSourceDto[] {
    return !this.isStateReady() ? new Array<AppSourceDto>() : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState() {
    if (!this.state.promised) {
      this.state.set([]);
    }
  }
}
