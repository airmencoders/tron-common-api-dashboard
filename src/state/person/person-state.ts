import {PersonDto} from '../../openapi/models';
import {createState, State, useState} from '@hookstate/core';
import {
  PersonControllerApi,
  PersonControllerApiInterface, RankControllerApi,
  RankControllerApiInterface
} from '../../openapi';
import PersonService from './person-service';
import {RankStateModel} from './rank-state-model';
import { globalOpenapiConfig } from '../../api/openapi-config';

const personState = createState<PersonDto[]>(new Array<PersonDto>());
const rankState = createState<RankStateModel>({});

const personApi: PersonControllerApiInterface = new PersonControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

const rankApi: RankControllerApiInterface = new RankControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<PersonDto[]>, _personApi: PersonControllerApiInterface,
                          _rankState: State<RankStateModel>, _rankApi: RankControllerApiInterface) => {
  return new PersonService(state, _personApi, _rankState, _rankApi);
}

export const usePersonState = () => wrapState(useState(personState), personApi, useState(rankState), rankApi);
