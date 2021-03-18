import {createState, State, useState} from '@hookstate/core';
import {OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum} from '../../openapi/models';
import {Configuration, OrganizationControllerApi, OrganizationControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import OrganizationService from './organization-service';

export interface PersonWithDetails {
  id?: string,
  firstName?: string,
  lastName?: string,
}

export interface OrgWithDetails {
  id?: string,
  name?: string,
}

export interface OrganizationDtoWithDetails {
  id?: string;
  leader?: PersonWithDetails;
  members?: Array<PersonWithDetails>;
  parentOrganization?: OrgWithDetails;
  subordinateOrganizations?: Array<OrgWithDetails>;
  name?: string;
  orgType?: OrganizationDtoOrgTypeEnum;
  branchType?: OrganizationDtoBranchTypeEnum;
}

const organizationState = createState<OrganizationDto[]>(new Array<OrganizationDto>());

// this holds the selected org we're editing/updating
const selectedOrganizationState = createState<OrganizationDtoWithDetails>({} as OrganizationDtoWithDetails);

const organizationApi: OrganizationControllerApiInterface = new OrganizationControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  state: State<OrganizationDto[]>, 
  selectedOrgState: State<OrganizationDtoWithDetails>,
  orgApi: OrganizationControllerApiInterface) => {
    return new OrganizationService(state, selectedOrgState, orgApi);
}
export const useOrganizationState = () => wrapState(
  useState(organizationState), 
  useState(selectedOrganizationState), 
  organizationApi
);
