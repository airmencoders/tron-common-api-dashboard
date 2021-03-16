import {DataService} from '../data-service/data-service';
import {none, State} from '@hookstate/core';
import {ScratchStorageAppRegistryDto, ScratchStorageAppRegistryEntry, ScratchStorageControllerApiInterface} from '../../openapi';

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
    return Promise.resolve(Object.assign({}, rowData));
  }

  sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }
  async sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    try {
      const scratchStorageResponse = await this.scratchStorageApi.postNewScratchSpaceApp(toCreate as ScratchStorageAppRegistryEntry);
      return Promise.resolve(scratchStorageResponse.data as ScratchStorageAppRegistryDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendDelete(toDelete: ScratchStorageAppRegistryDto): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('App Client to delete has undefined id.');
      }

      await this.scratchStorageApi.deleteExistingAppEntry(toDelete.id);

      const item = this.state.find(item => item.id.get() === toDelete.id);
      if (item)
        item.set(none);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.error;
  }

}
