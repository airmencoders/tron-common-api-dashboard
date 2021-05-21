import { DataService } from '../data-service/data-service';
import { postpone, State } from '@hookstate/core';
import { ScratchStorageAppRegistryDto, ScratchStorageControllerApiInterface } from '../../openapi';
import { ScratchStorageAppFlat } from './scratch-storage-app-flat';
import { accessAuthorizedUserState } from '../authorized-user/authorized-user-state';
import { PrivilegeType } from '../privilege/privilege-type';

export default class MyDigitizeAppsService implements DataService<ScratchStorageAppFlat, ScratchStorageAppRegistryDto> {
  constructor(public state: State<ScratchStorageAppFlat[]>, private scratchStorageApi: ScratchStorageControllerApiInterface) { }

  fetchAndStoreData(): Promise<ScratchStorageAppFlat[]> {
    const scratchStorageAppsResponse = this.scratchStorageApi.getScratchSpaceAppsByAuthorizedUser();

    const convertedResponse: Promise<ScratchStorageAppFlat[]> = new Promise(async (resolve, reject) => {
      try {
        const dataResponse = (await scratchStorageAppsResponse).data;
        const converted = this.convertScratchStorageAppRegistryDtosToFlat(dataResponse);
        resolve(converted);
      } catch (err) {
        reject(err);
      }
    });

    this.state.set(convertedResponse);
    return convertedResponse;
  }

  /**
   * NOT USED.
   * This is view only
   */
  async convertRowDataToEditableData(rowData: ScratchStorageAppFlat): Promise<ScratchStorageAppRegistryDto> {
    throw new Error('Method not implemented.');
  }

  /**
   * NOT USED.
   * This is view only
   */
  async sendUpdate(toUpdate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppFlat> {
    throw new Error('Method not implemented.');
  }

  /**
   * NOT USED.
   * This is view only
   */
  async sendCreate(toCreate: ScratchStorageAppRegistryDto): Promise<ScratchStorageAppFlat> {
    throw new Error('Method not implemented.');
  }

  /**
   * NOT USED.
   * This is view only
   */
   async sendDelete(toDelete: ScratchStorageAppRegistryDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  convertScratchStorageAppRegistryDtosToFlat(dtos: ScratchStorageAppRegistryDto[]): ScratchStorageAppFlat[] {
    const flats: ScratchStorageAppFlat[] = [];

    for (const dto of dtos) {
      flats.push(this.convertScratchStorageAppRegistryDtoToFlat(dto));
    }

    return flats;
  }

  convertScratchStorageAppRegistryDtoToFlat(dto: ScratchStorageAppRegistryDto): ScratchStorageAppFlat {
    const { id, appName, appHasImplicitRead } = dto;
    const currentUser = accessAuthorizedUserState().authorizedUser?.email;
    let scratchRead = false;
    let scratchWrite = false;
    let scratchAdmin = false;

    const userPrivileges = dto.userPrivs?.find(priv => priv.emailAddress?.toLowerCase() === currentUser?.toLowerCase())?.privs;

    if (userPrivileges) {
      for (const privilege of userPrivileges) {
        switch (privilege.priv?.name) {
          case PrivilegeType.SCRATCH_ADMIN:
            scratchAdmin = true;
            break;

          case PrivilegeType.SCRATCH_READ:
            scratchRead = true;
            break;

          case PrivilegeType.SCRATCH_WRITE:
            scratchWrite = true;
            break;

          default:
            break;
        }
      }
    }

    const flat: ScratchStorageAppFlat = {
      id: id ?? '',
      appName,
      appHasImplicitRead: appHasImplicitRead || false,
      scratchRead: scratchRead || appHasImplicitRead || false,
      scratchWrite,
      scratchAdmin
    };

    return flat;
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
