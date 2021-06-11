import {none, State} from '@hookstate/core';
import {OrganizationControllerApiInterface} from '../../openapi';
import { FilterDto, OrganizationDto } from '../../openapi/models';
import {AbstractDataService} from '../data-service/abstract-data-service';
import {OrganizationDtoWithDetails} from './organization-state';
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';
import isEqual from 'fast-deep-equal';

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

export default class OrganizationService extends AbstractDataService<OrganizationDto, OrganizationDto> {

  private readonly validate: ValidateFunction<OrganizationDto>;
  private readonly filterValidate: ValidateFunction<FilterDto>;

  constructor(
      public state: State<OrganizationDto[]>,
      public selectedOrgState: State<OrganizationDtoWithDetails>,
      private orgApi: OrganizationControllerApiInterface) {
    super(state);
    this.validate = TypeValidation.validatorFor<OrganizationDto>(ModelTypes.definitions.OrganizationDto);
    this.filterValidate = TypeValidation.validatorFor<FilterDto>(ModelTypes.definitions.FilterDto);
  }

  async fetchAndStoreData(): Promise<OrganizationDto[]> {
    try {
      const orgDataResponse = await this.orgApi.getOrganizationsWrapped();
      const orgData = orgDataResponse.data.data;
      const mappedData = this.removeUnfriendlyAgGridData(orgData);
      this.state.set(mappedData);
      return Promise.resolve(orgData);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
  * Keeps track of changes to the filter
  */
  private filter?: FilterDto;

  /**
  * Keeps track of changes to the sort
  */
  private sort?: string[];

  async fetchAndStorePaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<OrganizationDto[]> {


    /**
     * If the filter or sort changes, purge the state to start fresh.
     * Set filter to the new value
     */
    if (!isEqual(this.filter, filter) || this.sort != sort) {
      this.state.set([]);
      this.filter = filter;
      this.sort = sort;
    }

    let responseData: OrganizationDto[] = [];

    try {
      if (filter != null && Object.keys(filter).length > 0) {
        if (!this.filterValidate(filter)) {
          throw TypeValidation.validationError('FilterDto');
        }
        
        responseData = await this.orgApi.filterOrganizations(filter, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      } else {
        responseData = await this.orgApi.getOrganizationsWrapped(undefined, undefined, undefined, undefined, undefined, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      }
    } catch (err) {
      throw err;
    }

    this.mergeDataToState(responseData, checkDuplicates);

    return responseData;
  }

  /**
   * Due to Hookstate and Ag Grid interaction, some fields cause Hookstate to error.
   * Remove those fields here.
   *
   * @param data the data to remove fields from
   * @returns the data with fields removed
   */
  removeUnfriendlyAgGridData(data: OrganizationDto[]): Array<OrganizationDto> {
    return data.map(org => {
      org.members = undefined;
      org.subordinateOrganizations = undefined;
      return org;
    });
  }

  async convertRowDataToEditableData(rowData: OrganizationDto): Promise<OrganizationDto> {
    const { id } = rowData;
    if (!id) {
      return Promise.reject(new Error('Organization ID must be defined'));
    }

    try {
      // fetch selected org's detailed info
      await this.getOrgDetails(id);
      return Promise.resolve(Object.assign({}, rowData));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async sendCreate(toCreate: OrganizationDto): Promise<OrganizationDto> {
    if(!this.validate(toCreate)) {
      throw TypeValidation.validationError('OrganizationDto');
    }
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
    if(!this.validate(toUpdate)) {
      throw TypeValidation.validationError('OrganizationDto');
    }
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

      const item = this.state.find(item => item.id.get() === toDelete.id);
      if (item)
        item.set(none);

      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }
}
