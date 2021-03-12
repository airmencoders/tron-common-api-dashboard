import {DataService} from '../data-service/data-service';
import {OrganizationDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {OrganizationControllerApiInterface} from '../../openapi';

export default class OrganizationService implements DataService<OrganizationDto, OrganizationDto> {

  constructor(public state: State<OrganizationDto[]>, private orgApi: OrganizationControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<OrganizationDto[]> {
    const orgResponsePromise = this.orgApi.getOrganizations()
        .then(resp => {
          return resp.data;
        });
    this.state.set(orgResponsePromise);
    return Promise.resolve(orgResponsePromise);
  }

  convertRowDataToEditableData(rowData: OrganizationDto): Promise<OrganizationDto> {
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

  async sendDelete(toDelete: OrganizationDto): Promise<void> {
    return Promise.resolve();
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

}
