import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { FilterConditionOperatorEnum, FilterDto, PersonControllerApi, PersonControllerApiInterface, PersonDto, PersonDtoPaginationResponseWrapper, RankBranchTypeEnum, RankControllerApi, RankControllerApiInterface, RankResponseWrapper } from '../../../openapi';
import { createAxiosSuccessResponse, createGenericAxiosRequestErrorResponse } from '../../../utils/TestUtils/test-utils';
import { prepareDataCrudErrorResponse } from '../../data-service/data-service-utils';
import PersonService from '../person-service';
import { RankStateModel } from '../rank-state-model';

const jsonValidationError = new RegExp('Non valid JSON error for context');

let rankApi: RankControllerApiInterface;
let personApi: PersonControllerApiInterface;
let rankState: State<RankStateModel> & StateMethodsDestroy;
let personState: State<PersonDto[]> & StateMethodsDestroy;
let personService: PersonService;
let personDto: PersonDto;

beforeEach(() => {
  rankApi = new RankControllerApi();
  personApi = new PersonControllerApi();
  rankState = createState<RankStateModel>({});
  personState = createState<PersonDto[]>([]);
  personService = new PersonService(personState, personApi, rankState, rankApi);

  personDto = {
    id: "person id",
    firstName: "Test",
    lastName: "Person",
    email: "test.person@test.com"
  };
});

afterEach(() => {
  rankState.destroy();
  personState.destroy();
})

