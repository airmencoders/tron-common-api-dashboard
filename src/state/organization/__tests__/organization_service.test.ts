// test if catch needs to be added to promise chain for fetchAndStore
import OrganizationService from '../organization-service';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { FilterConditionOperatorEnum, FilterDto, Flight, Group, OrganizationControllerApi, OrganizationControllerApiInterface, OrganizationDto, OrganizationDtoBranchTypeEnum, OrganizationDtoOrgTypeEnum, OrganizationDtoPaginationResponseWrapper, OtherUsaf, PersonControllerApi, PersonControllerApiInterface, PersonDto, Squadron, Wing } from '../../../openapi';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { OrganizationDtoWithDetails, OrgWithDetails, PersonWithDetails } from '../organization-state';
import { ResponseType } from '../../data-service/response-type';
import { PatchResponse } from '../../data-service/patch-response';
import { OrganizationEditState } from '../../../pages/Organization/organization-edit-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';

class MockOrgApi extends OrganizationControllerApi {
  getOrganizationsWrapped(type?: "SQUADRON" | "GROUP" | "FLIGHT" | "WING" | "OTHER_USAF" | "ORGANIZATION",
                   branch?: "OTHER" | "USA" | "USAF" | "USMC" | "USN" | "USSF" | "USCG", search?: string,
                   people?: string, organizations?: string, page?: number, limit?: number, options?: any):
    Promise<AxiosResponse<OrganizationDtoPaginationResponseWrapper>> {

    return this.genericFunctionThatReturnsWrappedReponse();
  }

  filterOrganizations(filterDto: FilterDto, page?: number, size?: number, sort?: Array<string>, options?: any) {
    return this.genericFunctionThatReturnsWrappedReponse();
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

  genericFunctionThatReturnsWrappedReponse(): Promise<AxiosResponse<OrganizationDtoPaginationResponseWrapper>> {
    const orgs: OrganizationDto[] = [
      {
        "id": "5a709b2c-39ee-4913-940b-18c7b2766381",
        "leader": "490475d6-7cda-40cd-9258-586e4d34467c",
        "members": [
          "490475d6-7cda-40cd-9258-586e4d34467c"
        ],
        "parentOrganization": null,
        "name": "56789",
      }
    ];
    const data = {
      "data": orgs,
      "pagination": {
        "page": 0,
        "size": 20,
        "totalElements": 1,
        "totalPages": 1,
        "links": {}
      }
    }
    const response: AxiosResponse = {
      data,
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
    return {} as Promise<AxiosResponse<void>>
  }

  addSubordinateOrganization(id?: string, requestBody? : string[], options?: any)
    : Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
  }

  deleteOrganizationMember(id?: string, requestBody? : string[], options?: any)
  : Promise<AxiosResponse<void>>{
    return {} as Promise<AxiosResponse<void>>;
  }

  addOrganizationMember(id?: string, requestBody? : string[], options?: any)
    : Promise<AxiosResponse<OrganizationDto>> {
    return this.genericFunctionThatReturnsReponse();
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
let organizationApi: OrganizationControllerApiInterface;
let personApi: PersonControllerApiInterface;
let organizationState: State<OrganizationDto[]> & StateMethodsDestroy;
let organizationChooserState: State<OrganizationDto[]> & StateMethodsDestroy;
let personChooserState: State<PersonDto[]> & StateMethodsDestroy;

beforeEach(() => {
  organizationApi = new OrganizationControllerApi();
  personApi = new PersonControllerApi();
  organizationState = createState<OrganizationDto[]>([

  ]);
  organizationChooserState = createState<OrganizationDto[]>([]);
  personChooserState = createState<PersonDto[]>([]);
});

afterEach(() => {
  organizationState.destroy();
  organizationChooserState.destroy();
  personChooserState.destroy();
})

describe('Test OrganizationService', () => {

  it('get all organizations', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    const cancellableRequest = organizationService.fetchAndStoreData();
    const response = await cancellableRequest.promise;
    expect(response).toHaveLength(1);
  });

  it('should convert rowData(OrganizationDto) on convertRowDataToEditableData (get org details)', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    const response = await organizationService.convertRowDataToEditableData({
      id: 'some id'
    });
    expect(response).toBeTruthy();
  });

  it('should throw on convertRowDataToEditableData with undefined ID', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    // Test invalid id
    await expect(organizationService.convertRowDataToEditableData({
      name: 'some name'
    })).rejects.toBeTruthy();
  });

  it('should reject on convertRowDataToEditableData when api request fails', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const requestError = new Error('Error');
    api.getOrganization = jest.fn(() => {
      return Promise.reject(requestError);
    });

    await expect(organizationService.convertRowDataToEditableData({
      id: 'some id',
      name: 'some name'
    })).rejects.toEqual(requestError);
  });

