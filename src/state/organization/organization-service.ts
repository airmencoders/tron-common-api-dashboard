import {DataService} from '../data-service/data-service';
import {OrganizationDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {OrganizationControllerApiInterface} from '../../openapi';

export default class OrganizationService implements DataService<OrganizationDto, OrganizationDto> {

  constructor(public state: State<OrganizationDto[]>, private orgApi: OrganizationControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<OrganizationDto[]> {
    try {
      const orgResponse = await this.orgApi.getOrganizations();
      this.state.set(orgResponse.data);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  getDtoForRowData(rowData: OrganizationDto): Promise<OrganizationDto> {
    return Promise.resolve(rowData);
  }

  async sendCreate(toCreate: OrganizationDto): Promise<OrganizationDto> {
    try {
      const orgResponse = await this.orgApi.createOrganization(toCreate);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendUpdate(toUpdate: OrganizationDto): Promise<OrganizationDto> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Organization to update has undefined id.'));
      }
      const orgResponse = await this.orgApi.updateOrganization(toUpdate.id, toUpdate);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
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
