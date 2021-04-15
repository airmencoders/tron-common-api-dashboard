import {DataService} from '../data-service/data-service';
import {none, State} from '@hookstate/core';
import {Privilege, PrivilegeDto, PrivilegeIdPair, ScratchStorageAppRegistryDto, ScratchStorageAppRegistryEntry, ScratchStorageControllerApiInterface, UserWithPrivs} from '../../openapi';
import { ScratchStorageFlat } from './scratch-storage-flat';
import { ScratchStorageUserWithPrivsFlat } from './scratch-storage-user-with-privs-flat';
import { PrivilegeType } from '../privilege/privilege-type';
import { AxiosPromise } from 'axios';
import { accessPrivilegeState } from '../privilege/privilege-state';
// import { ScratchStorageDetailsFlat } from './scratch-storage-state';

export default class ScratchStorageService implements DataService<ScratchStorageAppRegistryDto, ScratchStorageFlat> {

  constructor(
    public state: State<ScratchStorageAppRegistryDto[]>, 
    public selectedScratchStorageState: State<ScratchStorageFlat>,
    private scratchStorageApi: ScratchStorageControllerApiInterface) {
  }
  sendUpdate(toUpdate: ScratchStorageFlat): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }
  sendPatch?: ((...args: any) => Promise<ScratchStorageAppRegistryDto>) | undefined;

  async fetchAndStoreData(): Promise<ScratchStorageAppRegistryDto[]> {
    const response = (): AxiosPromise<ScratchStorageAppRegistryDto[]> => this.scratchStorageApi.getScratchSpaceApps();

    const data = new Promise<ScratchStorageAppRegistryDto[]>(async (resolve, reject) => {
      try {
        const result = await response();
        const mappedData = result.data.map(x => {
          x.userPrivs = undefined;
          return x;
        });
        resolve(result.data);
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

    const scratchStorage = this.scratchStorageApi.getScratchAppById(rowData.id);

    const result = scratchStorage.then(response => {
      const convertedToFlat: ScratchStorageFlat = this.convertToFlat(response.data);
      return convertedToFlat;
    });

    return result;
  }
  convertToFlat(dto: ScratchStorageAppRegistryDto): ScratchStorageFlat {
    const convertedToFlat: ScratchStorageFlat = {
      id: dto.id ?? '',
      appName: dto.appName,
      appHasImplicitRead: dto.appHasImplicitRead,
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

  // async sendUpdate(toUpdate: ScratchStorageFlat): Promise<ScratchStorageFlat> {
  //   try {
  //     if (!toUpdate.id) {
  //       return Promise.reject(new Error('Scratch Storage App to update has undefined id.'));
  //     }
  //     const scratchStorageDto = this.convertToDto(toUpdate);
  //     const updatedResponse = await this.scratchStorageApi.editExistingAppEntry(toUpdate.id, scratchStorageDto as ScratchStorageAppRegistryEntry);

  //     // const appSourceDto: AppSourceDto = {
  //     //   id: updatedResponse.data.id,
  //     //   name: updatedResponse.data.name,
  //     //   clientCount: updatedResponse.data.appClients?.length
  //     // }

  //     // this.state.find(item => item.id.value === updatedResponse.data.id)?.set(appSourceDto);


  //     // return Promise.resolve(appSourceDto);
  //   }
  //   catch (error) {
  //     return Promise.reject(error);
  //   }
  // }
  
  convertToDto(flat: ScratchStorageFlat): ScratchStorageAppRegistryDto {
    const scratchStorageUserPrivsDto = this.convertScratchStorageUserPrivFlatsToDto(flat.userPrivs);

    const dto: ScratchStorageAppRegistryDto = {
      id: flat.id,
      appName: flat.appName,
      appHasImplicitRead: flat.appHasImplicitRead,
      userPrivs: this.sanitizeScratchStorageUserPrivs(scratchStorageUserPrivsDto)
    };

    return dto;
  }
  sanitizeScratchStorageUserPrivs(userPrivs: UserWithPrivs[]) {
    const sanitized: UserWithPrivs[] = [];
    for (const userPriv of userPrivs) {
      if (userPriv.privs?.length ?? 0 > 0)
        sanitized.push(userPriv);
    }

    return sanitized;
  }

  convertScratchStorageUserPrivFlatsToDto(flats: Array<ScratchStorageUserWithPrivsFlat>): Array<UserWithPrivs> {
    const convertedDtos: Array<UserWithPrivs> = [];

    for (const flat of flats) {
      convertedDtos.push(this.convertScratchStorageUserPrivFlatToDto(flat));
    }

    return convertedDtos;
  }

  convertScratchStorageUserPrivFlatToDto(flat: ScratchStorageUserWithPrivsFlat): UserWithPrivs {
    const readPrivilege = accessPrivilegeState().getPrivilegeFromType(PrivilegeType.SCRATCH_READ);
    const writePrivilege = accessPrivilegeState().getPrivilegeFromType(PrivilegeType.SCRATCH_WRITE);
    const adminPrivilege = accessPrivilegeState().getPrivilegeFromType(PrivilegeType.SCRATCH_ADMIN);

    const privileges = [];

    if (flat.read && readPrivilege)
      privileges.push(readPrivilege);

    if (flat.write && writePrivilege)
      privileges.push(writePrivilege);

    if (flat.admin && adminPrivilege)
      privileges.push(adminPrivilege);

    const dto: UserWithPrivs = {
      emailAddress: flat.email,
      privs: this.convertPrivFlatsToPrivIdPairs(privileges)
    };

    return dto;
  }
  convertPrivFlatsToPrivIdPairs(privileges: Privilege[]): PrivilegeIdPair[] {
    const privIdPairs = [];

    for (const privilege of privileges) {
      const privIdPair: PrivilegeIdPair = {
        //userPrivPairId:
        priv: privilege
      };
      privIdPairs.push(privIdPair);
    }

    return privIdPairs;
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

  // async getScratchStorageDetails(id: string): Promise<any> {
  //   try {
  //     // the extra query params causes this response to match signature of an OrganizationDtoWithDetails
  //     const scratchStorageResponse = await this.scratchStorageApi.getScratchAppById(id);

  //     this.selectedScratchStorageState.set(this.convertToFlat(scratchStorageResponse.data));      
  //     return Promise.resolve(scratchStorageResponse.data);
  //   }
  //   catch (error) {
  //     return Promise.reject(error);
  //   }
  // }
}
