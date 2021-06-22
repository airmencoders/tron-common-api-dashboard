import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { FilterConditionOperatorEnum, FilterDto, PersonControllerApi, PersonControllerApiInterface, PersonDto, PersonDtoPaginationResponseWrapper, Rank, RankBranchTypeEnum, RankControllerApi, RankControllerApiInterface } from '../../../openapi';
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

    const response = await personService.fetchAndStoreData();
    expect(response).toEqual(personState);
    expect(personService.state.get()).toEqual(personState);
  });

  it('Should fetch and store data on bad request', async () => {
    const personApiSpy = jest.spyOn(personApi, 'getPersonsWrapped');

    personApiSpy.mockRejectedValue(new Error('To Fail'));

    await expect(() => personService.fetchAndStoreData()).rejects.toThrow();
    expect(personService.state.get()).toEqual([]);
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

    let response = await personService.fetchAndStorePaginatedData(0, 100, true, undefined, undefined);
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

    await expect(personService.sendUpdate(personDto)).resolves.toEqual(personDto);

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

    await expect(personService.sendSelfUpdate(personDto)).resolves.toEqual(personDto);

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

    await expect(personService.sendDelete(personDto)).resolves.toEqual(undefined);

  });

  it('Should reject if person id does not exist on person delete', async () => {
    const badPerson = {
      ...personDto,
      id: undefined
    };

    await expect(() => personService.sendDelete(badPerson)).rejects.toThrow('Person to delete has undefined id.');
  });

  it('Should throw json validation exception on person delete with bad dto', async () => {
    const badPerson = { badParam: 'badParam' } as unknown as PersonDto;
    await expect(() => personService.sendDelete(badPerson)).rejects.toThrow(jsonValidationError);
  });

  it('Should reject on api error on person delete', async () => {
    const personApiSpy = jest.spyOn(personApi, 'deletePerson');
    personApiSpy.mockRejectedValue(new Error('Fail'));

    await expect(() => personService.sendDelete(personDto)).rejects.toThrow('Fail');
  });



  it('Should fetch rank for branch successfully', async () => {
    const rankApiSpy = jest.spyOn(rankApi, 'getRanks1');

    const ranks = [
      {
        abbreviation: 'Cpt',
        name: 'Captain',
        branchType: RankBranchTypeEnum.Usaf
      }
    ];
    const rankResponse: AxiosResponse<Rank[]> = {
      data: ranks,
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

});
