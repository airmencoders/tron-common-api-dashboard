import { none, State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { PrivilegeDto, PrivilegeIdPair, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDtoResponseWrapper, ScratchStorageControllerApiInterface, ScratchStorageEntryDto, UserWithPrivs } from '../../openapi';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { DataService } from '../data-service/data-service';
import { prepareDataCrudErrorResponse } from '../data-service/data-service-utils';
import { PrivilegeType } from '../privilege/privilege-type';
import { ScratchStorageFlat } from './scratch-storage-flat';
import { ScratchStorageUserWithPrivsFlat } from './scratch-storage-user-with-privs-flat';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageFlat> {

  constructor(
    public state: State<ScratchStorageAppRegistryDto[]>,
    public selectedScratchStorageState: State<ScratchStorageFlat>,
    public scratchStorageApi: ScratchStorageControllerApiInterface,
    public privilegeState: State<PrivilegeDto[]>,
    public createUpdateState: State<ScratchStorageEntryDto[]>,
    public deleteState: State<string[]>) {
  }

  sendPatch = undefined;

  fetchAndStoreData(): CancellableDataRequest<ScratchStorageAppRegistryDto[]> {
    const response = (): AxiosPromise<ScratchStorageAppRegistryDtoResponseWrapper> => this.scratchStorageApi.getScratchSpaceAppsWrapped();
    const privilegeResponse = makeCancellableDataRequestToken(this.scratchStorageApi.getScratchPrivsWrapped.bind(this.scratchStorageApi));

    const data = new Promise<ScratchStorageAppRegistryDto[]>(async (resolve, reject) => {
      try {
        const scratchPrivs = await privilegeResponse.axiosPromise();
        this.privilegeState.set(scratchPrivs.data.data);

        const result = await response();
        resolve(this.removeUnfriendlyAgGridData(result.data.data));
      } catch (err) {
        if (isDataRequestCancelError(err)) {
          return [];
        }

        reject(prepareDataCrudErrorResponse(err));
      }
    });

    this.state.set(data);

    return {
      promise: data,
      cancelTokenSource: privilegeResponse.cancelTokenSource
    };
  }

  removeUnfriendlyAgGridData(data: ScratchStorageAppRegistryDto[]) {
    return data.map(x => {
      x.userPrivs = undefined;
      return x;
    });
  }

  async convertRowDataToEditableData(rowData: ScratchStorageAppRegistryDto): Promise<ScratchStorageFlat> {
    if (rowData.id == null || rowData.id.trim().length <= 0) {
      return Promise.reject(new Error('Scratch Storage App ID must be defined'));
    }

    try {
      const scratchStorage = await this.scratchStorageApi.getScratchAppById(rowData.id);
      const keys = (await this.scratchStorageApi.getAllKeysForAppIdWrapped(rowData.id)).data.data;    
      this.deleteState.set([]);
      this.createUpdateState.set([]);

      return {...this.convertToFlat(scratchStorage.data ?? {}), keyNames: keys};
    } catch (err) {
      return Promise.reject(err);
    }
  }

  convertToFlat(dto: ScratchStorageAppRegistryDto): ScratchStorageFlat {
    const convertedToFlat: ScratchStorageFlat = {
      id: dto.id ?? '',
      appName: dto.appName,
      appHasImplicitRead: dto.appHasImplicitRead,
      aclMode: dto.aclMode,
      userPrivs: this.convertScratchStorageUserPrivsToFlat(dto.userPrivs ?? []),
      keyNames: [],
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
    const readDto = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_READ);
    const writeDto = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_WRITE);
    const adminDto = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_ADMIN);

    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('Scratch Storage App to update has undefined id.'));
      }
      
      // build out the privileges in the shape the API wants, so we can do one transaction on updates
      const privsArray : UserWithPrivs[] = [];
      for (const userPriv of toUpdate.userPrivs) {
        const privsPairArray : PrivilegeIdPair[] = [];
        if (userPriv.read) privsPairArray.push({ priv: readDto } as PrivilegeIdPair);
        if (userPriv.write) privsPairArray.push({ priv: writeDto } as PrivilegeIdPair);
        if (userPriv.admin) privsPairArray.push({ priv: adminDto } as PrivilegeIdPair);

        privsArray.push({
          userId: userPriv.userId ?? null,
          emailAddress: userPriv.email,
          privs: privsPairArray
        });
      }

      let scratchStorageDto = this.convertToDto(toUpdate);
      scratchStorageDto = { ...scratchStorageDto, userPrivs: privsArray };
      const updatedResponse = await this.scratchStorageApi.editExistingAppEntry(toUpdate.id, scratchStorageDto as ScratchStorageAppRegistryDto);

      // do any pending key-value pair transactions
      await this.doKvpActions(toUpdate.id);

      const patchedResponse = updatedResponse.data as ScratchStorageAppRegistryDto;
      patchedResponse.userPrivs = undefined;
      const patchedIndex = this.state.get().findIndex(item => item.id === patchedResponse.id);
      this.state[patchedIndex].set(patchedResponse);
      return Promise.resolve(this.convertToFlat(patchedResponse));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async addUserPriv(userPriv: ScratchStorageUserWithPrivsFlat, appId: string) {
    const readId = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_READ)?.id;
    const writeId = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_WRITE)?.id;
    const adminId = this.privilegeState.value?.find(privilege => privilege.name === PrivilegeType.SCRATCH_ADMIN)?.id;

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
      aclMode: flat.aclMode,
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

      this.state.find(item => item.id.get() === toDelete.id)?.set(none);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async doKvpActions(id : string) {

    // post the new or edited keys for this appid
    for (const kvp of this.createUpdateState.get()) {
      await this.scratchStorageApi.setKeyValuePair(kvp);
    }

    // do any deletions
    for (const key of this.deleteState.get()) {
      await this.scratchStorageApi.deleteKeyValuePair(id, key);
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState() {
    if (!this.state.promised) {
      this.state.set([]);
    }
  }
}
