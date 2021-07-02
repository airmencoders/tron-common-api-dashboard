import {none, State} from '@hookstate/core';
import { OrganizationControllerApiInterface, PersonControllerApiInterface } from '../../openapi';
import { FilterCondition, FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto, JsonPatchObjectArrayValue, JsonPatchObjectValue, JsonPatchStringArrayValue, JsonPatchStringValue, JsonPatchStringValueOpEnum, OrganizationDto, PersonDto } from '../../openapi/models';
import {AbstractDataService} from '../data-service/abstract-data-service';
import {OrganizationDtoWithDetails, PersonWithDetails} from './organization-state';
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';
import isEqual from 'fast-deep-equal';
import { createJsonPatchOp, getDataItemDuplicates, getDataItemNonDuplicates, mapDataItemsToStringIds, mergeDataToState } from '../data-service/data-service-utils';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { convertAgGridSortToQueryParams, generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { GridFilter } from '../../components/Grid/grid-filter';
import { AgGridFilterConversionError } from '../../utils/Exception/AgGridFilterConversionError';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { PatchResponse } from '../data-service/patch-response';
import { OrganizationPatchRequestType } from './organization-patch-request-type';
import { ResponseType } from '../data-service/response-type';
import { OrganizationEditState } from '../../pages/Organization/organization-edit-state';
import { OrganizationChooserDataType } from './organization-chooser-data-type';
import ItemChooser from '../../components/ItemChooser/ItemChooser';

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
        responseData = await this.orgApi.getOrganizationsWrapped(undefined, undefined, undefined, "id,firstName,lastName", "id,name", page, limit, sort)
          .then(resp => {  
            
            // what we really get is an OrganizationWithDetails since we specified people and org fields to return
            //  but here we take what we need from it and conform it to the "shape" of an OrganizationDto
            return resp.data.data.map((item : any) => { 
              return {...item, 
                leader: `${item.leader?.firstName ?? ''} ${item.leader?.lastName ?? ''}`.trim(),  // build leader name
                members: item.members?.map((member : any) => member.id),  // just grab member id as it normally would be returned
                subordinateOrganizations: item.subordinateOrganizations?.map((org : any) => org.id), // just take id here
                parentOrganization: item.parentOrganization?.name ?? '',  // take parent org name             
              } as OrganizationDto; 
            });
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

  async fetchAndStorePersonChooserPaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<PersonDto[]> {
    if (filter != null && !this.filterValidate(filter)) {
      throw TypeValidation.validationError('FilterDto');
    }

      /**
       * If the filter or sort changes, purge the state to start fresh.
       * Set filter to the new value
       */
      if (!isEqual(this.personChooserFilter, filter) || this.personChooserSort != sort) {
        this.personChooserState.set([]);
        this.personChooserFilter = filter;
        this.personChooserSort = sort;
      }

      let personResponseData: PersonDto[] = [];
      try {
        if (filter != null) {
          personResponseData = await this.personApi.filterPerson(filter, false, false, page, limit, sort)
            .then(resp => {
              return resp.data.data;
            });

        } else {
          personResponseData = await this.personApi.getPersonsWrapped(false, false, page, limit, sort)
            .then(resp => {
              return resp.data.data;
            });
        }
      } catch (err) {
        throw err;
      }

      mergeDataToState(this.personChooserState, personResponseData, checkDuplicates);

      return personResponseData;

  }

  async fetchAndStoreOrganizationChooserPaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<OrganizationDto[]> {
    if (filter != null && !this.filterValidate(filter)) {
      throw TypeValidation.validationError('FilterDto');
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

    let organizationResponseData: OrganizationDto[] = [];

    try {
      if (filter != null) {
        organizationResponseData = await this.orgApi.filterOrganizations(filter, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      } else {
        organizationResponseData = await this.orgApi.getOrganizationsWrapped(undefined, undefined, undefined, undefined, undefined, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      }
    } catch (err) {
      throw err;
    }

    mergeDataToState(this.organizationChooserState, this.removeUnfriendlyAgGridData(organizationResponseData), checkDuplicates);

    return organizationResponseData;
  }

  createDatasource(type: OrganizationChooserDataType, idsToExclude?: string[], infiniteScrollOptions?: InfiniteScrollOptions) {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);

          const filter = new GridFilter(params.filterModel);

          // Generate extra filters that excludes items that already exist
          const filterConditions: FilterCondition[] = [];
          idsToExclude?.forEach(id => {
            filterConditions.push({
              operator: FilterConditionOperatorEnum.NotEquals,
              value: id
            });
          });

          filter.addMultiFilter('id', FilterCriteriaRelationTypeEnum.And, filterConditions);

          const sort = convertAgGridSortToQueryParams(params.sortModel);

          let data: any[] = [];

          if (type === OrganizationChooserDataType.PERSON) {
            data = await this.fetchAndStorePersonChooserPaginatedData(page, limit, true, filter.getFilterDto(), sort);
          } else {
            data = await this.fetchAndStoreOrganizationChooserPaginatedData(page, limit, true, filter.getFilterDto(), sort);
          }

          let lastRow = -1;

          /**
           * If the request returns data with length of 0, then
           * there is no more data to be retrieved.
           * 
           * If the request returns data with length less than the limit,
           * then that is the last page.
           */
          if (data.length == 0 || data.length < limit)
            lastRow = type === OrganizationChooserDataType.PERSON ? this.personChooserState.length : this.organizationChooserState.length;

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
      // fetch selected org's detailed info through use of query params
      // this causes the response to match OrganizationDtoWithDetails
      const details = await this.orgApi.getOrganization(id, false, "id,firstName,lastName", "id,name");
      return Promise.resolve(details.data as OrganizationDtoWithDetails);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async sendCreate(toCreate: OrganizationDtoWithDetails): Promise<OrganizationDto> {
    const toCreateDto: OrganizationDto = this.convertOrgDetailsToDto(toCreate);

    try {
      const orgResponse = await this.orgApi.createOrganization(toCreateDto);

      const newOrg = this.removeUnfriendlyAgGridDataSingle(orgResponse.data);

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
    if (toUpdate?.id == null) {
      return Promise.reject(new Error('Organization to update has undefined id.'));
    }

    try {
      const jsonPatchOperations: Array<JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue> = [];
      if (toUpdate.name) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/name', toUpdate.name)); }
      if (toUpdate.orgType) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/orgType', toUpdate.orgType)); }
      if (toUpdate.branchType) { jsonPatchOperations.push(createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/branchType', toUpdate.branchType)); }

      const orgResponse = await this.orgApi.jsonPatchOrganization(toUpdate.id, jsonPatchOperations);

      const patchedOrg = this.removeUnfriendlyAgGridDataSingle(orgResponse.data);
      
      const index = this.state.get().findIndex(item => item.id === patchedOrg.id);
      this.state[index].set(patchedOrg);

      return Promise.resolve(orgResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Compares the original object to the updated object to generate the necessary json patch operations.
   * @param original the original object
   * @param toUpdate the updated object
   * @param toPatch extra fields to compare
   * @returns list of json patch operations
   */
  private createJsonPatch(original: OrganizationDtoWithDetails, toUpdate: OrganizationDtoWithDetails, toPatch: OrganizationEditState): Array<JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue> {
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

    return jsonPatchOperations;
  }

  /**
   * Creates the appropriate json patch request. Also sends requests for subordinate organization and member changes.
   * Depending on the changes, multiple requests may be made.
   * 
   * @param original the original object
   * @param toUpdate the object containing updates
   * @param toPatch extra fields to check
   * @returns response containing status of the requests
   */
  async sendPatch(original: OrganizationDtoWithDetails, toUpdate: OrganizationDtoWithDetails, toPatch: OrganizationEditState): Promise<PatchResponse<OrganizationDto>> {
    if (toUpdate.id == null) {
      return Promise.reject(new Error('Organization to update has undefined id.'));
    }

    /**
     * Will contains all of the requests that are sent to patch
     * the organization for update.
     */
    const requests: Promise<any>[] = [];
    /**
     * Keep track of the indexes for the requests that are made
     * to help differentiate the messages on failure of any request.
     */
    const requestMap: Map<number, OrganizationPatchRequestType> = new Map();

    this.createJsonPatchRequests(original, toUpdate, toPatch, requests, requestMap);

    const data = await Promise.allSettled(requests);
    const failures = data.some(request => request.status === 'rejected');
    const errors: Error[] = [];
    data.forEach((value, idx) => {
      if (value.status === 'fulfilled')
        return;

      const requestType = requestMap.get(idx);
      switch (requestType) {
        case OrganizationPatchRequestType.JSON_PATCH: {
          errors.push(value.reason);
          break;
        }

        case OrganizationPatchRequestType.MEMBERS_ADD: {
          errors.push(value.reason);
          break;
        }

        case OrganizationPatchRequestType.MEMBERS_REMOVE: {
          errors.push(value.reason);
          break;
        }

        case OrganizationPatchRequestType.SUB_ORG_ADD: {
          errors.push(value.reason);
          break;
        }

        case OrganizationPatchRequestType.SUB_ORG_REMOVE: {
          errors.push(value.reason);
          break;
        }

        default:
          break;
      }
    });

    if (failures) {
      // Complete failure
      if (data.every(request => request.status === 'rejected')) {
        const response: PatchResponse<OrganizationDto> = {
          type: ResponseType.FAIL,
          errors
        }
        return Promise.reject(response);
      }

      // Partial failure
      return Promise.resolve({
        type: ResponseType.PARTIAL,
        errors,
        data: this.convertOrgDetailsToDto(toUpdate)
      });
    }

    // Success
    return Promise.resolve({
      type: ResponseType.SUCCESS,
      data: this.convertOrgDetailsToDto(toUpdate)
    });
  }

  /**
   * 
   * Generates all of the necessary requests that need to be made to PATCH an Organization.
   * Only the requests that are necessary to update an organization will be performed.
   * 
   * @param originalOrg the original organization being updated
   * @param updatedOrg the updated organization
   * @param patchState the extended state to generate patch operations
   * @param listOfRequests the list of requests that will be made
   * @param mapOfRequests the map that maps the index of a request in listOfRequests to its patch request type
   * 
   * @throws throws error if the updated organzation does not contain an ID
   */
  createJsonPatchRequests(originalOrg: OrganizationDtoWithDetails, updatedOrg: OrganizationDtoWithDetails, patchState: OrganizationEditState, listOfRequests: Promise<any>[], mapOfRequests: Map<number, OrganizationPatchRequestType>): void {
    const jsonPatchOperations: Array<JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue> = this.createJsonPatch(originalOrg, updatedOrg, patchState);

    if (updatedOrg.id == null) {
      throw new Error('Organization to update has undefined id.');
    }

    /**
     * Check to find only removals that exist in the original. If it does not exist
     * in the original, then there's no need to add it to the request for removal.
     */
    let subOrgsToRemove: string[] = [];
    if (originalOrg.subordinateOrganizations != null) {
      subOrgsToRemove = getDataItemDuplicates(originalOrg.subordinateOrganizations, patchState.subOrgs.toRemove);
    }

    let membersToRemove: string[] = [];
    if (originalOrg.members != null) {
      membersToRemove = getDataItemDuplicates(originalOrg.members, patchState.members.toRemove);
    }

    /**
     * Check to find only additions that does not exist in the original. If they already
     * exist in the original, they do not need to be included in the request for addition.
     */
    let subOrgsToAdd: string[] = [];
    if (originalOrg.subordinateOrganizations != null) {
      subOrgsToAdd = getDataItemNonDuplicates(originalOrg.subordinateOrganizations, patchState.subOrgs.toAdd);
    } else {
      subOrgsToAdd = mapDataItemsToStringIds(patchState.subOrgs.toAdd);
    }

    let membersToAdd: string[] = [];
    if (originalOrg.members != null) {
      membersToAdd = getDataItemNonDuplicates(originalOrg.members, patchState.members.toAdd);
    } else {
      membersToAdd = mapDataItemsToStringIds(patchState.members.toAdd);
    }

    if (jsonPatchOperations.length > 0) {
      listOfRequests.push(this.orgApi.jsonPatchOrganization(updatedOrg.id, jsonPatchOperations));
      mapOfRequests.set(listOfRequests.length - 1, OrganizationPatchRequestType.JSON_PATCH);
    }

    if (subOrgsToRemove.length > 0) {
      listOfRequests.push(this.orgApi.removeSubordinateOrganization(updatedOrg.id, subOrgsToRemove));
      mapOfRequests.set(listOfRequests.length - 1, OrganizationPatchRequestType.SUB_ORG_REMOVE);
    }

    if (subOrgsToAdd.length > 0) {
      listOfRequests.push(this.orgApi.addSubordinateOrganization(updatedOrg.id, subOrgsToAdd));
      mapOfRequests.set(listOfRequests.length - 1, OrganizationPatchRequestType.SUB_ORG_ADD);
    }

    if (membersToRemove.length > 0) {
      listOfRequests.push(this.orgApi.deleteOrganizationMember(updatedOrg.id, membersToRemove));
      mapOfRequests.set(listOfRequests.length - 1, OrganizationPatchRequestType.MEMBERS_REMOVE);
    }

    if (membersToAdd.length > 0) {
      listOfRequests.push(this.orgApi.addOrganizationMember(updatedOrg.id, membersToAdd));
      mapOfRequests.set(listOfRequests.length - 1, OrganizationPatchRequestType.MEMBERS_ADD);
    }
  }

  /**
   * Converts an organization dto with details to OrganizationDto
   * 
   * @param withDetails organization dto with details
   * @returns {OrganizationDto} object converted to OrganizationDto
   */
  convertOrgDetailsToDto(withDetails: OrganizationDtoWithDetails): OrganizationDto {
    return {
      id: withDetails.id,
      leader: withDetails.leader?.id,
      members: withDetails.members?.flatMap(member => member.id != null ? member.id : []),
      parentOrganization: withDetails.parentOrganization?.id,
      subordinateOrganizations: withDetails.subordinateOrganizations?.flatMap(org => org.id != null ? org.id : []),
      name: withDetails.name,
      orgType: withDetails.orgType,
      branchType: withDetails.branchType
    };
  }

  async sendDelete(toDelete: OrganizationDtoWithDetails): Promise<void> {
    try {
      const orgResponse = await this.orgApi.deleteOrganization(toDelete.id || '');

      this.state.find(item => item.id.get() === toDelete.id)?.set(none);

      return orgResponse.data;
    }
    catch (error) {
      return error;
    }
  }
}
