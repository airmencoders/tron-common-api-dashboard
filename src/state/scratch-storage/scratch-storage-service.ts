import {DataService} from '../data-service/data-service';
import {State} from '@hookstate/core';
import {ScratchStorageAppRegistryDto, ScratchStorageControllerApiInterface} from '../../openapi';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDto> {

  constructor(public state: State<ScratchStorageAppRegistryDto[]>, private scratchStorageApi: ScratchStorageControllerApiInterface) {
  }
    sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
        throw new Error('Method not implemented.');
    }
    sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
        throw new Error('Method not implemented.');
    }

  async fetchAndStoreData(): Promise<ScratchStorageAppRegistryDto[]> {
    try {
      const scratchStorageResponse = await this.scratchStorageApi.getScratchSpaceApps();
      this.state.set(scratchStorageResponse.data);
      return Promise.resolve(scratchStorageResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  convertRowDataToEditableData(rowData: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    return Promise.resolve(rowData);
  }

//   async sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
//     try {
//       const personResponse = await this.scratchStorageApi.(toCreate);
//       return Promise.resolve(personResponse.data);
//     }
//     catch (error) {
//       return Promise.reject(error);
//     }
//   }

//   async sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
//     try {
//       if (toUpdate?.id == null) {
//         return Promise.reject(new Error('Person to update has undefined id.'));
//       }
//       const personResponse = await this.scratchStorageApi.(toUpdate.id, toUpdate);
//       return Promise.resolve(personResponse.data);
//     }
//     catch (error) {
//       return Promise.reject(error);
//     }
//   }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.error;
  }

}
