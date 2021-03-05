import {DataService} from '../data-service/data-service';
import {State} from '@hookstate/core';
import {PersonControllerApiInterface, PersonDto} from '../../openapi';

export default class PersonService implements DataService<PersonDto, PersonDto> {

  constructor(public state: State<PersonDto[]>, private personApi: PersonControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<PersonDto[]> {
    try {
      const personResponse = await this.personApi.getPersons();
      this.state.set(personResponse.data);
      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
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
      return Promise.resolve(personResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.error;
  }

}
