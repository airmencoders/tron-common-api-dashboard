import { none, State } from '@hookstate/core';
import { OrganizationControllerApiInterface } from '../../openapi';
import { OrganizationDto } from '../../openapi/models';
import { DataService } from '../data-service/data-service';
import { OrganizationDtoWithDetails } from './organization-state';

// complex parts of the org we can edit -- for now...
export enum OrgEditOpType {
  NONE = 'NONE',
  LEADER_EDIT = 'LEADER_EDIT',
  MEMBERS_EDIT = 'MEMBERS_EDIT',
  SUB_ORGS_EDIT = 'SUB_ORGS_EDIT',
  PARENT_ORG_EDIT = 'PARENT_ORG_EDIT',
  PARENT_ORG_REMOVE = 'PARENT_ORG_REMOVE',
  SUB_ORGS_REMOVE = 'SUB_ORGS_REMOVE',
  MEMBERS_REMOVE = 'MEMBERS_REMOVE',
  LEADER_REMOVE = 'LEADER_REMOVE',
  OTHER = 'OTHER',
}

export default class OrganizationService implements DataService<OrganizationDto, OrganizationDto> {

  constructor(
    public state: State<OrganizationDto[]>, 
    public selectedOrgState: State<OrganizationDtoWithDetails>,
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

  async convertRowDataToEditableData(rowData: OrganizationDto): Promise<OrganizationDto> {
    // fetch selected org's detailed info 
    await this.getOrgDetails(rowData?.id || '')
    return Promise.resolve(Object.assign({}, rowData));
  }

  async sendCreate(toCreate: OrganizationDto): Promise<OrganizationDto> {
    try {
      const orgResponse = await this.orgApi.createOrganization(toCreate);

      const newOrg = orgResponse.data;
      newOrg.members = undefined;
      newOrg.subordinateOrganizations = undefined;
      this.state[this.state.length].set(newOrg);

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

      const orgResponse = await this.orgApi.patchOrganization1(toUpdate.id, orgFeatures);

      const patchedOrg = orgResponse.data;
      patchedOrg.members = undefined;
      patchedOrg.subordinateOrganizations = undefined;
      const index = this.state.get().findIndex(item => item.id === patchedOrg.id);
      this.state[index].set(patchedOrg);
      
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Allows a call to a custom API method (normally a PATCH).  This is called from
   * the DataCrudFormPage component with variable arguments.  First argument should be
   * a way to tell what local method to call within this service, and the rest are the arguments
   * for that method.
   * @param args 
   */
  async sendPatch(...args: any) : Promise<OrganizationDto> {

    try {
      switch (args[0] as OrgEditOpType) {
        case OrgEditOpType.LEADER_EDIT:
          return Promise.resolve(await this.updateLeader(args[1], args[2]));
        case OrgEditOpType.MEMBERS_EDIT:
          return Promise.resolve(await this.addMember(args[1], args[2]));
        case OrgEditOpType.SUB_ORGS_EDIT:
          return Promise.resolve(await this.addSubOrg(args[1], args[2]));
        case OrgEditOpType.PARENT_ORG_EDIT:
          return Promise.resolve(await this.updateParentOrg(args[1], args[2]));
        case OrgEditOpType.PARENT_ORG_REMOVE:
          return Promise.resolve(await this.removeParent(args[1]));
        case OrgEditOpType.SUB_ORGS_REMOVE:
          return Promise.resolve(await this.removeSubOrg(args[1], args[2]));
        case OrgEditOpType.MEMBERS_REMOVE:
          return Promise.resolve(await this.removeMember(args[1], args[2]));
        case OrgEditOpType.LEADER_REMOVE:
          return Promise.resolve(await this.removeLeader(args[1]));
        default: 
          break;
      }
      return Promise.reject(new Error('Invalid Patch Operation'));
    }
    catch (error) {
      return Promise.reject(error);
    }


  }

  /**
   * Gets organization by id and requests that the people/org type fields be further
   * resolved to readable information via the query parameters.  Populates the selectedOrgState
   * @param id org UUID to fetch
   * @returns a JSON structure with requested fields (hence, the <any> return)
   */
  async getOrgDetails(id: string): Promise<any> {
    try {

      // the extra query params causes this response to match signature of an OrganizationDtoWithDetails
      const orgResponse = await this.orgApi.getOrganization(id, false, "id,firstName,lastName", "id,name");
      this.selectedOrgState.set(orgResponse.data as OrganizationDtoWithDetails);      
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Patch updates an org's leader by UUID
   * @param orgId org UUID to patch
   * @param id UUID of the person to make the leader
   * @returns transaction response or the error it raised
   */
  async updateLeader(orgId: string, id: string): Promise<OrganizationDto> {
    try {
      const orgResponse = await this.orgApi.patchOrganization1(orgId, { leader: id });
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);     
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Patch updates an org's parent by UUID
   * @param orgId org UUID to patch
   * @param id UUID of the org to make the parent
   * @returns transaction response or the error it raised
   */
   async updateParentOrg(orgId: string, id: string): Promise<OrganizationDto> {
    try {
      const orgResponse = await this.orgApi.patchOrganization1(orgId, { parentOrganization: id });
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Removes organization leader to no one
   * @param orgId org id to update
   * @returns transaction response or the error it raised
   */
  async removeLeader(orgId: string): Promise<OrganizationDto> {
    try {  
      const orgResponse = await this.orgApi.deleteOrgLeader(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Removes organization parent to no one
   * @param orgId org id to update
   * @returns transaction response or the error it raised
   */
   async removeParent(orgId: string): Promise<OrganizationDto> {
    try {  
      const orgResponse = await this.orgApi.deleteOrgParent(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
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
      await this.orgApi.addOrganizationMember(orgId, [id]);
      const orgResponse = await this.orgApi.getOrganization(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
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
      await this.orgApi.addSubordinateOrganization(orgId, [id]);
      const orgResponse = await this.orgApi.getOrganization(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Remove an org's member(s)
   * @param orgId org UUID to patch
   * @param id UUID of the person(s) to remove
   * @returns transaction response or the error it raised
   */
   async removeMember(orgId: string, ids: string[]): Promise<OrganizationDto> {
    try {
      await this.orgApi.deleteOrganizationMember(orgId, ids);
      const orgResponse = await this.orgApi.getOrganization(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Remove an org's subordinate organization(s)
   * @param orgId org UUID to patch
   * @param id UUID of the orgs(s) to remove
   * @returns transaction response or the error it raised
   */
   async removeSubOrg(orgId: string, ids: string[]): Promise<OrganizationDto> {
    try {
      await this.orgApi.removeSubordinateOrganization(orgId, ids);
      const orgResponse = await this.orgApi.getOrganization(orgId);
      await this.getOrgDetails(orgId);
      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  
  async sendDelete(toDelete: OrganizationDto): Promise<void> {
    try {
      const orgResponse = await this.orgApi.deleteOrganization(toDelete.id || '');
      
      // easiest way to refresh the data table than interfacing with proxy
      //await this.fetchAndStoreData();

      const item = this.state.find(item => item.id.get() === toDelete.id);
      if (item)
        item.set(none);

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
