import {PersonDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {Configuration, PersonControllerApi, PersonControllerApiInterface} from '../../openapi';
import Config from '../../api/configuration';
import PersonService from './person-service';

const personState = createState<PersonDto[]>(new Array<PersonDto>());

const personApi: PersonControllerApiInterface = new PersonControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<PersonDto[]>, personApi: PersonControllerApiInterface) => {
  return new PersonService(state, personApi);
}

export const usePersonState = () => wrapState(useState(personState), personApi);
