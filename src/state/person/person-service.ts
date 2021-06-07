import { State } from '@hookstate/core';
import { FilterDto, PersonControllerApiInterface, PersonDto, PersonDtoBranchEnum, PersonFindDtoFindTypeEnum, RankControllerApiInterface } from '../../openapi';
import { RankStateModel } from './rank-state-model';
import {getEnumKeyByEnumValue} from '../../utils/enum-utils';
import {AbstractDataService} from '../data-service/abstract-data-service';
import {ValidateFunction} from 'ajv';
import ModelTypes from '../../api/model-types.json';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import { createFailedDataFetchToast } from '../../components/Toast/ToastUtils/ToastUtils';

/**
 * PII WARNING:
 * Models used by this service has the following PII fields
 * PersonDto
 *  * firstName
 *  * middleName
 *  * lastName
 *  * email
 *  * dodid
 *  * phone
 *  * address
 */
export default class PersonService extends AbstractDataService<PersonDto, PersonDto> {
  private readonly validate: ValidateFunction<PersonDto>;
  private readonly filterValidate: ValidateFunction<FilterDto>;

  constructor(public state: State<PersonDto[]>, private personApi: PersonControllerApiInterface,
    public rankState: State<RankStateModel>, private rankApi: RankControllerApiInterface) {
    super(state);
    this.validate = TypeValidation.validatorFor<PersonDto>(ModelTypes.definitions.PersonDto);
    this.filterValidate = TypeValidation.validatorFor<FilterDto>(ModelTypes.definitions.FilterDto);
  }

  async fetchAndStoreData(): Promise<PersonDto[]> {
    const personResponsePromise = await this.personApi.getPersonsWrapped()
        .then(resp => {
          return resp.data.data;
        });
    this.state.set(personResponsePromise ?? []);
    return personResponsePromise ?? [];
  }

  /**
  * Keeps track of changes to the filter
  */
  private filter?: FilterDto;

  /**
  * Keeps track of changes to the sort
  */
  private sort?: string[];

  async fetchAndStorePaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<PersonDto[]> {
    /**
     * If the filter or sort changes, purge the state to start fresh.
     * Set filter to the new value
     */
    if (this.filter != filter || this.sort != sort) {
      this.state.set([]);
      this.filter = filter;
      this.sort = sort;
    }

    let personResponseData: PersonDto[] = [];

    try {
      if (filter != null && Object.keys(filter).length > 0) {
        if (!this.filterValidate(filter)) {
          throw TypeValidation.validationError('FilterDto');
        }
        
        personResponseData = await this.personApi.filterPerson(filter, undefined, undefined, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      } else {
        personResponseData = await this.personApi.getPersonsWrapped(undefined, undefined, page, limit, sort)
          .then(resp => {
            return resp.data.data;
          });
      }
    } catch (err) {
      throw err;
    }

    this.mergeDataToState(personResponseData, checkDuplicates);

    return personResponseData;
  }

  convertRowDataToEditableData(rowData: PersonDto): Promise<PersonDto> {
    return Promise.resolve(rowData);
  }

  async sendCreate(toCreate: PersonDto): Promise<PersonDto> {
    if(!this.validate(toCreate)) {
      throw TypeValidation.validationError('PersonDto');
    }
    try {
      const personResponse = await this.personApi.createPerson(toCreate);
      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendUpdate(toUpdate: PersonDto): Promise<PersonDto> {
    if(!this.validate(toUpdate)) {
      throw TypeValidation.validationError('PersonDto');
    }
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Person to update has undefined id.'));
      }
      const personResponse = await this.personApi.updatePerson(toUpdate.id, toUpdate);
      this.state.set(currentState => {
        const currentPersonIndex = currentState.findIndex(person => person.id === personResponse.data.id);
        currentState[currentPersonIndex] = personResponse.data;
        return [...currentState];
      });
      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendSelfUpdate(toUpdate: PersonDto): Promise<PersonDto> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Person to update has undefined id.'));
      }
      const personResponse = await this.personApi.selfUpdatePerson(toUpdate.id, toUpdate);

      const personInState = this.state.find(person => person.id.get() === personResponse.data.id);
      personInState?.set(personResponse.data);

      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendDelete(toDelete: PersonDto): Promise<void> {
    return Promise.resolve();
  }

  sendPatch: undefined;

  fetchRankForBranch(branch: string) {
    // validate that the branch is part of branch enum
    const branchEnumKey = getEnumKeyByEnumValue(PersonDtoBranchEnum, branch);
    if (branchEnumKey == null) {
      return;
    }
    const branchEnum = PersonDtoBranchEnum[branchEnumKey];
    const previousRankState = this.rankState.get();

    // only fetch if not existing
    if (previousRankState[branchEnum] != null) {
      this.rankState.set(existingRanks => {
        return Promise.resolve({...existingRanks})
      });
      return;
    }
    const updatedRanksPromise = this.rankApi.getRanks1(branch)
        .then(resp => {
          return resp.data;
        });
    this.rankState.set((existingRanks) => {
      return updatedRanksPromise
          .then(branchRanks => {
            return {
              ...existingRanks,
              [branch]: branchRanks
            }
          });
    });
  }

  async getPersonByEmail(email: string) {
    try {
      const personResponse = await this.personApi.findPersonBy({ findType: PersonFindDtoFindTypeEnum.Email, value: email });
      return personResponse.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
