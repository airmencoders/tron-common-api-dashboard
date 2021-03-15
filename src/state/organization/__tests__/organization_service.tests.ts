// test if catch needs to be added to promise chain for fetchAndStore
import OrganizationService from '../organization-service';
import {createState} from '@hookstate/core';
import {Flight, Group, OrganizationControllerApi, OrganizationDto, OtherUsaf, Squadron, Wing} from '../../../openapi';
import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';

class MockOrgApi extends OrganizationControllerApi {
  getOrganizations(type?: "SQUADRON" | "GROUP" | "FLIGHT" | "WING" | "OTHER_USAF" | "ORGANIZATION",
                   branch?: "OTHER" | "USA" | "USAF" | "USMC" | "USN" | "USSF" | "USCG", search?: string,
                   people?: string, organizations?: string, page?: number, limit?: number, options?: any):
      Promise<AxiosResponse<Array<OrganizationDto>>> {

    const orgs : OrganizationDto[] = [ {id: '2a27a3a3-22b6-4dcb-9bd7-a9ce16b742d4', name: 'test' } ];
    const response : AxiosResponse = {
      data: orgs,
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

  patchOrganization(id?: string, requestBody?: { [key: string]: string; }, options?: any)
      : Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
  }

  createOrganization(organizationDtoFlightGroupOtherUsafSquadronWing: OrganizationDto | Flight | Group | OtherUsaf | Squadron | Wing, options?: any) {
    return this.genericFunctionThatReturnsReponse();
  }

}

describe('Test OrganizationService', () => {

  it('get all organizations', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.fetchAndStoreData();
    expect(response).toHaveLength(1);
  });

  it('get single organization', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.getOrgDetails('some id');
    expect(response).toBeTruthy();
  });

  it('send Create', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.sendCreate({ id: 'some id'} as OrganizationDto);
    expect(response).toBeTruthy();
  });

  it('send Update', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.sendUpdate({ id: 'some id'} as OrganizationDto);
    expect(response).toBeTruthy();
  });

  it('sets Leader', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.updateLeader('some id', 'some id');
    expect(response).toBeTruthy();
  });

  it('removes Leader', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.removeLeader('some id');
    expect(response).toBeTruthy();
  });

  it('adds member', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.addMember('some id', 'some id');
    expect(response).toBeTruthy();
  });


  it('removes member', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.removeMember('some id', ['some id']);
    expect(response).toBeTruthy();
  });

  it('adds subordinate org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.addSubOrg('some id', 'some id');
    expect(response).toBeTruthy();
  });

  it('removes subordinate org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.removeSubOrg('some id', ['some id']);
    expect(response).toBeTruthy();
  });

  it('deletes an org', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    const response = await organizationService.sendDelete({ id: 'some id', name: 'some org' });
    expect(response).toBeTruthy();
  });

});
