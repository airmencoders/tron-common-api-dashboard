import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DataService } from '../data-service/data-service';
import { AppSourceControllerApiInterface, AppSourceDetailsDto, AppSourceDto, AppClientUserPrivDto, PrivilegeDto } from '../../openapi';
import { AppClientUserPrivFlat } from './app-client-user-priv-flat';
import { accessPrivilegeState } from '../privilege/privilege-state';
import { accessAppClientsState } from '../app-clients/app-clients-state';
import { PrivilegeType } from '../privilege/privilege-type';
import { AppSourceDetailsFlat } from './app-source-details-flat';
import { AppClientFlat } from '../app-clients/app-client-flat';

export default class AppSourceService implements DataService<AppSourceDto, AppSourceDetailsFlat> {
  constructor(public state: State<AppSourceDto[]>, private appSourceApi: AppSourceControllerApiInterface) { }

  fetchAndStoreData(): Promise<AppSourceDto[]> {
    const response = (): AxiosPromise<AppSourceDto[]> => this.appSourceApi.getAppSources();
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();
    const appClientResponse = (): Promise<AppClientFlat[]> => accessAppClientsState().fetchAndStoreData();

    const data = new Promise<AppSourceDto[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        await appClientResponse();
        const result = await response();

        resolve(result.data);
      } catch (err) {
        reject(err);
      }
    });

    this.state.set(data);

    return data;
  }

  /**
   * NOT USED
   * App Source creation handled on server
   */
  async sendCreate(toCreate: AppSourceDetailsFlat): Promise<AppSourceDto> {
    throw new Error('Not implemented');
  }

  async sendUpdate(toUpdate: AppSourceDetailsFlat): Promise<AppSourceDto> {
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('App Source to update has undefined id.'));
      }
      const appSourceDetailsDto = this.convertToDto(toUpdate);
      const updatedResponse = await this.appSourceApi.updateAppSourceDetails(toUpdate.id, appSourceDetailsDto);

      const appSourceDto: AppSourceDto = {
        id: updatedResponse.data.id,
        name: updatedResponse.data.name,
        clientCount: updatedResponse.data.appClients?.length
      }

      this.state.find(item => item.id.value === updatedResponse.data.id)?.set(appSourceDto);


      return Promise.resolve(appSourceDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * // TODO: implement as needed
   */
  async sendDelete(toDelete: AppSourceDetailsFlat): Promise<void> {
    throw new Error('Not yet implemented');
  }

  convertRowDataToEditableData(rowData: AppSourceDto): Promise<AppSourceDetailsFlat> {
    if (rowData.id == null || rowData.id.trim().length <= 0) {
      return Promise.reject(new Error('App Source ID must be defined'));
    }

    const appSourceDetails = this.appSourceApi.getAppSourceDetails(rowData.id);

    const result = appSourceDetails.then(response => {
      const convertedToFlat: AppSourceDetailsFlat = this.convertToFlat(response.data);

      return convertedToFlat;
    });

    return result;
  }

  convertAppClientUserPrivsToFlat(appClientPrivDtos: Array<AppClientUserPrivDto>): Array<AppClientUserPrivFlat> {
    const flats: Array<AppClientUserPrivFlat> = [];

    for (const dto of appClientPrivDtos) {
      const convertedFlat = this.convertAppClientUserPrivToFlat(dto);
      flats.push(convertedFlat);
    }

    return flats;
  }

  convertAppClientUserPrivToFlat(appClientPrivDto: AppClientUserPrivDto): AppClientUserPrivFlat {
    const privileges = accessPrivilegeState().createPrivilegesFromIds(appClientPrivDto.privilegeIds ?? []);

    const flat: AppClientUserPrivFlat = {
      appClientUser: appClientPrivDto.appClientUser ?? '',
      appClientUserName: appClientPrivDto.appClientUserName ?? '',
      read: privileges.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
      write: privileges.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
    };

    return flat;
  }

  convertAppClientUserPrivFlatToDto(flat: AppClientUserPrivFlat): AppClientUserPrivDto {
    const readId = accessPrivilegeState().getPrivilegeIdFromType(PrivilegeType.READ);
    const writeId = accessPrivilegeState().getPrivilegeIdFromType(PrivilegeType.WRITE);
    const privilegeIds = [];

    if (flat.read && readId)
      privilegeIds.push(readId);

    if (flat.write && writeId)
      privilegeIds.push(writeId);

    const dto: AppClientUserPrivDto = {
      appClientUser: flat.appClientUser,
      privilegeIds
    };

    return dto;
  }

  convertAppClientUserPrivFlatsToDto(flats: Array<AppClientUserPrivFlat>): Array<AppClientUserPrivDto> {
    const convertedDtos: Array<AppClientUserPrivDto> = [];

    for (const flat of flats) {
      convertedDtos.push(this.convertAppClientUserPrivFlatToDto(flat));
    }

    return convertedDtos;
  }

  convertToDto(flat: AppSourceDetailsFlat): AppSourceDetailsDto {
    const appClientUserPrivDtos = this.convertAppClientUserPrivFlatsToDto(flat.appClients);

    const dto: AppSourceDetailsDto = {
      id: flat.id,
      name: flat.name,
      appClients: this.sanitizeAppClients(appClientUserPrivDtos)
    };

    return dto;
  }

  convertToFlat(dto: AppSourceDetailsDto): AppSourceDetailsFlat {
    const convertedToFlat: AppSourceDetailsFlat = {
      id: dto.id ?? '',
      name: dto.name,
      appClients: this.convertAppClientUserPrivsToFlat(dto.appClients ?? [])
    }

    return convertedToFlat;
  }

  sanitizeAppClients(clientPrivs: AppClientUserPrivDto[]) {
    const sanitized: AppClientUserPrivDto[] = [];
    for (const client of clientPrivs) {
      if (client.privilegeIds.length > 0)
        sanitized.push(client);
    }

    return sanitized;
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
