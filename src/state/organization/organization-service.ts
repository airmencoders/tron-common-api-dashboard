import {none, State} from '@hookstate/core';
import { OrganizationControllerApiInterface, PersonControllerApiInterface } from '../../openapi';
import { FilterCondition, FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto, JsonPatchObjectArrayValue, JsonPatchObjectValue, JsonPatchStringArrayValue, JsonPatchStringValue, JsonPatchStringValueOpEnum, OrganizationDto, PersonDto } from '../../openapi/models';
import {AbstractDataService} from '../data-service/abstract-data-service';
import {OrganizationDtoWithDetails} from './organization-state';
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';
import isEqual from 'fast-deep-equal';
import { createJsonPatchOp, mergeDataToState } from '../data-service/data-service-utils';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { convertAgGridSortToQueryParams, generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { GridFilter } from '../../components/Grid/grid-filter';
import { AgGridFilterConversionError } from '../../utils/Exception/AgGridFilterConversionError';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { OrganizationEditState } from '../../pages/Organization/OrganizationEditForm';

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

export default class OrganizationService extends AbstractDataService<OrganizationDto, OrganizationDtoWithDetails> {

  private readonly validate: ValidateFunction<OrganizationDto>;
  private readonly filterValidate: ValidateFunction<FilterDto>;

  constructor(
      public state: State<OrganizationDto[]>,
    private orgApi: OrganizationControllerApiInterface,
    public organizationChooserState: State<OrganizationDto[]>,
    public personChooserState: State<PersonDto[]>,
    private personApi: PersonControllerApiInterface) {
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
    * Keeps track of changes to the filter
    */
  private personChooserFilter?: FilterDto;
  private organizationChooserFilter?: FilterDto;

  /**
  * Keeps track of changes to the sort
  */
  private personChooserSort?: string[];
  private organizationChooserSort?: string[];

  async fetchAndStoreChooserPaginatedData(type: 'organization' | 'person', page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<PersonDto[] | OrganizationDto[]> {
    if (type !== 'organization' && type !== 'person') {
      throw new Error(`${type} is not supported for Chooser data`);
    }

    if (filter != null && !this.filterValidate(filter)) {
      throw TypeValidation.validationError('FilterDto');
    }

    if (type === 'person') {
      /**
       * If the filter or sort changes, purge the state to start fresh.
       * Set filter to the new value
       */
      if (!isEqual(this.personChooserFilter, filter) || this.personChooserSort != sort) {
        this.personChooserState.set([]);
        this.personChooserFilter = filter;
        this.personChooserSort = sort;
      }

      let responseData: PersonDto[] = [];
      try {
        if (filter != null) {
          responseData = await this.personApi.filterPerson(filter, false, false, page, limit, sort)
            .then(resp => {
              return resp.data.data;
            });

        } else {
          responseData = await this.personApi.getPersonsWrapped(false, false, page, limit, sort)
            .then(resp => {
              return resp.data.data;
            });
        }
      } catch (err) {
        throw err;
      }

      mergeDataToState(this.personChooserState, responseData, checkDuplicates);

      return responseData;
    }

    /**
     * If the filter or sort changes, purge the state to start fresh.
     * Set filter to the new value
     */
    if (!isEqual(this.organizationChooserFilter, filter) || this.organizationChooserSort != sort) {
      this.organizationChooserState.set([]);
      this.organizationChooserFilter = filter;
      this.organizationChooserSort = sort;
    }

    let responseData: PersonDto[] = [];

    try {
      if (filter != null) {
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

    mergeDataToState(this.organizationChooserState, this.removeUnfriendlyAgGridData(responseData), checkDuplicates);

    return responseData;
  }

  createDatasource(type: 'organization' | 'person', idsToExclude?: string[], infiniteScrollOptions?: InfiniteScrollOptions) {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);

          const filter = new GridFilter(params.filterModel);

          // Filter out the items that already exist
          const filterConditions: FilterCondition[] = [];
          idsToExclude?.forEach(id => {
            filterConditions.push({
              operator: FilterConditionOperatorEnum.NotEquals,
              value: id
            });
          });

          console.log(idsToExclude);

          filter.addMultiFilter('id', FilterCriteriaRelationTypeEnum.And, filterConditions);

          console.log(filter.getFilterDto())

          const sort = convertAgGridSortToQueryParams(params.sortModel);

          const data = await this.fetchAndStoreChooserPaginatedData(type, page, limit, true, filter.getFilterDto(), sort);

          let lastRow = -1;

          /**
           * If the request returns data with length of 0, then
           * there is no more data to be retrieved.
           * 
           * If the request returns data with length less than the limit,
           * then that is the last page.
           */
          if (data.length == 0 || data.length < limit)
            lastRow = type === 'person' ? this.personChooserState.length : this.organizationChooserState.length;

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           * 
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          if (err instanceof AgGridFilterConversionError) {
            createTextToast(ToastType.ERROR, err.message, { autoClose: false });
            return;
          }

          const requestErr = prepareRequestError(err);

          /**
           * A 400 status with a filter model set means that the server
           * sent back a validation error.
           */
          if (requestErr.status === 400 && params.filterModel != null) {
            createTextToast(ToastType.ERROR, `Failed to filter with error: ${requestErr.message}`, { autoClose: false });
            return;
          }

          /**
           * Server responded with some other response
           */
          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      }
    }

    return datasource;
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

  removeUnfriendlyAgGridDataSingle(data: OrganizationDto): OrganizationDto {
    return this.removeUnfriendlyAgGridData([data])[0];
  }

  async convertRowDataToEditableData(rowData: OrganizationDto): Promise<OrganizationDtoWithDetails> {
    const { id } = rowData;
    if (!id) {
      return Promise.reject(new Error('Organization ID must be defined'));
    }

    try {
      // fetch selected org's detailed info
      const details = await this.getOrgDetails(id);
      return Promise.resolve(details);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async sendCreate(toCreate: OrganizationDtoWithDetails): Promise<OrganizationDto> {
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
  async sendUpdate(toUpdate: OrganizationDtoWithDetails): Promise<OrganizationDto> {
    if(!this.validate(toUpdate)) {
      throw TypeValidation.validationError('OrganizationDto');
    }
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Organization to update has undefined id.'));
      }

      const jsonPatchOperations: Array<JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue> = [];
      if (toUpdate.name) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/name', toUpdate.name)); }
      if (toUpdate.orgType) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/orgType', toUpdate.orgType)); }
      if (toUpdate.branchType) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/branchType', toUpdate.branchType)); }

      const orgResponse = await this.orgApi.jsonPatchOrganization(toUpdate.id, jsonPatchOperations);

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
  async sendPatch(original: OrganizationDto, toUpdate: OrganizationDto, toPatch: OrganizationEditState): Promise<OrganizationDto> {
    if (toUpdate.id == null) {
      throw new Error("Organization ID cannot be null when sending PATCH update.");
    }

    const jsonPatchOperations: Array<JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue> = [];
    if (toUpdate.name !== original.name) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/name', toUpdate.name));
    }

    if (toUpdate.orgType !== original.orgType) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/orgType', toUpdate.orgType));
    }

    if (toUpdate.branchType !== original.branchType) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/branchType', toUpdate.branchType));
    }

    if (toPatch.leader.removed) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Remove, '/leader'));
    } else if (toPatch.leader.newLeader) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/leader', toPatch.leader.newLeader.id));
    }

    if (toPatch.parentOrg.removed) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Remove, '/parentOrganization'));
    } else if (toPatch.parentOrg.newParent) {
      jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/parentOrganization', toPatch.parentOrg.newParent.id));
    }

    try {
      const request = await this.orgApi.jsonPatchOrganization(toUpdate.id, jsonPatchOperations);

      const subOrgsToRemove = toPatch.subOrgs.toRemove.flatMap(org => org.id ? org.id : []);
      if (subOrgsToRemove.length > 0) {
        await this.orgApi.removeSubordinateOrganization(toUpdate.id, subOrgsToRemove);
      }

      const membersToRemove = toPatch.members.toRemove.flatMap(member => member.id ? member.id : []);
      if (membersToRemove.length > 0) {
        await this.orgApi.deleteOrganizationMember(toUpdate.id, membersToRemove);
      }

      const requestData = request.data;

      const sanitizedData = this.removeUnfriendlyAgGridDataSingle(requestData);

      // Update the state
      this.state.find(item => item.id.get() === sanitizedData.id)?.set(sanitizedData);

      return Promise.resolve(requestData);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Gets organization by id and requests that the people/org type fields be further
   * resolved to readable information via the query parameters.  Populates the selectedOrgState
   * @param id org UUID to fetch
   * @returns a JSON structure with requested fields (hence, the <any> return)
   */
  async getOrgDetails(id: string): Promise<OrganizationDtoWithDetails> {
    try {

      // the extra query params causes this response to match signature of an OrganizationDtoWithDetails
      const orgResponse = await this.orgApi.getOrganization(id, false, "id,firstName,lastName", "id,name");

      const data = orgResponse.data as OrganizationDtoWithDetails;
      return Promise.resolve(data);
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

  async sendDelete(toDelete: OrganizationDtoWithDetails): Promise<void> {
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
