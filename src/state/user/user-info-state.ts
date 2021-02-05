import {createState, State, useState} from '@hookstate/core';
import {UserInfoDto} from '../../openapi/models';
import {Configuration, UserInfoControllerApi, UserInfoControllerApiInterface} from '../../openapi';
import UserInfoService from './user-info-serivce';
import Config from '../../api/configuration';

export interface UserInfoState {
  error?: string,
  userInfo?: UserInfoDto
}

const userInfoState = createState<UserInfoState>({
  error: undefined,
  userInfo: undefined
});

export const wrapState = (state: State<UserInfoState>, userInfoApi: UserInfoControllerApiInterface): UserInfoService => {
  return new UserInfoService(state, userInfoApi);
}

console.log(Config.API_URL);

export const useUserInfoState = ():UserInfoService => wrapState(useState(userInfoState),
    new UserInfoControllerApi(new Configuration({
      basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
    })));
