import {createState, State, useState} from '@hookstate/core';
import {OrganizationDto} from '../../openapi/models';
import {Configuration, OrganizationControllerApi, OrganizationControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import OrganizationService from './organization-service';

const organizationState = createState<OrganizationDto[]>(new Array<OrganizationDto>());

const organizationApi: OrganizationControllerApiInterface = new OrganizationControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<OrganizationDto[]>, orgApi: OrganizationControllerApiInterface) => {
  return new OrganizationService(state, orgApi);
}

export const useOrganizationState = () => wrapState(useState(organizationState), organizationApi);
