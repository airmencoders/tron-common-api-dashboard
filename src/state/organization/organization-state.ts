import {createState, State, useState} from '@hookstate/core';
import { OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, PersonDto } from '../../openapi/models';
import { Configuration, OrganizationControllerApi, OrganizationControllerApiInterface, PersonControllerApi, PersonControllerApiInterface } from '../../openapi';
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

const organizationApi: OrganizationControllerApiInterface = new OrganizationControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

const organizationChooserState = createState<OrganizationDto[]>(new Array<OrganizationDto>());

const personChooserState = createState<PersonDto[]>(new Array<PersonDto>());

const personApi: PersonControllerApiInterface = new PersonControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
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
  organizationChooserState,
  personChooserState,
  personApi
);
