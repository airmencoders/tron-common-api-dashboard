import { none, postpone, State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDtoResponseWrapper, ScratchStorageControllerApiInterface, UserWithPrivs } from '../../openapi';
import { DataService } from '../data-service/data-service';
import { accessPrivilegeState } from '../privilege/privilege-state';
import { PrivilegeType } from '../privilege/privilege-type';
import { ScratchStorageFlat } from './scratch-storage-flat';
import { ScratchStorageUserWithPrivsFlat } from './scratch-storage-user-with-privs-flat';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageFlat> {

  constructor(
    public state: State<ScratchStorageAppRegistryDto[]>,
    public selectedScratchStorageState: State<ScratchStorageFlat>,
    private scratchStorageApi: ScratchStorageControllerApiInterface) {
  }

  sendPatch = undefined;

  async fetchAndStoreData(): Promise<ScratchStorageAppRegistryDto[]> {
    const response = (): AxiosPromise<ScratchStorageAppRegistryDtoResponseWrapper> => this.scratchStorageApi.getScratchSpaceAppsWrapped();
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();

    const data = new Promise<ScratchStorageAppRegistryDto[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        const result = await response();
        const mappedData = result.data?.data?.map(x => {
          x.userPrivs = undefined;
          return x;
        }) || [];
        resolve(result.data?.data);
        this.state.set(mappedData);
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

    try {
      const scratchStorage = this.scratchStorageApi.getScratchAppById(rowData.id);

      const result = scratchStorage.then(response => {
        const convertedToFlat: ScratchStorageFlat = this.convertToFlat(response.data ?? {});
        return convertedToFlat;
      });

      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  convertToFlat(dto: ScratchStorageAppRegistryDto): ScratchStorageFlat {
    const convertedToFlat: ScratchStorageFlat = {
      id: dto.id ?? '',
      appName: dto.appName,
      appHasImplicitRead: dto.appHasImplicitRead,
      userPrivs: this.convertScratchStorageUserPrivsToFlat(dto.userPrivs ?? [])
    }

    return convertedToFlat;
  }
  convertScratchStorageUserPrivsToFlat(userPrivs: UserWithPrivs[]): ScratchStorageUserWithPrivsFlat[] {
    const flats: Array<ScratchStorageUserWithPrivsFlat> = [];

    for (const dto of userPrivs) {
      const convertedFlat = this.convertUserPrivToFlat(dto);
      flats.push(convertedFlat);
    }

    return flats;
  }
  convertUserPrivToFlat(dto: UserWithPrivs) {
    const privileges = dto.privs?.map(x => x.priv).filter(y => y != null) as PrivilegeDto[] ?? [];

    const flat: ScratchStorageUserWithPrivsFlat = {
      userId: dto.userId ?? '',
      email: dto.emailAddress ?? '',
      read: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_READ) ? true : false,
      write: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_WRITE) ? true : false,
      admin: privileges.find(privilege => privilege.name === PrivilegeType.SCRATCH_ADMIN) ? true : false,
    };

    return flat;
  }

  async sendUpdate(toUpdate: ScratchStorageFlat): Promise<ScratchStorageFlat> {
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('Scratch Storage App to update has undefined id.'));
      }

      const scratchStorageDto = this.convertToDto(toUpdate);
      const updatedResponse = await this.scratchStorageApi.editExistingAppEntry(toUpdate.id, scratchStorageDto as ScratchStorageAppRegistryDto);

      const patchedResponse = updatedResponse.data as ScratchStorageAppRegistryDto;
      patchedResponse.userPrivs = undefined;
      const patchedIndex = this.state.get().findIndex(item => item.id === patchedResponse.id);
      this.state[patchedIndex].set(patchedResponse);

      for(const userPriv of toUpdate.userPrivs){
        await this.addUserPriv(userPriv, toUpdate.id);
      }

      return Promise.resolve(this.convertToFlat(patchedResponse));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  async addUserPriv(userPriv: ScratchStorageUserWithPrivsFlat, appId: string) {
    const readId = accessPrivilegeState().getPrivilegeIdFromType(PrivilegeType.SCRATCH_READ);
    const writeId = accessPrivilegeState().getPrivilegeIdFromType(PrivilegeType.SCRATCH_WRITE);
    const adminId = accessPrivilegeState().getPrivilegeIdFromType(PrivilegeType.SCRATCH_ADMIN);

    if(userPriv.read && readId)
      await this.scratchStorageApi.addUserPriv(appId, { email: userPriv.email, privilegeId: readId});
    if(userPriv.write && writeId)
      await this.scratchStorageApi.addUserPriv(appId, { email: userPriv.email, privilegeId: writeId});
    if(userPriv.admin && adminId)
      await this.scratchStorageApi.addUserPriv(appId, { email: userPriv.email, privilegeId: adminId});

  }

  convertToDto(flat: ScratchStorageFlat): ScratchStorageAppRegistryDto {
    const dto: ScratchStorageAppRegistryDto = {
      id: flat.id,
      appName: flat.appName,
      appHasImplicitRead: flat.appHasImplicitRead,
    };

    return dto;
  }

  async sendCreate(toCreate: ScratchStorageFlat): Promise<ScratchStorageFlat> {
    try {
      if(await this.appNameExists(toCreate))
        throw new Error("App name already exists.");

      const scratchStorageResponse = await this.scratchStorageApi.postNewScratchSpaceApp({ appName: toCreate.appName, appHasImplicitRead: toCreate.appHasImplicitRead } as ScratchStorageAppRegistryDto);
      const scratchStorageDto = scratchStorageResponse.data as ScratchStorageAppRegistryDto;

      if(scratchStorageDto.id && toCreate.userPrivs)
        for(const userPriv of toCreate.userPrivs)
          await this.addUserPriv(userPriv, scratchStorageDto.id);

      this.state[this.state.length].set(Object.assign({}, scratchStorageDto, { userPrivs: undefined }));
      return Promise.resolve(this.convertToFlat(scratchStorageDto));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async appNameExists(app: ScratchStorageAppRegistryDto): Promise<boolean> {
    const apps = await this.scratchStorageApi.getScratchSpaceAppsWrapped();
    return apps.data.data.some(x => x.appName === app.appName && x.id !== app.id);
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