  it('should create an org on success sendCreate', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    const response = await organizationService.sendCreate({ id: 'some id' } as OrganizationDtoWithDetails);
    expect(response).toBeTruthy();

    expect(organizationState.find(i => i.id.get() === response.id)?.get()).toEqual(response);
  });

  it('should throw on sendCreate when fail validation OrganizationDto validation', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    await expect(organizationService.sendCreate({ id: 123 } as unknown as OrganizationDtoWithDetails)).rejects.toBeTruthy();
  });

  it('should reject on sendCreate when api request fails', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const requestError = new Error('Error');
    api.createOrganization = jest.fn(() => {
      return Promise.reject(requestError);
    });

    await expect(organizationService.sendCreate({ id: 'some id' } as OrganizationDtoWithDetails)).rejects.toEqual(requestError);
  });

  it('send Update', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    organizationState.merge([
      {
        id: 'some id',
        name: 'prev name',
        orgType: OrganizationDtoOrgTypeEnum.Group,
        branchType: OrganizationDtoBranchTypeEnum.Usaf
      }
    ]);

    const toUpdate = {
      id: 'some id',
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    } as OrganizationDtoWithDetails;

    api.jsonPatchOrganization = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse(toUpdate as OrganizationDto));
    });

    const response = await organizationService.sendUpdate(toUpdate);
    expect(response).toBeTruthy();

    // Check to make sure state is updated correctly
    const updatedOrgInState = organizationState.find(i => i.id.get() === response.id)?.get();
    expect(updatedOrgInState).not.toBeUndefined();
    expect(updatedOrgInState?.name).toEqual(response.name);

    // fail validation
    await expect(organizationService.sendUpdate({
      badParam: 'bad'
    } as OrganizationDtoWithDetails)).rejects.toBeTruthy();

    // fail due to no id
    await expect(organizationService.sendUpdate({
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    } as OrganizationDtoWithDetails)).rejects.toBeTruthy();

    // should reject on api error
    const updateError = new Error('Error');
    api.jsonPatchOrganization = jest.fn(() => {
      return Promise.reject(updateError);
    });
    await expect(organizationService.sendUpdate({
      id: "some id",
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    } as OrganizationDtoWithDetails)).rejects.toEqual(updateError);
  });

  it('should remove unfriendly ag grid fields', () => {
    const organizationService = new OrganizationService(organizationState,
      organizationApi, organizationChooserState, personChooserState, personApi);

    const org: OrganizationDto = {
      id: 'some id',
      name: 'some name',
      members: [
        '1',
        '2'
      ],
      subordinateOrganizations: [
        '3',
        '4'
      ]
    };

    const removedFieldsOrg = organizationService.removeUnfriendlyAgGridDataSingle(org);
    expect(removedFieldsOrg).toEqual({
      ...org,
      members: undefined,
      subordinateOrganizations: undefined
    });
  });

  it('should send patch -- success', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const originalMembers: PersonWithDetails[] = [{ id: '1' }];
    const originalSubOrgs: OrgWithDetails[] = [{ id: '111' }];

    const original: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf,
      members: originalMembers,
      subordinateOrganizations: originalSubOrgs
    };

    const toUpdate: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some new name',
      orgType: OrganizationDtoOrgTypeEnum.Flight,
      branchType: OrganizationDtoBranchTypeEnum.Ussf,
    };

    const toPatch: OrganizationEditState = {
      leader: {
        removed: false,
        newLeader: {
          id: 'new leader id'
        }
      },
      parentOrg: {
        removed: false,
        newParent: {
          id: 'new parent id'
        }
      },
      members: {
        toAdd: [{ id: 'new member 1' }],
        toRemove: [{ id: originalMembers[0].id }]
      },
      subOrgs: {
        toAdd: [{ id: 'new sub org 1' }
        ],
        toRemove: [{ id: originalSubOrgs[0].id }]
      }
    };

    const response = await organizationService.sendPatch(original, toUpdate, toPatch);

    expect(response.type).toEqual(ResponseType.SUCCESS);
  });

  it('should send patch -- fail', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const original: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf,
      leader: {
        id: 'leader id'
      },
      parentOrganization: {
        id: 'parent org id'
      }
    };

    const toUpdate: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some new name',
      orgType: OrganizationDtoOrgTypeEnum.Flight,
      branchType: OrganizationDtoBranchTypeEnum.Ussf,
    };

    const toPatch: OrganizationEditState = {
      leader: {
        removed: true,
      },
      parentOrg: {
        removed: true
      },
      members: {
        toAdd: [{ id: 'new member 1' }],
        toRemove: []
      },
      subOrgs: {
        toAdd: [{ id: 'new sub org 1' }
        ],
        toRemove: []
      }
    };

    api.jsonPatchOrganization = jest.fn(() => {
      return Promise.reject(new Error('patch error'));
    });

    api.removeSubordinateOrganization = jest.fn(() => {
      return Promise.reject(new Error('remove sub org error'));
    });

    api.addSubordinateOrganization = jest.fn(() => {
      return Promise.reject(new Error('add sub org error'));
    });

    api.deleteOrganizationMember = jest.fn(() => {
      return Promise.reject(new Error('delete org mem error'));
    });

    api.addOrganizationMember = jest.fn(() => {
      return Promise.reject(new Error('add org mem error'));
    });

    try {
      await organizationService.sendPatch(original, toUpdate, toPatch);
    } catch (err) {
      const convertErr = err as PatchResponse<OrganizationDto>;
      // this is expected
      expect(convertErr.type).toEqual(ResponseType.FAIL);
    }
  });

  it('should send patch -- fail with no ID', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const original: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf,
      leader: {
        id: 'leader id'
      },
      parentOrganization: {
        id: 'parent org id'
      }
    };

    const toUpdate: OrganizationDtoWithDetails = {
      name: 'some new name',
      orgType: OrganizationDtoOrgTypeEnum.Flight,
      branchType: OrganizationDtoBranchTypeEnum.Ussf,
    };

    const toPatch: OrganizationEditState = {
      leader: {
        removed: true,
      },
      parentOrg: {
        removed: true
      },
      members: {
        toAdd: [{ id: 'new member 1' }],
        toRemove: []
      },
      subOrgs: {
        toAdd: [{ id: 'new sub org 1' }
        ],
        toRemove: []
      }
    };

    await expect(organizationService.sendPatch(original, toUpdate, toPatch)).rejects.toEqual(Error('Organization to update has undefined id.'));
  });

  it('should send patch -- partial', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const originalMembers: PersonWithDetails[] = [{ id: '1' }];
    const originalSubOrgs: OrgWithDetails[] = [{ id: '111' }];

    const original: OrganizationDtoWithDetails = {
      id: 'some id',
      name: 'some name',
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf,
      members: originalMembers,
      subordinateOrganizations: originalSubOrgs
    };

    const toUpdate: OrganizationDtoWithDetails = {
      ...original,
      members: undefined,
      subordinateOrganizations: undefined
    };

    const toPatch: OrganizationEditState = {
      leader: {
        removed: false,
        newLeader: {
          id: 'new leader id'
        }
      },
      parentOrg: {
        removed: false,
        newParent: {
          id: 'new parent id'
        }
      },
      members: {
        toAdd: [],
        toRemove: [{ id: originalMembers[0].id }]
      },
      subOrgs: {
        toAdd: [],
        toRemove: [{ id: originalSubOrgs[0].id }]
      }
    };

    api.deleteOrganizationMember = jest.fn(() => {
      return Promise.reject(new Error('delete org mem error'));
    });

    api.removeSubordinateOrganization = jest.fn(() => {
      return Promise.reject(new Error('remove sub org error'));
    });

    const response = await organizationService.sendPatch(original, toUpdate, toPatch);

    expect(response.type).toEqual(ResponseType.PARTIAL);
  });

  it('should delete an org when sendDelete succeeds', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    organizationState.merge([
      {
        id: 'some id'
      }
    ]);
    expect(organizationState.find(i => i.id.get() === 'some id')?.get()).not.toBeUndefined();

    const response = await organizationService.sendDelete({ id: 'some id', name: 'some org' });
    expect(response).toBe(undefined);

    expect(organizationState.find(i => i.id.get() === 'some id')?.get()).toBeUndefined();
  });

  it('should reject when sendDelete api request fails', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const requestError = new Error('Error');
    api.deleteOrganization = jest.fn(() => {
      return Promise.reject(requestError);
    });

    await expect(organizationService.sendDelete({ id: 'some id', name: 'some org' })).rejects.toEqual(requestError);
  });

  it('should throw on sendDelete when ID is not defined', async () => {
    const organizationService = new OrganizationService(organizationState,
      new MockOrgApi(), organizationChooserState, personChooserState, personApi);

    await expect(organizationService.sendDelete({ name: 'some org' })).rejects.toEqual(new Error('Organization to delete has undefined id.'));
  });

  it('test fetchAndStorePaginatedData', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    const filterOrganizationsSpy = jest.spyOn(api, 'filterOrganizations');
    const getOrganizationsWrappedSpy = jest.spyOn(api, 'getOrganizationsWrapped');

    const filterDto: FilterDto = {
      "filterCriteria": [
        {
          "field": "firstName",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.Like,
              "value": "d"
            }
          ]
        }
      ]
    };

    const agGridSort = ['email,asc'];

    expect.assertions(4);

    // Make sure it calls filter endpoint
    let response = await organizationService.fetchAndStorePaginatedData(0, 20, false, filterDto, agGridSort);
    expect(filterOrganizationsSpy).toHaveBeenCalledTimes(1);

    // No filter, calls get all endpoint
    response = await organizationService.fetchAndStorePaginatedData(0, 20, false, undefined, agGridSort);
    expect(getOrganizationsWrappedSpy).toHaveBeenCalledTimes(1);

    // Mock an exception
    filterOrganizationsSpy.mockImplementation(() => { return Promise.reject(new Error('Test error')) });
    await expect(organizationService.fetchAndStorePaginatedData(0, 20, false, filterDto, agGridSort)).rejects.toThrowError();
    expect(filterOrganizationsSpy).toHaveBeenCalledTimes(2);
  });

  it('test fetchAndStorePaginatedData, should throw on bad filter', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    await expect(organizationService.fetchAndStorePaginatedData(0, 20, false, { bad: 'param' } as unknown as FilterDto)).rejects.toThrowError();
  });

  it('test fetchAndStoreChooserPaginatedData -- person', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);


    const filterPersonSpy = jest.spyOn(personApi, 'filterPerson');
    const getPersonWrappedSpy = jest.spyOn(personApi, 'getPersonsWrapped');

    const filterDto: FilterDto = {
      "filterCriteria": [
        {
          "field": "firstName",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.Like,
              "value": "d"
            }
          ]
        }
      ]
    };

    const person: PersonDto = {
      id: 'person id',
      firstName: 'first name',
      lastName: 'last name',
      email: 'email'
    };

    const mockResponse = {
      data: {
        data: [
          person
        ],
        pagination: {

        }
      },
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    };

    filterPersonSpy.mockResolvedValue(Promise.resolve(mockResponse));
    getPersonWrappedSpy.mockResolvedValue(Promise.resolve(mockResponse));

    const agGridSort = ['email,asc'];

    expect.assertions(4);

    // Make sure it calls filter endpoint
    let response = await organizationService.fetchAndStorePersonChooserPaginatedData(0, 20, false, filterDto, agGridSort);
    expect(filterPersonSpy).toHaveBeenCalledTimes(1);

    // No filter, calls get all endpoint
    response = await organizationService.fetchAndStorePersonChooserPaginatedData(0, 20, false, undefined, agGridSort);
    expect(getPersonWrappedSpy).toHaveBeenCalledTimes(1);

    // Mock an exception
    filterPersonSpy.mockImplementation(() => { return Promise.reject(new Error('Test error')) });
    await expect(organizationService.fetchAndStorePersonChooserPaginatedData(0, 20, false, filterDto, agGridSort)).rejects.toThrowError();
    expect(filterPersonSpy).toHaveBeenCalledTimes(2);
  });

  it('test fetchAndStoreChooserPaginatedData -- person, should throw on bad filter', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    await expect(organizationService.fetchAndStorePersonChooserPaginatedData(0, 20, false, { bad: 'param' } as unknown as FilterDto)).rejects.toThrowError();
  });

  it('test fetchAndStoreChooserPaginatedData -- organization', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);


    const filterOrganizationsSpy = jest.spyOn(api, 'filterOrganizations');
    const getOrganizationsWrappedSpy = jest.spyOn(api, 'getOrganizationsWrapped');

    const filterDto: FilterDto = {
      "filterCriteria": [
        {
          "field": "firstName",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.Like,
              "value": "d"
            }
          ]
        }
      ]
    };

    const org: OrganizationDto = {
      id: 'org id',
      name: 'org name'
    };

    const mockResponse = {
      data: {
        data: [
          org
        ],
        pagination: {

        }
      },
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    };

    filterOrganizationsSpy.mockResolvedValue(Promise.resolve(mockResponse));
    getOrganizationsWrappedSpy.mockResolvedValue(Promise.resolve(mockResponse));

    const agGridSort = ['email,asc'];

    expect.assertions(4);

    // Make sure it calls filter endpoint
    let response = await organizationService.fetchAndStoreOrganizationChooserPaginatedData(0, 20, false, filterDto, agGridSort);
    expect(filterOrganizationsSpy).toHaveBeenCalledTimes(1);

    // No filter, calls get all endpoint
    response = await organizationService.fetchAndStoreOrganizationChooserPaginatedData(0, 20, false, undefined, agGridSort);
    expect(getOrganizationsWrappedSpy).toHaveBeenCalledTimes(1);

    // Mock an exception
    filterOrganizationsSpy.mockImplementation(() => { return Promise.reject(new Error('Test error')) });
    await expect(organizationService.fetchAndStoreOrganizationChooserPaginatedData(0, 20, false, filterDto, agGridSort)).rejects.toThrowError();
    expect(filterOrganizationsSpy).toHaveBeenCalledTimes(2);
  });

  it('test fetchAndStoreChooserPaginatedData -- organization, should throw on bad filter', async () => {
    const api = new MockOrgApi();
    const organizationService = new OrganizationService(organizationState,
      api, organizationChooserState, personChooserState, personApi);

    await expect(organizationService.fetchAndStoreOrganizationChooserPaginatedData(0, 20, false, { bad: 'param' } as unknown as FilterDto)).rejects.toThrowError();
  });

  it('should convert Org Details Dto to Org Dto', () => {
    const organizationService = new OrganizationService(organizationState,
      organizationApi, organizationChooserState, personChooserState, personApi);

    const orgDetails: OrganizationDtoWithDetails = {
      id: 'org id',
      name: 'org name',
      leader: {
        id: 'leader id'
      },
      members: [{ id: 'member id' }],
      subordinateOrganizations: [{ id: 'sub org id' }],
      parentOrganization: { id: 'parent org id' },
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    };

    const orgDto: OrganizationDto = {
      id: orgDetails.id,
      name: orgDetails.name,
      leader: orgDetails.leader?.id,
      members: [orgDetails.members![0].id!],
      subordinateOrganizations: [orgDetails.subordinateOrganizations![0].id!],
      parentOrganization: orgDetails.parentOrganization?.id,
      orgType: OrganizationDtoOrgTypeEnum.Group,
      branchType: OrganizationDtoBranchTypeEnum.Usaf
    };

    expect(organizationService.convertOrgDetailsToDto(orgDetails)).toEqual(orgDto);
  });

});
