import {PersonDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {
  Configuration,
  PersonControllerApi,
  PersonControllerApiInterface, RankControllerApi,
  RankControllerApiInterface
} from '../../openapi';
import Config from '../../api/config';
import PersonService from './person-service';
import {RankStateModel} from './rank-state-model';

const personState = createState<PersonDto[]>(new Array<PersonDto>());
const rankState = createState<RankStateModel>({});

const personApi: PersonControllerApiInterface = new PersonControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

const rankApi: RankControllerApiInterface = new RankControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (state: State<PersonDto[]>, _personApi: PersonControllerApiInterface,
                          _rankState: State<RankStateModel>, _rankApi: RankControllerApiInterface) => {
  return new PersonService(state, _personApi, _rankState, _rankApi);
}

export const usePersonState = () => wrapState(useState(personState), personApi, useState(rankState), rankApi);
