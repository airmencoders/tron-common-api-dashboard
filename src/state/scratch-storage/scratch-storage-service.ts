import {DataService} from '../data-service/data-service';
import {State} from '@hookstate/core';
import {ScratchStorageAppRegistryDto, ScratchStorageControllerApiInterface} from '../../openapi';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDto> {

  constructor(public state: State<ScratchStorageAppRegistryDto[]>, private scratchStorageApi: ScratchStorageControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<ScratchStorageAppRegistryDto[]> {
    const scratchStorageResponsePromise = await this.scratchStorageApi.getScratchSpaceApps()
        .then(resp => {
          return resp.data;
        });
    const mappedData = scratchStorageResponsePromise.map((scratch) => {
      scratch.userPrivs = undefined;
      return scratch;
    });
    this.state.set(mappedData);
    return scratchStorageResponsePromise;
  }

  convertRowDataToEditableData(rowData: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    return Promise.resolve(rowData);
  }

  sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }
  sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }

  async sendDelete(toDelete: ScratchStorageAppRegistryDto): Promise<void> {
    return Promise.resolve();
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.error;
  }

}
