import {DataService} from '../data-service/data-service';
import {none, State} from '@hookstate/core';
import {Privilege, PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryEntry, ScratchStorageControllerApiInterface, UserWithPrivs} from '../../openapi';
import { ScratchStorageFlat } from './scratch-storage-flat';
import { ScratchStorageUserWithPrivsFlat } from './scratch-storage-user-with-privs-flat';
import { PrivilegeType } from '../privilege/privilege-type';
import { AxiosPromise } from 'axios';
import { accessPrivilegeState } from '../privilege/privilege-state';
import { accessScratchStorageState } from './scratch-storage-state';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageFlat> {

  constructor(public state: State<ScratchStorageAppRegistryDto[]>, private scratchStorageApi: ScratchStorageControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<ScratchStorageAppRegistryDto[]> {
    const response = (): AxiosPromise<ScratchStorageAppRegistryDto[]> => this.scratchStorageApi.getScratchSpaceApps();
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();
    //const scratchStorageResponse = (): Promise<ScratchStorageUserWithPrivsFlat[]> => accessScratchStorageState().fetchAndStoreData();

    const data = new Promise<ScratchStorageAppRegistryDto[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        const result = await response();

        resolve(result.data);
      } catch (err) {
        reject(err);
      }
    });

    this.state.set(data);

    return data;
  }

  convertRowDataToEditableData(rowData: ScratchStorageAppRegistryDto): Promise<ScratchStorageFlat> {
    if (rowData.id == null || rowData.id.trim().length <= 0) {
      return Promise.reject(new Error('Scratch Storage App ID must be defined'));
    }

    const scratchStorage = this.scratchStorageApi.getScratchAppById(rowData.id);

    const result = scratchStorage.then(response => {
      //const mappedData = response.data.userPrivs?.map(x => {return undefined;});
      const convertedToFlat: ScratchStorageFlat = this.convertToFlat(response.data);

      return convertedToFlat;
    });

    return result;
  }
  convertToFlat(dto: ScratchStorageAppRegistryDto): ScratchStorageFlat {
    const convertedToFlat: ScratchStorageFlat = {
      id: dto.id ?? '',
      appName: dto.appName,
      userPrivs: this.convertScratchStorageeUserPrivsToFlat(dto.userPrivs ?? [])
    }

    return convertedToFlat;
  }
  convertScratchStorageeUserPrivsToFlat(userPrivs: UserWithPrivs[]): ScratchStorageUserWithPrivsFlat[] {
    const flats: Array<ScratchStorageUserWithPrivsFlat> = [];

    for (const dto of userPrivs) {
      const convertedFlat = this.convertAppClientUserPrivToFlat(dto);
      flats.push(convertedFlat);
    }

    return flats;
  }
  convertAppClientUserPrivToFlat(dto: UserWithPrivs) {
    const privileges = dto.privs?.map(x => x.priv).filter(y => y != null) as Privilege[] ?? [];

    const flat: ScratchStorageUserWithPrivsFlat = {
      userId: dto.userId ?? '',
      email: dto.emailAddress ?? '',
      read: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_READ) ? true : false,
      write: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_WRITE) ? true : false,
      admin: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_ADMIN) ? true : false,
    };

    return flat;
  }

  sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }
  async sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppRegistryDto> {
    try {
      if(await this.appNameExists(toCreate))
        throw new Error("App name already exists.");
      const scratchStorageResponse = await this.scratchStorageApi.postNewScratchSpaceApp(toCreate as ScratchStorageAppRegistryEntry);
      this.state[this.state.length].set(Object.assign({}, scratchStorageResponse.data as ScratchStorageAppRegistryDto, { userPrivs: undefined }));
      return Promise.resolve(scratchStorageResponse.data as ScratchStorageAppRegistryDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async appNameExists(app: ScratchStorageAppRegistryDto): Promise<boolean> {
      const apps = await this.scratchStorageApi.getScratchSpaceApps();
      return apps.data.some(x => x.appName === app.appName && x.id !== app.id);
  }

  async sendDelete(toDelete: ScratchStorageAppRegistryDto): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('Scratch Storage App to delete has undefined id.');
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
