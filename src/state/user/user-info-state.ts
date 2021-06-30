import {createState, State, useState} from '@hookstate/core';
import {UserInfoDto} from '../../openapi/models';
import {Configuration, UserInfoControllerApi, UserInfoControllerApiInterface} from '../../openapi';
import UserInfoService from './user-info-serivce';
import Config from '../../api/config';

export interface UserInfoState {
  error?: any,
  userInfo?: UserInfoDto
}

const userInfoState = createState<UserInfoState>({
  error: undefined,
  userInfo: undefined
});

export const wrapState = (state: State<UserInfoState>, userInfoApi: UserInfoControllerApiInterface): UserInfoService => {
  return new UserInfoService(state, userInfoApi);
}

export const useUserInfoState = ():UserInfoService => wrapState(useState(userInfoState),
    new UserInfoControllerApi(new Configuration({
      basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
    })));
