import {DataService} from '../data-service/data-service';
import {OrganizationDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {OrganizationControllerApiInterface} from '../../openapi';

export default class OrganizationService implements DataService<OrganizationDto, OrganizationDto> {

  constructor(
    public state: State<OrganizationDto[]>, 
    private orgApi: OrganizationControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<OrganizationDto[]> {
    try {
      const orgDataResponse = await this.orgApi.getOrganizations();
      const orgData = orgDataResponse.data;
      const mappedData = orgData.map((org) => {

        // undef the collection-type fields because of the ag-grid bug
        //  with hookState and collections (we're not displaying them anyways)
        org.members = undefined;
        org.subordinateOrganizations = undefined;
        return org;
      });
      this.state.set(mappedData);      
      return Promise.resolve(orgData);
    }
    catch (error) {
      return Promise.reject(error);
    }
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

  /**
   * Gets organization by id and requests that the people/org type fields be further
   * resolved to readable information via the query parameters
   * @param id org UUID to fetch
   * @returns a JSON structure with requested fields (hence, the <any> return)
   */
  async getOrgDetails(id: string): Promise<any> {
    try {
      const orgResponse = await this.orgApi.getOrganization(id, false, "id,firstName,lastName", "id,name");
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }

  /**
   * Patch updates an org's leader by UUID
   * @param orgId org UUID to patch
   * @param id UUID of the person to make the leader
   * @returns transaction response or the error it raised
   */
  async updateLeader(orgId: string, id: string): Promise<any> {
    try {
      const orgResponse = await this.orgApi.patchOrganization(orgId, { leader: id });
      return orgResponse.data;
    }
    catch (error) {
      return error;
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
