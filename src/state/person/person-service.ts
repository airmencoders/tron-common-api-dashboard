import {DataService} from '../data-service/data-service';
import {State} from '@hookstate/core';
import {PersonControllerApiInterface, PersonDto, PersonDtoBranchEnum, RankControllerApiInterface} from '../../openapi';
import {RankStateModel} from './rank-state-model';
import {getEnumKeyByEnumValue} from '../../utils/enum-utils';
import {ValidateFunction} from 'ajv';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import ModelTypes from '../../api/model-types.json';

export default class PersonService implements DataService<PersonDto, PersonDto> {

  private readonly validate: ValidateFunction<PersonDto>;

  constructor(public state: State<PersonDto[]>, private personApi: PersonControllerApiInterface,
              public rankState: State<RankStateModel>, private rankApi: RankControllerApiInterface) {
    this.validate = TypeValidation.validatorFor<PersonDto>(ModelTypes.definitions.PersonDto);
  }

  async fetchAndStoreData(): Promise<PersonDto[]> {
    const personResponsePromise = await this.personApi.getPersons()
        .then(resp => {
          return resp.data;
        });
    this.state.set(personResponsePromise);
    return personResponsePromise;
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

  async sendDelete(toDelete: PersonDto): Promise<void> {
    return Promise.resolve();
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.error;
  }

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
}
