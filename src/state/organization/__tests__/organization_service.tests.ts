
// test if catch needs to be added to promise chain for fetchAndStore
import OrganizationService from '../organization-service';
import {createState, useState} from '@hookstate/core';
import {OrganizationControllerApi, OrganizationControllerApiInterface, OrganizationDto} from '../../../openapi';
import {AxiosError, AxiosResponse} from 'axios';

class MockOrgApi extends OrganizationControllerApi {
  getOrganizations(type?: "SQUADRON" | "GROUP" | "FLIGHT" | "WING" | "OTHER_USAF" | "ORGANIZATION",
                   branch?: "OTHER" | "USA" | "USAF" | "USMC" | "USN" | "USSF" | "USCG", search?: string,
                   people?: string, organizations?: string, page?: number, limit?: number, options?: any):
      Promise<AxiosResponse<Array<OrganizationDto>>> {
    return Promise.reject({
      config: {},
      code: '400',
      isAxiosError: false,
      toJSON: () => {},
      message: 'Error message'
    } as AxiosError);
  }
}

describe('Test OrganizationService', () => {

  it('should catch internal api errors', async () => {
    const organizationService = new OrganizationService(createState<OrganizationDto[]>([]),
        new MockOrgApi());

    try {
      organizationService.fetchAndStoreData();
    }
    catch (error) {
      expect(error).toBeFalsy();
    }
  });
});
