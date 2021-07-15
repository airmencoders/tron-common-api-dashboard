import { DataService } from '../data-service/data-service';
import { State } from '@hookstate/core';
import { ScratchStorageAppRegistryDto, ScratchStorageControllerApiInterface } from '../../openapi';
import { ScratchStorageAppFlat } from './scratch-storage-app-flat';
import { accessAuthorizedUserState } from '../authorized-user/authorized-user-state';
import { PrivilegeType } from '../privilege/privilege-type';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { prepareDataCrudErrorResponse } from '../data-service/data-service-utils';

export default class MyDigitizeAppsService implements DataService<ScratchStorageAppFlat, ScratchStorageAppRegistryDto> {
  constructor(public state: State<ScratchStorageAppFlat[]>, private scratchStorageApi: ScratchStorageControllerApiInterface) { }

  fetchAndStoreData(): CancellableDataRequest<ScratchStorageAppFlat[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.scratchStorageApi.getScratchSpaceAppsByAuthorizedUser.bind(this.scratchStorageApi));
    const requestPromise = cancellableRequest.axiosPromise()
      .then(response => {
        return this.convertScratchStorageAppRegistryDtosToFlat(response.data);
      })
      .catch(error => {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        return Promise.reject(prepareDataCrudErrorResponse(error));
      });

    this.state.set(requestPromise);

    return {
      promise: requestPromise,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
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
    if (!this.state.promised) {
      this.state.set([]);
    }
  }
}