describe('Test Person Service', () => {
  it('Should fetch and store data', async () => {
    const personData: PersonDto[] = [personDto];

    const wrappedPersonResponse: PersonDtoPaginationResponseWrapper = {
      data: personData,
      pagination: {}
    };

    const apiResponse: AxiosResponse<PersonDtoPaginationResponseWrapper> = {
      data: wrappedPersonResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApi.getPersonsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PersonDtoPaginationResponseWrapper>>(resolve => resolve(apiResponse));
    });

    const cancellableRequest = personService.fetchAndStoreData();
    await cancellableRequest.promise;

    expect(personState.get()).toEqual(personData);
  });

  it('Should fetch and store data on bad request', async () => {
    personApi.getPersonsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PersonDtoPaginationResponseWrapper>>((resolve, reject) => reject(createGenericAxiosRequestErrorResponse()));
    });

    const error = createGenericAxiosRequestErrorResponse();

    const errorRequest = prepareDataCrudErrorResponse(error);

    const cancellableRequest = personService.fetchAndStoreData();
    expect(personService.error).toBe(undefined);

    await expect(cancellableRequest.promise).rejects.toEqual(errorRequest);
    expect(personService.error).toEqual(errorRequest);
  });

  it('Should fetch and store person paginated data with filter', async () => {
    const personApiSpy = jest.spyOn(personApi, 'filterPerson');

    const personState: PersonDto[] = [personDto];

    let wrappedPersonResponse: PersonDtoPaginationResponseWrapper = {
      data: personState,
      pagination: {}
    };

    let apiResponse: AxiosResponse<PersonDtoPaginationResponseWrapper> = {
      data: wrappedPersonResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    let filter: FilterDto = {
      filterCriteria: [
        {
          field: 'firstName',
          conditions: [
            {
              operator: FilterConditionOperatorEnum.Like,
              value: personDto.firstName ?? ''
            }
          ]
        }
      ]
    };

    let response = await personService.fetchAndStorePaginatedData(0, 100, true, filter, undefined);
    expect(response).toEqual(personState);
    expect(personService.state.get()).toEqual(personState);

    // Try with a new filter to ensure state is reset
    const newPersonState: PersonDto[] = [
      {
        id: 'another person id',
        firstName: 'another',
        lastName: 'person',
        email: 'another.person@test.com'
      }
    ];

    wrappedPersonResponse = {
      data: newPersonState,
      pagination: {}
    };

    apiResponse = {
      data: wrappedPersonResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    filter = {
      filterCriteria: [
        {
          field: 'firstName',
          conditions: [
            {
              operator: FilterConditionOperatorEnum.NotLike,
              value: personDto.firstName ?? ''
            }
          ]
        }
      ]
    };

    response = await personService.fetchAndStorePaginatedData(0, 100, true, filter, undefined);
    expect(response).toEqual(newPersonState);
    expect(personService.state.get()).toEqual(newPersonState);
  });

  it('Should fetch and store paginated data with no filter (just gets all, does not call filter endpoint)', async () => {
    const personApiSpy = jest.spyOn(personApi, 'getPersonsWrapped');

    const personState: PersonDto[] = [personDto];

    const wrappedPersonResponse: PersonDtoPaginationResponseWrapper = {
      data: personState,
      pagination: {}
    };

    const apiResponse: AxiosResponse<PersonDtoPaginationResponseWrapper> = {
      data: wrappedPersonResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    const response = await personService.fetchAndStorePaginatedData(0, 100, true, undefined, undefined);
    expect(response).toEqual(personState);
    expect(personService.state.get()).toEqual(personState);
  });

  it('Should throw json validation exception when fetch and store paginated data with bad filter', async () => {
    const filter = { badField: 'badField' } as unknown as FilterDto;

    await expect(() => personService.fetchAndStorePaginatedData(0, 100, true, filter, undefined)).rejects.toThrowError(jsonValidationError);
  });

  it('Should convert row data to editable data', async () => {
    await expect(personService.convertRowDataToEditableData(personDto)).resolves.toEqual(personDto);
  });

  it('Should send person creation successfully', async () => {
    const personApiSpy = jest.spyOn(personApi, 'createPerson');

    const apiResponse: AxiosResponse<PersonDto> = {
      data: personDto,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    await expect(personService.sendCreate(personDto)).resolves.toEqual(personDto);

  });

  it('Should throw json validation exception on person creation with bad dto', async () => {
    const badPerson = { badParam: 'badParam' } as unknown as PersonDto;
    await expect(() => personService.sendCreate(badPerson)).rejects.toThrow(jsonValidationError);
  });

  it('Should reject on api error on person creation', async () => {
    const personApiSpy = jest.spyOn(personApi, 'createPerson');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.sendCreate(personDto)).rejects.toThrow('Fail');
  });

  it('Should send person update successfully', async () => {
    const personApiSpy = jest.spyOn(personApi, 'updatePerson');

    const apiResponse: AxiosResponse<PersonDto> = {
      data: personDto,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    personState.merge([
      {
        ...personDto,
        firstName: 'Different First Name'
      }
    ]);

    await expect(personService.sendUpdate(personDto)).resolves.toEqual(personDto);

    // Check to make sure state gets updated
    expect(personState.get()[0]).toEqual(personDto);
  });

  it('Should reject if person id does not exist on person update', async () => {
    const badPerson = {
      ...personDto,
      id: undefined
    };

    await expect(() => personService.sendUpdate(badPerson)).rejects.toThrow('Person to update has undefined id.');
  });

  it('Should throw json validation exception on person update with bad dto', async () => {
    const badPerson = { badParam: 'badParam' } as unknown as PersonDto;
    await expect(() => personService.sendUpdate(badPerson)).rejects.toThrow(jsonValidationError);
  });

  it('Should reject on api error on person update', async () => {
    const personApiSpy = jest.spyOn(personApi, 'updatePerson');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.sendUpdate(personDto)).rejects.toThrow('Fail');
  });



  it('Should send self update successfully', async () => {
    const personApiSpy = jest.spyOn(personApi, 'selfUpdatePerson');

    const apiResponse: AxiosResponse<PersonDto> = {
      data: personDto,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    personState.merge([
      {
        ...personDto,
        firstName: 'Different First Name'
      }
    ]);

    await expect(personService.sendSelfUpdate(personDto)).resolves.toEqual(personDto);

    // Check state gets updated
    expect(personState.get()[0]).toEqual(personDto);
  });

  it('Should reject if self person id does not exist on person self update', async () => {
    const badPerson = {
      ...personDto,
      id: undefined
    };

    await expect(() => personService.sendSelfUpdate(badPerson)).rejects.toThrow('Person to update has undefined id.');
  });

  it('Should throw json validation exception on person self update with bad dto', async () => {
    const badPerson = { badParam: 'badParam' } as unknown as PersonDto;
    await expect(() => personService.sendSelfUpdate(badPerson)).rejects.toThrow(jsonValidationError);
  });

  it('Should reject on api error on person self update', async () => {
    const personApiSpy = jest.spyOn(personApi, 'selfUpdatePerson');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.sendSelfUpdate(personDto)).rejects.toThrow('Fail');
  });

  it('Should send delete successfully', async () => {
    const personApiSpy = jest.spyOn(personApi, 'deletePerson');

    const apiResponse: AxiosResponse<void> = {
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    personApiSpy.mockResolvedValue(apiResponse);

    personState.merge([
      {
        ...personDto
      }
    ]);

    await expect(personService.sendDelete(personDto)).resolves.toEqual(undefined);

    // Check state is updated
    expect(personState.get().length).toEqual(0);
  });

  it('Should reject if person id does not exist on person delete', async () => {
    const badPerson = {
      ...personDto,
      id: undefined
    };

    await expect(() => personService.sendDelete(badPerson)).rejects.toThrow('Person to delete has undefined id.');
  });

  it('Should reject on api error on person delete', async () => {
    const personApiSpy = jest.spyOn(personApi, 'deletePerson');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.sendDelete(personDto)).rejects.toThrow('Fail');
  });

  it('Should fetch rank for branch successfully', async () => {
    const rankApiSpy = jest.spyOn(rankApi, 'getRanks');

    const ranks = [
      {
        abbreviation: 'Cpt',
        name: 'Captain',
        branchType: RankBranchTypeEnum.Usaf
      }
    ];
    const rankResponse: AxiosResponse<RankResponseWrapper> = {
      data: {
        data: ranks
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    }

    rankApiSpy.mockResolvedValue(rankResponse);

    const rankApiResponse = await personService.fetchRankForBranch('USAF');
    expect(rankApiResponse).toEqual(ranks);
  });

  it('Should return undefined if trying to fetch rank for invalid branch', async () => {
    const response = personService.fetchRankForBranch('asdf');

    expect(response).toBe(undefined);
  });

  it('should reject on get person by email error', async () => {
    const personApiSpy = jest.spyOn(personApi, 'findPersonBy');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.getPersonByEmail('test@email.com')).rejects.toThrow('Fail');
  });

  it('should get person by email', async () => {
    const personApiSpy = jest.spyOn(personApi, 'findPersonBy');
    const response = createAxiosSuccessResponse({
      id: 'some id',
      email: 'test@email.com'
    });
    personApiSpy.mockReturnValue(Promise.resolve(response));

    await expect(personService.getPersonByEmail('test@email.com')).resolves.toEqual(response.data);
  });

  it('should sanitize PersonDto (all blank strings should be converted to null if they are nullable)', () => {
    const personDtoWithBlankStrings: PersonDto = {
      id: 'person id',
      firstName: ' ',
      middleName: ' ',
      lastName: '',
      email: '',
      title: '',
      dutyTitle: '',
      phone: '',
      dutyPhone: '',
      address: ''
    };

    const personDtoSanitized: PersonDto = {
      id: 'person id',
      firstName: null,
      middleName: null,
      lastName: null,
      email: null,
      title: null,
      dutyTitle: null,
      phone: null,
      dutyPhone: null,
      address: null
    };

    expect(personService.sanitizeDto(personDtoWithBlankStrings)).toEqual(personDtoSanitized);
  });
});
