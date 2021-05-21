import { State } from '@hookstate/core';
import {PersonControllerApiInterface, PersonDto, PersonDtoBranchEnum, RankControllerApiInterface} from '../../openapi';
import { RankStateModel } from './rank-state-model';
import {getEnumKeyByEnumValue} from '../../utils/enum-utils';
import { AbstractDataService } from '../data-service/abstract-data-service';

export default class PersonService extends AbstractDataService<PersonDto, PersonDto> {
  constructor(public state: State<PersonDto[]>, private personApi: PersonControllerApiInterface,
              public rankState: State<RankStateModel>, private rankApi: RankControllerApiInterface,
              public currentUserState: State<PersonDto>) {
    super(state);
  }

  async fetchAndStoreData(): Promise<PersonDto[]> {
    const personResponsePromise = await this.personApi.getPersonsWrapped()
        .then(resp => {
          return resp.data.data;
        });
    this.state.set(personResponsePromise);
    return personResponsePromise;
  }

  async fetchAndStorePaginatedData(page: number, limit: number, checkDuplicates?: boolean): Promise<PersonDto[]> {
    const personResponseData = await this.personApi.getPersonsWrapped(undefined, undefined, page, limit)
      .then(resp => {
        return resp.data.data;
      });

    this.mergeDataToState(personResponseData, checkDuplicates);

    return personResponseData;
  }

  convertRowDataToEditableData(rowData: PersonDto): Promise<PersonDto> {
    return Promise.resolve(rowData);
  }

  async sendCreate(toCreate: PersonDto): Promise<PersonDto> {
    try {
      const personResponse = await this.personApi.createPerson(toCreate);
      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendUpdate(toUpdate: PersonDto): Promise<PersonDto> {
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

  async getPersonByEmail(email: string): Promise<PersonDto> {
      const personResponse = await this.personApi.findPersonBy1("EMAIL", email);
      this.currentUserState.set(personResponse.data)
      return personResponse.data;
  }
}
