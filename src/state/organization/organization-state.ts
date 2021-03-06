import {createState, State, useState} from '@hookstate/core';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../openapi/models';
import { OrganizationControllerApi, OrganizationControllerApiInterface, PersonControllerApi, PersonControllerApiInterface } from '../../openapi';
import OrganizationService from './organization-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

export interface PersonWithDetails {
  id?: string,
  firstName?: string,
  lastName?: string,
}

export interface OrgWithDetails {
  id?: string,
  name: string,
}

export interface OrganizationDtoWithDetails {
  id?: string;
  leader?: PersonWithDetails;
  members?: Array<PersonWithDetails>;
  parentOrganization?: OrgWithDetails;
  subordinateOrganizations?: Array<OrgWithDetails>;
  name: string;
  orgType?: OrganizationDtoOrgTypeEnum;
  branchType?: OrganizationDtoBranchTypeEnum;
}

const organizationState = createState<OrganizationDto[]>(new Array<OrganizationDto>());

const organizationApi: OrganizationControllerApiInterface = new OrganizationControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

const organizationChooserGlobalState = createState<OrganizationDto[]>(new Array<OrganizationDto>());

const personChooserGlobalState = createState<PersonDto[]>(new Array<PersonDto>());

const personControllerApi: PersonControllerApiInterface = new PersonControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (
  state: State<OrganizationDto[]>, 
  orgApi: OrganizationControllerApiInterface,
  organizationChooserState: State<OrganizationDto[]>,
  personChooserState: State<PersonDto[]>,
  personApi: PersonControllerApiInterface) => {
  return new OrganizationService(state, orgApi, organizationChooserState, personChooserState, personApi);
}
export const useOrganizationState = () => wrapState(
  useState(organizationState), 
  organizationApi,
  organizationChooserGlobalState,
  personChooserGlobalState,
  personControllerApi
);
