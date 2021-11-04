import {createState, State, useState} from '@hookstate/core';
import {UserInfoDto} from '../../openapi/models';
import {Configuration, UserInfoControllerApi, UserInfoControllerApiInterface} from '../../openapi';
import UserInfoService from './user-info-serivce';
import Config from '../../api/config';
import { openapiAxiosInstance } from '../../api/openapi-axios';

export interface UserInfoState {
  error?: any,
  userInfo?: UserInfoDto
}

const userInfoState = createState<UserInfoState>({
  error: undefined,
  userInfo: undefined
});

const api = new UserInfoControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}), '', openapiAxiosInstance);

export const wrapState = (state: State<UserInfoState>, userInfoApi: UserInfoControllerApiInterface): UserInfoService => {
  return new UserInfoService(state, userInfoApi);
}

export const useUserInfoState = (): UserInfoService => wrapState(useState(userInfoState), api);
export const accessUserInfoState = () => wrapState(userInfoState, api);