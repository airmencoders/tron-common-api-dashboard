import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DataService } from '../data-service/data-service';
import { AppSourceControllerApiInterface, AppSourceDetailsDto, AppSourceDto } from '../../openapi';

export default class AppSourceService implements DataService<AppSourceDto, AppSourceDetailsDto> {
  constructor(public state: State<AppSourceDto[]>, private appSourceApi: AppSourceControllerApiInterface) { }

  fetchAndStoreData(): Promise<AppSourceDto[]> {
    const response = (): AxiosPromise<AppSourceDto[]> => this.appSourceApi.getAppSources();

    const data = new Promise<AppSourceDto[]>((resolve) => resolve(response().then(r => r.data)));
    this.state.set(data);

    return data;
  }

  /**
   * // TODO: implement as needed
   */
  async sendCreate(toCreate: AppSourceDetailsDto): Promise<AppSourceDto> {
    throw new Error('Not yet implemented');
  }

  /**
   * // TODO: implement as needed
   */
  async sendUpdate(toUpdate: AppSourceDetailsDto): Promise<AppSourceDto> {
    throw new Error('Not yet implemented');
  }

  /**
   * // TODO: implement as needed
   */
  async sendDelete(toDelete: AppSourceDetailsDto): Promise<void> {
    throw new Error('Not yet implemented');
  }

  /**
   * // TODO: implement as needed
   */
  convertRowDataToEditableData(rowData: AppSourceDto): Promise<AppSourceDetailsDto> {
    throw new Error('Not yet implemented');
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
