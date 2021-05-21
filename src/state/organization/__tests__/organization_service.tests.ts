// test if catch needs to be added to promise chain for fetchAndStore
import OrganizationService, { OrgEditOpType } from '../organization-service';
import {createState} from '@hookstate/core';
import { Flight, Group, OrganizationControllerApi, OrganizationDto, OrganizationDtoPaginationResponseWrapper, OtherUsaf, Squadron, Wing } from '../../../openapi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { OrganizationDtoWithDetails } from '../organization-state';

class MockOrgApi extends OrganizationControllerApi {
  getOrganizationsWrapped(type?: "SQUADRON" | "GROUP" | "FLIGHT" | "WING" | "OTHER_USAF" | "ORGANIZATION",
                   branch?: "OTHER" | "USA" | "USAF" | "USMC" | "USN" | "USSF" | "USCG", search?: string,
                   people?: string, organizations?: string, page?: number, limit?: number, options?: any):
    Promise<AxiosResponse<OrganizationDtoPaginationResponseWrapper>> {

    const orgs : OrganizationDto[] = [ {id: '2a27a3a3-22b6-4dcb-9bd7-a9ce16b742d4', name: 'test' } ];
    const response : AxiosResponse = {
      data: { data: orgs },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosRequestConfig,
    };
    return Promise.resolve(response);
  }


  getOrganization(id?: string, flatten?: boolean, people?: string, organizations?: string, options?: any):
      Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
  }

  genericFunctionThatReturnsReponse() : Promise<AxiosResponse<OrganizationDto>> {
    const orgs : OrganizationDto = {id: '2a27a3a3-22b6-4dcb-9bd7-a9ce16b742d4', name: 'test' };
    const response : AxiosResponse = {
      data: orgs,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosRequestConfig,
    };
    return Promise.resolve(response);
  }

  patchOrganization1(id?: string, requestBody?: { [key: string]: string; }, options?: any)
      : Promise<AxiosResponse<OrganizationDto>> {

    return this.genericFunctionThatReturnsReponse();
  }

  createOrganization(organizationDtoFlightGroupOtherUsafSquadronWing: OrganizationDto | Flight | Group | OtherUsaf | Squadron | Wing, options?: any) {
    return this.genericFunctionThatReturnsReponse();
  }

  deleteOrgLeader(id?: string): Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
  }

  deleteOrgParent(id?: string): Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
  }

  removeSubordinateOrganization(id?: string, requestBody? : string[], options?: any)
    : Promise<AxiosResponse<void>>{
      return {} as Promise<AxiosResponse<void>>;
  }

  addSubordinateOrganization(id?: string, requestBody? : string[], options?: any)
    : Promise<AxiosResponse<void>>{
      return {} as Promise<AxiosResponse<void>>;
  }

  deleteOrganizationMember(id?: string, requestBody? : string[], options?: any)
  : Promise<AxiosResponse<void>>{
    return {} as Promise<AxiosResponse<void>>;
  }

  addOrganizationMember(id?: string, requestBody? : string[], options?: any)
  : Promise<AxiosResponse<void>>{
    return {} as Promise<AxiosResponse<void>>;
  }

  deleteOrganization(id: string, options?: any): Promise<AxiosResponse<void>> {
    return Promise.resolve({
      data: undefined,
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    });
  }
}

describe('Test OrganizationService', () => {

  it('get all organizations', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.fetchAndStoreData();
    expect(response).toHaveLength(1);
  });

  it('get single organization', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
      createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.getOrgDetails('some id');
    expect(response).toBeTruthy();
  });

  it('send Create', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendCreate({ id: 'some id'} as OrganizationDto);
    expect(response).toBeTruthy();
  });

  it('should not allow incorrectly formatted orgs to be sent', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    await expect(organizationService.sendCreate({ badParam: 'some id'} as OrganizationDto))
        .rejects
        .toThrowError();
  });

  it('send Update', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendUpdate({ id: 'some id'} as OrganizationDto);
    expect(response).toBeTruthy();
  });

  it('sets Leader', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.LEADER_EDIT, 'some id', 'some id');
    expect(response).toBeTruthy();
  });

  it('removes Leader', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.LEADER_REMOVE, 'some id');
    expect(response).toBeTruthy();
  });

  it('adds member', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.MEMBERS_EDIT, 'some id', 'some id');
    expect(response).toBeTruthy();
  });


  it('removes member', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.MEMBERS_REMOVE, 'some id', ['some id']);
    expect(response).toBeTruthy();
  });

  it('adds subordinate org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.SUB_ORGS_EDIT, 'some id', 'some id');
    expect(response).toBeTruthy();
  });

  it('removes subordinate org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.SUB_ORGS_REMOVE, 'some id', ['some id']);
    expect(response).toBeTruthy();
  });

  it('adds parent org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.PARENT_ORG_EDIT, 'some id', 'some id');
    expect(response).toBeTruthy();
  });

  it('removes parent org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendPatch(OrgEditOpType.PARENT_ORG_REMOVE, 'some id', ['some id']);
    expect(response).toBeTruthy();
  });

  it('deletes an org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        createState<OrganizationDtoWithDetails>({}),
        new MockOrgApi());

    const response = await organizationService.sendDelete({ id: 'some id', name: 'some org' });
    expect(response).toBe(undefined);
  });

});
