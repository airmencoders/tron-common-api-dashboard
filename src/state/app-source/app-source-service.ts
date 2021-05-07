import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DataService } from '../data-service/data-service';
import { AppClientSummaryDto, AppSourceControllerApiInterface, AppSourceDetailsDto, AppSourceDto } from '../../openapi';
import Config from '../../api/configuration';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';

export default class AppSourceService implements DataService<AppSourceDto, AppSourceDetailsDto> {
  constructor(public state: State<AppSourceDto[]>, private appSourceApi: AppSourceControllerApiInterface) { }

  fetchAndStoreData(): Promise<AppSourceDto[]> {
    const response = (): AxiosPromise<AppSourceDto[]> => this.appSourceApi.getAppSources();

    const data = new Promise<AppSourceDto[]>(async (resolve, reject) => {
      try {
        const result = await response();

        resolve(result.data);
      } catch (err) {
        reject(err);
      }
    });

    this.state.set(data);

    return data;
  }

  fetchAppClients(): Promise<AppClientSummaryDto[]> {
    const response = (): AxiosPromise<AppClientSummaryDto[]> => this.appSourceApi.getAvailableAppClients();

    const result = response().then(res => res.data);

    return result;
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
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('App Source to update has undefined id.'));
      }

      const updatedResponse = await this.appSourceApi.updateAppSourceDetails(toUpdate.id, toUpdate);

      const appSourceDto: AppSourceDto = {
        id: updatedResponse.data.id,
        name: updatedResponse.data.name,
        clientCount: updatedResponse.data.appClients?.length,
        endpointCount: updatedResponse.data.endpoints?.length
      };

      this.state.find(item => item.id.value === updatedResponse.data.id)?.set(appSourceDto);

      return Promise.resolve(appSourceDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * // TODO: implement as needed
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
}
