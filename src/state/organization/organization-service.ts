import { State } from '@hookstate/core';
import { OrganizationControllerApiInterface } from '../../openapi';
import { OrganizationDto } from '../../openapi/models';
import { DataService } from '../data-service/data-service';

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

  /**
   * Update non-collections fields - we can't just PUT over the old organization
   * since we can't send collection of UUIDs for those fields so that leaves really just
   * name, branch, and type
   * @param toUpdate
   */
  async sendUpdate(toUpdate: OrganizationDto): Promise<OrganizationDto> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Organization to update has undefined id.'));
      }

      let orgFeatures = {};
      if (toUpdate.name) { orgFeatures = {...orgFeatures, name: toUpdate.name }; }
      if (toUpdate.orgType) { orgFeatures = {...orgFeatures, orgType: toUpdate.orgType }; }
      if (toUpdate.branchType) { orgFeatures = {...orgFeatures, branchType: toUpdate.branchType }; }

      const orgResponse = await this.orgApi.patchOrganization(toUpdate.id, orgFeatures);
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

  /**
   * Removes organization leader to no one
   * @param orgId org id to update
   * @returns transaction response or the error it raised
   */
    async removeLeader(orgId: string): Promise<any> {
      try {  
          const orgResponse = await this.orgApi.deleteOrgLeader(orgId);
          return orgResponse.data;
      }
      catch (error) {
        return error;
      }
    }

  /**
   * Patch updates an org's members with an additional person
   * @param orgId org UUID to patch
   * @param id UUID of the person to add
   * @returns transaction response or the error it raised
   */
   async addMember(orgId: string, id: string): Promise<any> {
    try {
      const orgResponse = await this.orgApi.addOrganizationMember(orgId, [id]);
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }

  /**
   * Patch updates an org's members with an additional subordinate organization
   * @param orgId org UUID to patch
   * @param id UUID of the org to add
   * @returns transaction response or the error it raised
   */
   async addSubOrg(orgId: string, id: string): Promise<any> {
    try {
      const orgResponse = await this.orgApi.addSubordinateOrganization(orgId, [id]);
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }

  /**
   * Remove an org's member(s)
   * @param orgId org UUID to patch
   * @param id UUID of the person(s) to remove
   * @returns transaction response or the error it raised
   */
   async removeMember(orgId: string, ids: string[]): Promise<any> {
    try {
      const orgResponse = await this.orgApi.deleteOrganizationMember(orgId, ids);
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }

  /**
   * Remove an org's subordinate organization(s)
   * @param orgId org UUID to patch
   * @param id UUID of the orgs(s) to remove
   * @returns transaction response or the error it raised
   */
   async removeSubOrg(orgId: string, ids: string[]): Promise<any> {
    try {
      const orgResponse = await this.orgApi.removeSubordinateOrganization(orgId, ids);
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }
  
  async sendDelete(toDelete: OrganizationDto): Promise<void> {
    try {
      const orgResponse = await this.orgApi.deleteOrganization(toDelete.id || '');
      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

}
